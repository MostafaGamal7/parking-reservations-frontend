"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { useEffect, useState } from "react";
import { adminApi, masterApi } from "@/services/api";
import { Category } from "@/types";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

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
  }, []);

  const handleSave = async (cat: Category) => {
    try {
      setSavingId(cat.id);
      const token = localStorage.getItem("token") || "";
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
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to save category");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <ErrorBoundary>
      <ProtectedRoute requiredRole="admin">
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-2xl font-bold mb-6">Categories</h1>
            {loading && <p>Loading...</p>}
            {error && <p className="text-red-600">{error}</p>}
            {!loading && !error && (
              <div className="space-y-4">
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    className="bg-white rounded-lg shadow p-4 grid grid-cols-1 md:grid-cols-4 gap-3 items-center"
                  >
                    <input
                      className="border rounded px-2 py-1"
                      value={cat.name}
                      onChange={(e) =>
                        setCategories((prev) =>
                          prev.map((c) =>
                            c.id === cat.id ? { ...c, name: e.target.value } : c
                          )
                        )
                      }
                    />
                    <input
                      className="border rounded px-2 py-1"
                      value={cat.rateNormal}
                      type="number"
                      step="0.01"
                      onChange={(e) =>
                        setCategories((prev) =>
                          prev.map((c) =>
                            c.id === cat.id
                              ? { ...c, rateNormal: parseFloat(e.target.value) }
                              : c
                          )
                        )
                      }
                    />
                    <input
                      className="border rounded px-2 py-1"
                      value={cat.rateSpecial}
                      type="number"
                      step="0.01"
                      onChange={(e) =>
                        setCategories((prev) =>
                          prev.map((c) =>
                            c.id === cat.id
                              ? {
                                  ...c,
                                  rateSpecial: parseFloat(e.target.value),
                                }
                              : c
                          )
                        )
                      }
                    />
                    <button
                      className="bg-blue-600 text-white rounded px-3 py-1 disabled:opacity-50"
                      onClick={() => handleSave(cat)}
                      disabled={savingId === cat.id}
                    >
                      {savingId === cat.id ? "Saving..." : "Save"}
                    </button>
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
