"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useWebSocket } from "@/services/websocket";
import { getJson, postJson } from "@/lib/api";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { TicketLookupForm } from "@/components/checkpoint/TicketLookupForm";
import { TicketDetails } from "@/components/checkpoint/TicketDetails";
import { Button } from "@/components/ui/button";
import { LogOut, Ticket, Wifi, WifiOff, RefreshCw } from "lucide-react";
import type { Car, Ticket as TicketType, CheckoutResponse } from "@/types";

interface Ticket extends Omit<TicketType, "gateId"> {
  zoneName?: string; // Extended field for display
}

interface SubscriptionDetails {
  id: string;
  userName: string;
  cars: Car[];
  expiresAt: string;
  active?: boolean;
  currentCheckins?: Array<{
    ticketId: string;
    zoneId: string;
    checkinAt: string;
  }>;
}

interface TicketUpdateMessage {
  type: "ticket-update";
  payload: {
    ticketId: string;
    [key: string]: unknown;
  };
}

type WebSocketMessage =
  | TicketUpdateMessage
  | { type: string; payload: unknown };

// TicketDetails component props are defined in its own file

export default function CheckpointPage() {
  const router = useRouter();
  const { logout } = useAuth();
  // State
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionDetails | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<
    "connected" | "connecting" | "disconnected"
  >("disconnected");
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [breakdown, setBreakdown] = useState<CheckoutResponse["breakdown"]>([]);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [durationHours, setDurationHours] = useState<number>(0);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  console.log("subscription", subscription);

  // Refs
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // WebSocket hooks
  const {
    client,
    isConnected,
    subscribe,
    unsubscribe,
    addEventListener,
    getConnectionState,
  } = useWebSocket();

  // Fetch ticket function with error handling
  const fetchTicket = useCallback(
    async (ticketId: string): Promise<Ticket | null> => {
      try {
        const ticket = await getJson<Ticket>(`/tickets/${ticketId}`);
        if (!ticket) {
          throw new Error("Ticket not found");
        }
        return ticket;
      } catch (err) {
        console.error("Error fetching ticket:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch ticket");
        return null;
      }
    },
    []
  );

  // Removed preview listener to avoid hitting checkout endpoint during lookup

  // Handle WebSocket connection state changes
  useEffect(() => {
    if (!client) return;

    const handleConnectionChange = () => {
      // If we just connected and have a ticket, resubscribe to updates
      if (client.isConnected() && ticket?.id) {
        subscribe(`ticket:${ticket.id}`);
      }
    };

    client.addEventListener(handleConnectionChange);
    return () => {
      client.removeEventListener(handleConnectionChange);
      // Clean up any active subscriptions when component unmounts
      if (ticket?.id) {
        unsubscribe(`ticket:${ticket.id}`);
      }
    };
  }, [client, ticket?.id, subscribe, unsubscribe]);

  // Define a more specific type for ticket update messages
  interface TicketUpdatePayload {
    ticketId: string;
    [key: string]: unknown;
  }

  // Handle WebSocket messages
  useEffect(() => {
    if (!ticket?.id) return;

    const handleMessage = (message: WebSocketMessage) => {
      try {
        if (message.type === "ticket-update") {
          const payload = message.payload as TicketUpdatePayload;
          if (payload?.ticketId === ticket.id) {
            console.log("Received ticket update:", payload);
            // Refresh ticket data when we receive an update
            fetchTicket(ticket.id)
              .then((updatedTicket) => {
                if (updatedTicket) {
                  setTicket(updatedTicket);
                  setLastUpdate(new Date());
                }
              })
              .catch((error: Error) => {
                console.error("Error fetching updated ticket:", error);
                setError(`Failed to refresh ticket: ${error.message}`);
              });
          }
        }
      } catch (error) {
        console.error("Error processing WebSocket message:", error);
      }
    };

    // Only subscribe if we're connected and have a valid ticket ID
    if (isConnected && ticket?.id) {
      const subscriptionId = `ticket:${ticket.id}`;
      console.log("Subscribing to:", subscriptionId);
      subscribe(subscriptionId);
    }

    // Add the message handler
    addEventListener(handleMessage);

    return () => {
      // Clean up subscription when ticket changes or component unmounts
      if (isConnected && ticket?.id) {
        const subscriptionId = `ticket:${ticket.id}`;
        console.log("Unsubscribing from:", subscriptionId);
        unsubscribe(subscriptionId);
      }
    };
  }, [
    ticket?.id,
    subscribe,
    unsubscribe,
    addEventListener,
    fetchTicket,
    isConnected,
  ]);

  // Handle WebSocket connection status changes
  useEffect(() => {
    const updateConnectionStatus = () => {
      const state = getConnectionState();
      // Use string comparison since we can't access WebSocket.OPEN directly here
      setConnectionStatus(
        state === 1
          ? "connected" // WebSocket.OPEN
          : state === 0
          ? "connecting"
          : "disconnected" // WebSocket.CONNECTING
      );
    };

    // Initial status
    updateConnectionStatus();

    // Subscribe to connection status changes
    const interval = setInterval(updateConnectionStatus, 5000);

    return () => clearInterval(interval);
  }, [getConnectionState]);

  // Subscribe to ticket updates when a ticket is loaded
  useEffect(() => {
    if (ticket?.id) {
      // Subscribe to updates for this ticket
      subscribe(`ticket:${ticket.id}`);

      // Set up reconnection if needed
      if (connectionStatus === "disconnected") {
        reconnectTimeoutRef.current = setTimeout(() => {
          if (connectionStatus === "disconnected") {
            subscribe(`ticket:${ticket.id}`);
          }
        }, 5000);
      }

      return () => {
        unsubscribe(`ticket:${ticket.id}`);
      };
    }
  }, [ticket?.id, subscribe, unsubscribe, connectionStatus]);

  const handleLookup = async (ticketId: string) => {
    setError(null);
    setLoading(true);

    try {
      // Unsubscribe from previous ticket updates if any
      if (ticket?.id) {
        unsubscribe(`ticket:${ticket.id}`);
      }

      // Clear any existing ticket data
      setTicket(null);
      setSubscription(null);
      setBreakdown([]);
      setTotalAmount(0);
      setDurationHours(0);
      setSuccessMessage(null);

      // Fetch the ticket data
      const ticketData = await fetchTicket(ticketId);
      if (!ticketData) {
        throw new Error("Ticket not found");
      }

      console.log("ticketData", ticketData);
      setTicket(ticketData);
      setLastUpdate(new Date());

      // Do not call checkout during lookup

      // If subscriber ticket, allow manual subscription lookup when not provided on ticket
      if (ticketData.type === "subscriber" && ticketData.subscriptionId) {
        try {
          const sub = await getJson<SubscriptionDetails>(
            `/subscriptions/${ticketData.subscriptionId}`
          );
          setSubscription(sub);
        } catch (e) {
          console.error("Failed to load subscription details", e);
        }
      } else if (ticketData.type === "subscriber") {
        // no-op: UI will allow entering subscription id if needed
      }

      // Subscribe to updates for this ticket
      if (isConnected) {
        subscribe(`ticket:${ticketId}`);
      }
    } catch (err) {
      console.error("Error looking up ticket:", err);
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
      setTicket(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = useCallback(
    async (forceConvertToVisitor?: boolean): Promise<void> => {
      if (!ticket) return;

      if (ticket.checkoutAt) {
        setError("This ticket has already been checked out");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const result = await postJson<
          CheckoutResponse,
          { ticketId: string; forceConvertToVisitor?: boolean }
        >("/tickets/checkout", {
          ticketId: ticket.id,
          forceConvertToVisitor: !!forceConvertToVisitor,
        });

        // Update checkout summary
        setBreakdown(result.breakdown || []);
        setTotalAmount(result.amount || 0);
        setDurationHours(result.durationHours || 0);

        // Refresh ticket data
        const updatedTicket = await fetchTicket(ticket.id);
        setTicket(updatedTicket);
        setLastUpdate(new Date());
        setSuccessMessage("Checkout completed successfully");
      } catch (err) {
        console.error("Checkout error:", err);
        const errorMessage =
          err instanceof Error
            ? err.message
            : "An unknown error occurred during checkout";
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [ticket, fetchTicket]
  );

  const handleNewLookup = () => {
    if (ticket?.id) {
      unsubscribe(`ticket:${ticket.id}`);
    }
    setTicket(null);
    setSubscription(null);
    setError(null);
    setBreakdown([]);
    setTotalAmount(0);
    setDurationHours(0);
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/checkpoint/login");
    } catch (err) {
      console.error("Error during logout:", err);
      setError("Failed to log out");
    }
  };

  // Check if ticket is already checked out
  const isCheckedOut = !!ticket?.checkoutAt;

  return (
    <ErrorBoundary>
      <ProtectedRoute requiredRole="employee">
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Checkpoint</h1>
                <div className="flex items-center mt-1 text-sm text-gray-500">
                  {connectionStatus === "connected" ? (
                    <>
                      <Wifi className="h-4 w-4 text-green-500 mr-1" />
                      <span>Connected</span>
                    </>
                  ) : connectionStatus === "connecting" ? (
                    <>
                      <RefreshCw className="h-4 w-4 text-yellow-500 mr-1 animate-spin" />
                      <span>Connecting...</span>
                    </>
                  ) : (
                    <>
                      <WifiOff className="h-4 w-4 text-red-500 mr-1" />
                      <span>Disconnected</span>
                    </>
                  )}
                  {lastUpdate && (
                    <span className="ml-4">
                      Last updated: {new Date(lastUpdate).toLocaleTimeString()}
                    </span>
                  )}
                </div>
              </div>
              <div>
                <Button variant="ghost" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </div>
            </div>

            {/* Status Bar */}
            <div className="mb-8 bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600">System Online</span>
                </div>
                <div className="text-sm text-gray-500">
                  Last updated: {new Date().toLocaleTimeString()}
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="space-y-8">
              {ticket ? (
                <div className="space-y-6">
                  {isCheckedOut && (
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg
                            className="h-5 w-5 text-yellow-400"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-yellow-700">
                            This ticket was checked out on{" "}
                            {new Date(
                              ticket?.checkoutAt || ""
                            ).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                      <h2 className="text-lg leading-6 font-medium text-gray-900">
                        Ticket Details
                      </h2>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleNewLookup}
                          disabled={loading}
                        >
                          New Lookup
                        </Button>
                      </div>
                    </div>
                    <TicketDetails
                      ticket={{
                        ...ticket,
                        zoneName: ticket.zoneName || "Unknown Zone", // Ensure zoneName is always defined
                      }}
                      subscription={subscription || undefined}
                      breakdown={breakdown}
                      totalAmount={totalAmount}
                      durationHours={durationHours}
                      error={error || undefined}
                      successMessage={successMessage || undefined}
                      onCheckout={handleCheckout}
                      onNewLookup={handleNewLookup}
                    />
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <Ticket className="h-5 w-5 mr-2" />
                    Ticket Lookup
                  </h2>
                  <TicketLookupForm
                    onLookup={handleLookup}
                    isLoading={loading}
                    error={error}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </ProtectedRoute>
    </ErrorBoundary>
  );
}
