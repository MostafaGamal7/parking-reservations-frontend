"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { useEffect, useState } from "react";
import { adminApi } from "@/services/api";
import { RushHour, Vacation } from "@/types";
import {
  ToastProvider,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastViewport,
} from "@/components/ui/toast";
import { format } from "date-fns";

export default function SchedulePage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [auditLogs, setAuditLogs] = useState<
    {
      timestamp: string;
      action: string;
      adminId: string;
    }[]
  >([]);
  const [toast, setToast] = useState<{
    open: boolean;
    type: "success" | "error";
    title: string;
    description: string;
  }>({
    open: false,
    type: "success",
    title: "",
    description: "",
  });

  // Form states
  const [rushHour, setRushHour] = useState({
    dayOfWeek: "1",
    startTime: "09:00",
    endTime: "17:00",
  });

  const [vacation, setVacation] = useState({
    name: "",
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    // Subscribe to admin updates for real-time changes
    const ws = new WebSocket("ws://localhost:3000/ws");

    const handleOpen = () => {
      ws.send(
        JSON.stringify({
          type: "subscribe",
          payload: { type: "admin" },
        })
      );
    };

    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "admin-update") {
          // Map action types to readable messages
          const actionMap: Record<string, string> = {
            "rush-updated": "Added rush hour window",
            "vacation-added": "Added vacation period",
            "category-rates-changed": "Updated category rates",
            "zone-closed": "Closed zone",
            "zone-opened": "Opened zone",
          };

          const actionMessage =
            actionMap[data.payload.action] || data.payload.action;

          setAuditLogs((prev) => [
            {
              timestamp: data.payload.timestamp || new Date().toISOString(),
              action: actionMessage,
              adminId: data.payload.adminId,
            },
            ...prev,
          ]);
        }
      } catch (error) {
        console.error("Error processing WebSocket message:", error);
      }
    };

    const handleError = (error: Event) => {
      console.error("WebSocket error:", error);
      setError("WebSocket connection error");
    };

    const handleClose = () => {
      // Attempt to reconnect after 5 seconds
      setTimeout(() => {
        setError("Reconnecting to WebSocket...");
      }, 5000);
    };

    ws.addEventListener("open", handleOpen);
    ws.addEventListener("message", handleMessage);
    ws.addEventListener("error", handleError);
    ws.addEventListener("close", handleClose);

    return () => {
      ws.removeEventListener("open", handleOpen);
      ws.removeEventListener("message", handleMessage);
      ws.removeEventListener("error", handleError);
      ws.removeEventListener("close", handleClose);
      ws.close();
    };
  }, []);

  const handleRushHourSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const token = localStorage.getItem("welink_auth_token") || "";
      await adminApi.createRushHour(
        {
          dayOfWeek: parseInt(rushHour.dayOfWeek),
          startTime: rushHour.startTime,
          endTime: rushHour.endTime,
        },
        token
      );

      // Add to audit log immediately
      const days = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ];
      setAuditLogs((prev) => [
        {
          timestamp: new Date().toISOString(),
          action: `Added rush hour: ${days[parseInt(rushHour.dayOfWeek) - 1]} ${
            rushHour.startTime
          }-${rushHour.endTime}`,
          adminId: "You",
        },
        ...prev,
      ]);

      setToast({
        open: true,
        type: "success",
        title: "Rush Hour Added",
        description: "Successfully added new rush hour window",
      });
      // Reset form
      setRushHour({
        dayOfWeek: "1",
        startTime: "09:00",
        endTime: "17:00",
      });
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Failed to add rush hour";
      setToast({
        open: true,
        type: "error",
        title: "Error",
        description: message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVacationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const token = localStorage.getItem("welink_auth_token") || "";
      await adminApi.createVacation(
        {
          name: vacation.name,
          startDate: new Date(vacation.startDate).toISOString(),
          endDate: new Date(vacation.endDate).toISOString(),
        },
        token
      );

      // Add to audit log immediately
      setAuditLogs((prev) => [
        {
          timestamp: new Date().toISOString(),
          action: `Added vacation: ${vacation.name} (${vacation.startDate} to ${vacation.endDate})`,
          adminId: "You",
        },
        ...prev,
      ]);

      setToast({
        open: true,
        type: "success",
        title: "Vacation Added",
        description: "Successfully added new vacation period",
      });
      // Reset form
      setVacation({
        name: "",
        startDate: "",
        endDate: "",
      });
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to add vacation";
      setToast({
        open: true,
        type: "error",
        title: "Error",
        description: message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToastProvider>
      <ErrorBoundary>
        <ProtectedRoute requiredRole="admin">
          <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Rush Hours Form */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-semibold mb-4">
                    Add Rush Hour Window
                  </h2>
                  <form onSubmit={handleRushHourSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Day of Week
                      </label>
                      <select
                        value={rushHour.dayOfWeek}
                        onChange={(e) =>
                          setRushHour((prev) => ({
                            ...prev,
                            dayOfWeek: e.target.value,
                          }))
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      >
                        <option value="1">Monday</option>
                        <option value="2">Tuesday</option>
                        <option value="3">Wednesday</option>
                        <option value="4">Thursday</option>
                        <option value="5">Friday</option>
                        <option value="6">Saturday</option>
                        <option value="7">Sunday</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Start Time
                        </label>
                        <input
                          type="time"
                          value={rushHour.startTime}
                          onChange={(e) =>
                            setRushHour((prev) => ({
                              ...prev,
                              startTime: e.target.value,
                            }))
                          }
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          End Time
                        </label>
                        <input
                          type="time"
                          value={rushHour.endTime}
                          onChange={(e) =>
                            setRushHour((prev) => ({
                              ...prev,
                              endTime: e.target.value,
                            }))
                          }
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      {loading ? "Adding..." : "Add Rush Hour"}
                    </button>
                  </form>
                </div>

                {/* Vacation Form */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-semibold mb-4">
                    Add Vacation Period
                  </h2>
                  <form onSubmit={handleVacationSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Vacation Name
                      </label>
                      <input
                        type="text"
                        value={vacation.name}
                        onChange={(e) =>
                          setVacation((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-1"
                        placeholder="e.g., Christmas Break"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Start Date
                        </label>
                        <input
                          type="date"
                          value={vacation.startDate}
                          onChange={(e) =>
                            setVacation((prev) => ({
                              ...prev,
                              startDate: e.target.value,
                            }))
                          }
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          End Date
                        </label>
                        <input
                          type="date"
                          value={vacation.endDate}
                          onChange={(e) =>
                            setVacation((prev) => ({
                              ...prev,
                              endDate: e.target.value,
                            }))
                          }
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      {loading ? "Adding..." : "Add Vacation"}
                    </button>
                  </form>
                </div>

                {/* Audit Log */}
                <div className="lg:col-span-2">
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-xl font-semibold mb-4">
                      Admin Activity Log
                    </h2>
                    <div className="space-y-2">
                      {auditLogs.map((log, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                            <div className="text-sm">
                              <span className="font-medium">{log.action}</span>
                              <span className="text-gray-500">
                                {" "}
                                by {log.adminId}
                              </span>
                            </div>
                          </div>
                          <div className="text-sm text-gray-500">
                            {format(
                              new Date(log.timestamp),
                              "MMM d, yyyy HH:mm:ss"
                            )}
                          </div>
                        </div>
                      ))}
                      {auditLogs.length === 0 && (
                        <p className="text-gray-500 text-center py-4">
                          No recent activity
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Toasts */}
            <Toast
              open={toast.open}
              onOpenChange={(open) => setToast((prev) => ({ ...prev, open }))}
              variant={toast.type === "error" ? "destructive" : "default"}
            >
              <ToastTitle>{toast.title}</ToastTitle>
              <ToastDescription>{toast.description}</ToastDescription>
            </Toast>
            <ToastViewport />
          </div>
        </ProtectedRoute>
      </ErrorBoundary>
    </ToastProvider>
  );
}
