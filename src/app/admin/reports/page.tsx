"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { useEffect, useState } from "react";
import { adminApi } from "@/services/api";
import { ParkingStateReport } from "@/types";
import { useAuth } from "@/hooks/useAuth";

export default function AdminReportsPage() {
  const { user } = useAuth();
  const [data, setData] = useState<ParkingStateReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token") || "";
        const res = await adminApi.getParkingState(token);
        setData(res);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load report");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  return (
    <ErrorBoundary>
      <ProtectedRoute requiredRole="admin">
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-2xl font-bold mb-6">Parking State Report</h1>
            {loading && <p>Loading...</p>}
            {error && <p className="text-red-600">{error}</p>}
            {!loading && !error && (
              <div className="overflow-x-auto bg-white rounded-lg shadow">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Zone
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Occupied
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Free
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Reserved
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Avail. Visitors
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Avail. Subscribers
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Subscribers
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Open
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.map((z) => (
                      <tr key={z.zoneId}>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {z.name}
                        </td>
                        <td className="px-4 py-3">{z.totalSlots}</td>
                        <td className="px-4 py-3">{z.occupied}</td>
                        <td className="px-4 py-3">{z.free}</td>
                        <td className="px-4 py-3">{z.reserved}</td>
                        <td className="px-4 py-3">{z.availableForVisitors}</td>
                        <td className="px-4 py-3">
                          {z.availableForSubscribers}
                        </td>
                        <td className="px-4 py-3">{z.subscriberCount}</td>
                        <td className="px-4 py-3">{z.open ? "Yes" : "No"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </ProtectedRoute>
    </ErrorBoundary>
  );
}
