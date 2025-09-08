"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGateWebSocket } from "@/hooks/useGateWebSocket";
import {
  fetchZones,
  checkInVisitor,
  checkInSubscriber,
  fetchGateDetails,
} from "@/services/api";
import { Zone } from "@/types/zone";
import { TicketData } from "@/types";
import { GateHeader } from "../../../components/gate/GateHeader";
import { ZoneGrid } from "../../../components/gate/ZoneGrid";
import { CheckInForm } from "../../../components/gate/CheckInForm";
import { SubscriptionCheckInForm } from "../../../components/gate/SubscriptionCheckInForm";
import { TicketModal } from "../../../components/gate/TicketModal";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function GatePage() {
  const { gateId } = useParams<{ gateId: string }>();
  const [activeTab, setActiveTab] = useState<"visitor" | "subscriber">(
    "visitor"
  );
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [ticket, setTicket] = useState<TicketData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [gateName, setGateName] = useState<string>("Loading...");

  const handleTabChange = (value: string) => {
    setActiveTab(value as "visitor" | "subscriber");
    setError(null);
  };

  // Use WebSocket for real-time updates
  const {
    zones: wsZones,
    isConnected,
    error: wsError,
    refreshZones,
  } = useGateWebSocket(gateId);
  const [zones, setZones] = useState<Zone[]>([]);

  // Fetch initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true);

        // Fetch gate details
        const gateDetails = await fetchGateDetails(gateId);
        setGateName(gateDetails.name || `Gate ${gateId}`);

        // Fetch initial zones
        const initialZones = await fetchZones(gateId);
        setZones(initialZones);
      } catch (error) {
        console.error("Error loading initial data:", error);
        setError("Failed to load gate information. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, [gateId]);

  // Update zones when WebSocket updates come in and keep selectedZone in sync
  useEffect(() => {
    if (wsZones.length === 0) return;

    setZones(wsZones);

    // If no zone is selected, nothing more to do
    if (!selectedZone) return;

    // Find the selected zone in the updated zones
    const updatedZone = wsZones.find((z: Zone) => z.id === selectedZone.id);

    // If the selected zone no longer exists, deselect it
    if (!updatedZone) {
      setSelectedZone(null);
      return;
    }

    // Only update if the zone data has actually changed
    const zoneProps = [
      "availableForVisitors",
      "availableForSubscribers",
      "occupied",
      "open",
    ] as const;
    const hasChanged = zoneProps.some(
      (prop) => selectedZone[prop] !== updatedZone[prop]
    );

    if (hasChanged) {
      setSelectedZone({
        ...updatedZone,
        availableForVisitors: updatedZone.availableForVisitors,
        availableForSubscribers: updatedZone.availableForSubscribers,
        occupied: updatedZone.occupied,
        open: updatedZone.open,
      });
    }
  }, [wsZones, selectedZone]);

  // Handle zone selection - toggles selection on/off when clicking the same zone
  const handleZoneSelect = (zoneId: string | null) => {
    if (!zoneId) {
      setSelectedZone(null);
      return;
    }

    // If clicking the currently selected zone, deselect it
    if (selectedZone?.id === zoneId) {
      setSelectedZone(null);
    } else {
      // Otherwise select the new zone
      const zone = zones.find((z) => z.id === zoneId);
      if (zone) {
        // Create a complete new zone object with all properties
        setSelectedZone({
          ...zone,
          // Explicitly include all properties to ensure nothing is lost
          id: zone.id,
          name: zone.name,
          categoryId: zone.categoryId,
          categoryName: zone.categoryName,
          gateIds: [...(zone.gateIds || [])],
          totalSlots: zone.totalSlots,
          occupied: zone.occupied,
          free: zone.free,
          reserved: zone.reserved,
          reservedSlots: zone.reservedSlots,
          availableSlots: zone.availableSlots,
          availableForVisitors: zone.availableForVisitors,
          availableForSubscribers: zone.availableForSubscribers,
          specialActive: zone.specialActive,
          open: zone.open,
          updatedAt: zone.updatedAt,
          rateNormal: zone.rateNormal,
          rateSpecial: zone.rateSpecial,
        });
      }
    }
  };

  // Handle visitor check-in
  const handleVisitorCheckIn = async (data: {
    licensePlate: string;
    zoneId: string;
  }) => {
    // Get the latest zone data from the zones array
    const currentZone = zones.find((z) => z.id === data.zoneId);
    if (!currentZone) {
      setError("Selected zone not found. Please try again.");
      return;
    }

    // Clear previous errors
    setError(null);

    // Validate zone is open and has available slots using the latest zone data
    if (!currentZone.open) {
      setError("This zone is currently closed. Please select another zone.");
      return;
    }

    if (currentZone.availableForVisitors <= 0) {
      setError(
        "No available visitor spots in this zone. Please select another zone."
      );
      return;
    }

    try {
      setError(null);
      const result = await checkInVisitor({
        gateId,
        zoneId: data.zoneId,
        licensePlate: data.licensePlate,
      });

      // Refresh zones to get the latest availability
      if (refreshZones) {
        await refreshZones();
      }

      setTicket(result.ticket as TicketData);
      setIsModalOpen(true);
      return result;
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to process check-in";
      setError(errorMessage);
      throw err;
    }
  };

  // Handle subscriber check-in
  const handleSubscriberCheckIn = async (data: {
    subscriptionId: string;
    zoneId: string;
  }) => {
    // Get the latest zone data from the zones array
    const currentZone = zones.find((z) => z.id === data.zoneId);
    if (!currentZone) {
      setError("Selected zone not found. Please try again.");
      return;
    }

    // Clear previous errors
    setError(null);

    // Validate zone is open and has available slots using the latest zone data
    if (!currentZone.open) {
      setError("This zone is currently closed. Please select another zone.");
      return;
    }

    if (currentZone.availableForSubscribers <= 0) {
      setError(
        "No available subscriber spots in this zone. Please select another zone."
      );
      return;
    }

    try {
      setError(null);
      const result = await checkInSubscriber({
        gateId,
        zoneId: data.zoneId,
        subscriptionId: data.subscriptionId,
      });

      // Refresh zones to get the latest availability
      if (refreshZones) {
        await refreshZones();
      }

      setTicket(result.ticket as TicketData);
      setIsModalOpen(true);
      return result;
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to process check-in";
      setError(errorMessage);
      throw err;
    }
  };

  // Handle WebSocket errors
  useEffect(() => {
    if (wsError) {
      setError(`Connection error: ${wsError}`);
    }
  }, [wsError]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <GateHeader
          gateId={gateId}
          gateName={gateName}
          isConnected={isConnected}
          lastUpdated={new Date().toISOString()}
          onRefresh={() => window.location.reload()}
          className="mb-8"
        />

        {wsError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Connection error: {wsError}. Some data may not be up to date.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Available Zones</h2>
            {isLoading && !zones.length ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="h-40 bg-gray-200 rounded-lg animate-pulse" />
                <div className="h-40 bg-gray-200 rounded-lg animate-pulse" />
                <div className="h-40 bg-gray-200 rounded-lg animate-pulse" />
              </div>
            ) : (
              <ZoneGrid
                zones={zones}
                selectedZone={selectedZone?.id || null}
                onSelectZone={handleZoneSelect}
                isVisitor={activeTab === "visitor"}
                className="mb-6"
              />
            )}
          </div>

          <div className="space-y-6">
            <Tabs
              value={activeTab}
              onValueChange={handleTabChange}
              className="space-y-6 "
            >
              <div className=" flex flex-col justify-between items-start sm:items-center gap-4">
                <TabsList className="grid w-full grid-cols-2 max-w-xs">
                  <TabsTrigger value="visitor">Visitor</TabsTrigger>
                  <TabsTrigger value="subscriber">Subscriber</TabsTrigger>
                </TabsList>

                <div className="text-sm text-gray-500">
                  {activeTab === "visitor"
                    ? "Select a zone and enter your license plate"
                    : "Enter your subscription ID and select an available zone"}
                </div>
              </div>

              <TabsContent value="visitor" className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  <div className="lg:sticky lg:top-24">
                    <CheckInForm
                      onSubmit={handleVisitorCheckIn}
                      isSubmitting={isLoading}
                      error={activeTab === "visitor" ? error : undefined}
                      selectedZone={selectedZone}
                      className="bg-white p-6 rounded-lg shadow-sm border h-full"
                      isVisitor={activeTab === "visitor"}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="subscriber" className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  <div className="lg:sticky lg:top-24">
                    <SubscriptionCheckInForm
                      onSubmit={handleSubscriberCheckIn}
                      isSubmitting={isLoading}
                      error={activeTab === "subscriber" ? error : undefined}
                      selectedZone={selectedZone}
                      className="bg-white p-6 rounded-lg shadow-sm border h-full"
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {ticket && (
          <TicketModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            ticket={ticket}
          />
        )}
      </div>
    </div>
  );
}
