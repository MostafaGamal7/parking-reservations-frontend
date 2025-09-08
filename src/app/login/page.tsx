"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/hooks/redux";
import LoginForm from "@/components/forms/LoginForm";
import { ErrorBoundary } from "@/components/ui/error-boundary";

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const search =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search)
      : null;
  const next = search?.get("next") || null;
  const forcedRole =
    (search?.get("role") as "admin" | "employee" | null) || null;
  useEffect(() => {
    if (!isAuthenticated) return;
    // If a next param exists, prefer it
    if (next) {
      router.push(next);
      return;
    }
    // Otherwise, role-based redirect
    if (user?.role === "admin") {
      router.push("/admin");
    } else {
      router.push("/checkpoint");
    }
  }, [isAuthenticated, user, router, next]);

  const handleLoginSuccess = (role: "employee" | "admin") => {
    if (next) {
      router.push(next);
      return;
    }
    if (role === "admin") {
      router.push("/admin");
    } else {
      router.push("/checkpoint");
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center w-16 h-16 mx-auto bg-blue-600 rounded-full mb-4">
              <svg
                className="h-8 w-8 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              WeLink Cargo
            </h1>
            <p className="text-gray-600">Parking Management System</p>
          </div>

          {/* Login Form */}
          <LoginForm
            onSuccess={handleLoginSuccess}
            defaultRole={forcedRole || "employee"}
          />

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-sm text-gray-500">
              Secure access to your parking management portal
            </p>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
