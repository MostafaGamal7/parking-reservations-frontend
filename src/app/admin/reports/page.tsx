"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { useEffect, useState, useMemo } from "react";
import { adminApi } from "@/services/api";
import {
  ParkingStateReport,
  WebSocketMessage,
  AdminUpdateMessage,
} from "@/types";
import { useAuth } from "@/hooks/useAuth";
import { useWebSocket } from "@/services/websocket";
import { Badge } from "@/components/ui/badge";
import { ZoneStatusControl } from "@/components/admin/ZoneStatusControl";
import { Toaster } from "@/components/ui/toaster";

export default function AdminReportsPage() {
  const { user } = useAuth();
  const [data, setData] = useState<ParkingStateReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<keyof ParkingStateReport>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [auditLog, setAuditLog] = useState<AdminUpdateMessage["payload"][]>([]);
  const { client: ws, isConnected } = useWebSocket();

  // Calculate summary statistics
  const summary = useMemo(() => {
    if (!data.length) return null;
    return {
      totalSlots: data.reduce((sum, zone) => sum + zone.totalSlots, 0),
      totalOccupied: data.reduce((sum, zone) => sum + zone.occupied, 0),
      totalFree: data.reduce((sum, zone) => sum + zone.free, 0),
      totalReserved: data.reduce((sum, zone) => sum + zone.reserved, 0),
      totalSubscribers: data.reduce(
        (sum, zone) => sum + zone.subscriberCount,
        0
      ),
      activeZones: data.filter((zone) => zone.open).length,
      occupancyRate: Math.round(
        (data.reduce((sum, zone) => sum + zone.occupied, 0) /
          data.reduce((sum, zone) => sum + zone.totalSlots, 0)) *
          100
      ),
    };
  }, [data]);

  const fetchParkingState = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("welink_auth_token") || "";
      const res = await adminApi.getParkingState(token);
      setData(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load report");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParkingState();
  }, []);

  // Set up WebSocket handlers
  useEffect(() => {
    if (!ws) return;

    const handleMessage = (message: WebSocketMessage) => {
      if (message.type === "zone-update") {
        // Refresh the parking state when zones are updated
        fetchParkingState();
      } else if (message.type === "admin-update") {
        // Add to audit log
        setAuditLog((prev) =>
          [message.payload as AdminUpdateMessage["payload"], ...prev].slice(
            0,
            10
          )
        );
        // Refresh the parking state
        fetchParkingState();
      }
    };

    const unsubscribe = ws.addEventListener(handleMessage);
    return () => {
      unsubscribe();
    };
  }, [ws]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!data.length) return [];
    return [...data].sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      const modifier = sortOrder === "asc" ? 1 : -1;

      if (typeof aValue === "boolean") {
        return modifier * (aValue === bValue ? 0 : aValue ? -1 : 1);
      }

      if (typeof aValue === "number" && typeof bValue === "number") {
        return modifier * (aValue - bValue);
      }

      return modifier * String(aValue).localeCompare(String(bValue));
    });
  }, [data, sortBy, sortOrder]);

  const handleSort = (column: keyof ParkingStateReport) => {
    if (sortBy === column) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  const getOccupancyColor = (occupied: number, total: number) => {
    const ratio = occupied / total;
    if (ratio >= 0.9) return "text-red-600";
    if (ratio >= 0.7) return "text-yellow-600";
    return "text-green-600";
  };

  return (
    <ErrorBoundary>
      <ProtectedRoute requiredRole="admin">
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header with connection status */}
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Parking State Report</h1>
              <Badge variant={isConnected ? "default" : "destructive"}>
                {isConnected ? "Connected" : "Disconnected"}
              </Badge>
            </div>

            {/* Summary Statistics */}
            {summary && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <h3 className="text-sm font-medium text-gray-500">
                    Total Capacity
                  </h3>
                  <p className="text-2xl font-semibold">{summary.totalSlots}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <h3 className="text-sm font-medium text-gray-500">
                    Current Occupancy
                  </h3>
                  <p className="text-2xl font-semibold">
                    {summary.occupancyRate}%
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <h3 className="text-sm font-medium text-gray-500">
                    Active Zones
                  </h3>
                  <p className="text-2xl font-semibold">
                    {summary.activeZones} / {data.length}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <h3 className="text-sm font-medium text-gray-500">
                    Total Subscribers
                  </h3>
                  <p className="text-2xl font-semibold">
                    {summary.totalSubscribers}
                  </p>
                </div>
              </div>
            )}

            {/* Main Content */}
            <div className="space-y-6">
              {loading && (
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              {!loading && !error && (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          {[
                            { key: "name", label: "Zone" },
                            { key: "totalSlots", label: "Total" },
                            { key: "occupied", label: "Occupied" },
                            { key: "free", label: "Free" },
                            { key: "reserved", label: "Reserved" },
                            {
                              key: "availableForVisitors",
                              label: "Avail. Visitors",
                            },
                            {
                              key: "availableForSubscribers",
                              label: "Avail. Subscribers",
                            },
                            { key: "subscriberCount", label: "Subscribers" },
                            { key: "open", label: "Status" },
                          ].map(({ key, label }) => (
                            <th
                              key={key}
                              onClick={() =>
                                handleSort(key as keyof ParkingStateReport)
                              }
                              className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                            >
                              <div className="flex items-center space-x-1">
                                <span>{label}</span>
                                {sortBy === key && (
                                  <span className="ml-1">
                                    {sortOrder === "asc" ? "↑" : "↓"}
                                  </span>
                                )}
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {sortedData.map((z) => (
                          <tr key={z.zoneId} className="hover:bg-gray-50">
                            <td className="px-4 py-3 whitespace-nowrap font-medium">
                              {z.name}
                            </td>
                            <td className="px-4 py-3">{z.totalSlots}</td>
                            <td
                              className={`px-4 py-3 ${getOccupancyColor(
                                z.occupied,
                                z.totalSlots
                              )}`}
                            >
                              {z.occupied}
                            </td>
                            <td className="px-4 py-3">{z.free}</td>
                            <td className="px-4 py-3">{z.reserved}</td>
                            <td className="px-4 py-3">
                              {z.availableForVisitors}
                            </td>
                            <td className="px-4 py-3">
                              {z.availableForSubscribers}
                            </td>
                            <td className="px-4 py-3">{z.subscriberCount}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-between">
                                <ZoneStatusControl
                                  zoneId={z.zoneId}
                                  isOpen={z.open}
                                  onStatusChange={(isOpen) => {
                                    // The state will be updated via WebSocket
                                    // but we can optimistically update the UI
                                    setData((prev) =>
                                      prev.map((zone) =>
                                        zone.zoneId === z.zoneId
                                          ? { ...zone, open: isOpen }
                                          : zone
                                      )
                                    );
                                  }}
                                  disabled={loading}
                                />
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Audit Log */}
              {auditLog.length > 0 && (
                <div className="mt-8">
                  <h2 className="text-lg font-semibold mb-4">Recent Updates</h2>
                  <div className="bg-white rounded-lg shadow-sm p-4">
                    <ul className="space-y-3">
                      {auditLog.map((log, index) => (
                        <li
                          key={index}
                          className="flex items-start space-x-3 text-sm"
                        >
                          <span className="text-gray-500">
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </span>
                          <span className="font-medium">
                            {log.action.replace(/-/g, " ")}
                          </span>
                          <span className="text-gray-600">
                            {log.targetType} {log.targetId}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <Toaster />
      </ProtectedRoute>
    </ErrorBoundary>
  );
}
