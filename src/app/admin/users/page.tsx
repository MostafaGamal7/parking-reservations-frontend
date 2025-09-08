"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { useEffect, useState } from "react";
import { adminApi } from "@/services/api";
import { User } from "@/types";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<Omit<User, "id">>({
    username: "",
    name: "",
    role: "employee",
  } as any);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") || "" : "";

  const reload = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.getUsers(token);
      setUsers(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreate = async () => {
    try {
      setCreating(true);
      const newUser = await adminApi.createUser(form as any, token);
      setForm({ username: "", name: "", role: "employee" } as any);
      setUsers((prev) => [...prev, newUser]);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to create user");
    } finally {
      setCreating(false);
    }
  };

  return (
    <ErrorBoundary>
      <ProtectedRoute requiredRole="admin">
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-2xl font-bold mb-6">Employees</h1>
            {loading && <p>Loading...</p>}
            {error && <p className="text-red-600">{error}</p>}

            <div className="bg-white rounded-lg shadow p-4 mb-6">
              <h2 className="font-semibold mb-3">Create Employee/Admin</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <input
                  className="border rounded px-2 py-1"
                  placeholder="Username"
                  value={(form as any).username}
                  onChange={(e) =>
                    setForm({ ...form, username: e.target.value } as any)
                  }
                />
                <input
                  className="border rounded px-2 py-1"
                  placeholder="Name"
                  value={(form as any).name}
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value } as any)
                  }
                />
                <select
                  className="border rounded px-2 py-1"
                  value={(form as any).role}
                  onChange={(e) =>
                    setForm({ ...form, role: e.target.value as any } as any)
                  }
                >
                  <option value="employee">employee</option>
                  <option value="admin">admin</option>
                </select>
                <button
                  className="bg-blue-600 text-white rounded px-3 py-1 disabled:opacity-50"
                  onClick={handleCreate}
                  disabled={creating}
                >
                  {creating ? "Creating..." : "Create"}
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Username
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td className="px-4 py-2">{u.username}</td>
                      <td className="px-4 py-2">{u.name}</td>
                      <td className="px-4 py-2">{u.role}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    </ErrorBoundary>
  );
}
