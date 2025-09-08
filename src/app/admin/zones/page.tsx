"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { useEffect, useState } from "react";
import { adminApi, masterApi } from "@/services/api";
import { Zone } from "@/types";

export default function ZonesPage() {
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await masterApi.getZones();
        setZones(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load zones");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const toggleOpen = async (zoneId: string, open: boolean) => {
    try {
      setSaving(zoneId);
      const token = localStorage.getItem("token") || "";
      const res = await adminApi.updateZoneOpen(zoneId, open, token);
      setZones((prev) =>
        prev.map((z) => (z.id === res.zoneId ? { ...z, open: res.open } : z))
      );
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to update zone");
    } finally {
      setSaving(null);
    }
  };

  return (
    <ErrorBoundary>
      <ProtectedRoute requiredRole="admin">
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-2xl font-bold mb-6">Zones</h1>
            {loading && <p>Loading...</p>}
            {error && <p className="text-red-600">{error}</p>}
            {!loading && !error && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {zones.map((z) => (
                  <div key={z.id} className="bg-white rounded-lg shadow p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{z.name}</h3>
                        <p className="text-sm text-gray-500">
                          Occupied {z.occupied} / {z.totalSlots}
                        </p>
                      </div>
                      <button
                        className={`px-3 py-1 rounded text-white ${
                          z.open ? "bg-red-600" : "bg-green-600"
                        } disabled:opacity-50`}
                        onClick={() => toggleOpen(z.id, !z.open)}
                        disabled={saving === z.id}
                      >
                        {saving === z.id
                          ? "Saving..."
                          : z.open
                          ? "Close"
                          : "Open"}
                      </button>
                    </div>
                    <div className="mt-3 grid grid-cols-2 text-sm text-gray-600">
                      <div>
                        Free: <span className="font-medium">{z.free}</span>
                      </div>
                      <div>
                        Reserved:{" "}
                        <span className="font-medium">{z.reserved}</span>
                      </div>
                      <div>
                        Avail. Visitors:{" "}
                        <span className="font-medium">
                          {z.availableForVisitors}
                        </span>
                      </div>
                      <div>
                        Avail. Subscribers:{" "}
                        <span className="font-medium">
                          {z.availableForSubscribers}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </ProtectedRoute>
    </ErrorBoundary>
  );
}
