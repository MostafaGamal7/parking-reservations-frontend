"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { useEffect, useState } from "react";
import { adminApi, masterApi } from "@/services/api";
import { Category } from "@/types";
import {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
} from "@/components/ui/toast";
export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
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

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await masterApi.getCategories();
        setCategories(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load categories");
      } finally {
        setLoading(false);
      }
    };
    run();

    // Subscribe to admin updates for real-time category changes
    const ws = new WebSocket("ws://localhost:3000/ws");
    ws.onopen = () => {
      ws.send(
        JSON.stringify({ type: "subscribe", payload: { type: "admin" } })
      );
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "admin-update" && data.payload.type === "category") {
        setCategories((prev) =>
          prev.map((cat) =>
            cat.id === data.payload.categoryId
              ? { ...cat, ...data.payload.data }
              : cat
          )
        );
      }
    };

    return () => {
      ws.close();
    };
  }, []);

  const handleSave = async (cat: Category) => {
    try {
      setSavingId(cat.id);
      const token = localStorage.getItem("welink_auth_token") || "";
      const updated = await adminApi.updateCategory(
        cat.id,
        {
          rateNormal: cat.rateNormal,
          rateSpecial: cat.rateSpecial,
          name: cat.name,
          description: cat.description,
        },
        token
      );
      setCategories((prev) =>
        prev.map((c) => (c.id === updated.id ? updated : c))
      );
      setToast({
        open: true,
        type: "success",
        title: "Category Updated",
        description: `Successfully updated rates for ${cat.name}`,
      });
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Failed to save category";
      setToast({
        open: true,
        type: "error",
        title: "Error",
        description: message,
      });
    } finally {
      setSavingId(null);
    }
  };

  return (
    <ErrorBoundary>
      <ProtectedRoute requiredRole="admin">
        <ToastProvider>
          <div className="min-h-screen bg-gray-50">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <h1 className="text-2xl font-bold mb-6">Rate Categories</h1>
              {loading && <p>Loading...</p>}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-4 mb-6">
                  {error}
                </div>
              )}
              {!loading && !error && (
                <div className="space-y-6">
                  <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    {/* Header */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center bg-gray-50 p-4 border-b">
                      <div className="font-medium text-gray-700">
                        Category Name
                      </div>
                      <div className="font-medium text-gray-700">
                        Normal Rate ($)
                      </div>
                      <div className="font-medium text-gray-700">
                        Special Rate ($)
                      </div>
                      <div></div>
                    </div>

                    {/* Categories List */}
                    <div className="divide-y">
                      {categories.map((cat) => (
                        <div
                          key={cat.id}
                          className="p-4 grid grid-cols-1 md:grid-cols-4 gap-3 items-center hover:bg-gray-50"
                        >
                          <div>
                            <input
                              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              value={cat.name}
                              placeholder="Category Name"
                              aria-label="Category Name"
                              onChange={(e) =>
                                setCategories((prev) =>
                                  prev.map((c) =>
                                    c.id === cat.id
                                      ? { ...c, name: e.target.value }
                                      : c
                                  )
                                )
                              }
                            />
                            <p className="mt-1 text-sm text-gray-500">
                              {cat.description}
                            </p>
                          </div>
                          <div>
                            <input
                              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              value={cat.rateNormal}
                              type="number"
                              min="0"
                              step="0.01"
                              aria-label="Normal Rate"
                              onChange={(e) =>
                                setCategories((prev) =>
                                  prev.map((c) =>
                                    c.id === cat.id
                                      ? {
                                          ...c,
                                          rateNormal:
                                            parseFloat(e.target.value) || 0,
                                        }
                                      : c
                                  )
                                )
                              }
                            />
                            <p className="mt-1 text-sm text-gray-500">
                              Regular hours rate
                            </p>
                          </div>
                          <div>
                            <input
                              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              value={cat.rateSpecial}
                              type="number"
                              min="0"
                              step="0.01"
                              aria-label="Special Rate"
                              onChange={(e) =>
                                setCategories((prev) =>
                                  prev.map((c) =>
                                    c.id === cat.id
                                      ? {
                                          ...c,
                                          rateSpecial:
                                            parseFloat(e.target.value) || 0,
                                        }
                                      : c
                                  )
                                )
                              }
                            />
                            <p className="mt-1 text-sm text-gray-500">
                              Rush hours rate
                            </p>
                          </div>
                          <div>
                            <button
                              className="w-full bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600"
                              onClick={() => handleSave(cat)}
                              disabled={savingId === cat.id}
                            >
                              {savingId === cat.id ? (
                                <span className="flex items-center justify-center">
                                  <svg
                                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                  >
                                    <circle
                                      className="opacity-25"
                                      cx="12"
                                      cy="12"
                                      r="10"
                                      stroke="currentColor"
                                      strokeWidth="4"
                                    />
                                    <path
                                      className="opacity-75"
                                      fill="currentColor"
                                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    />
                                  </svg>
                                  Saving...
                                </span>
                              ) : (
                                "Save Changes"
                              )}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Help Text */}
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-blue-700">
                    <h3 className="font-medium mb-2">About Parking Rates</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Normal rates apply during regular hours</li>
                      <li>
                        Special rates apply during rush hours and special events
                      </li>
                      <li>Changes take effect immediately for new tickets</li>
                    </ul>
                  </div>
                </div>
              )}
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
        </ToastProvider>
      </ProtectedRoute>
    </ErrorBoundary>
  );
}
