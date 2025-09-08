"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { useEffect, useState } from "react";
import { adminApi } from "@/services/api";
import { User } from "@/types";
import { CreateEmployeeForm } from "@/components/admin/CreateEmployeeForm";
import { EmployeesTable } from "@/components/admin/EmployeesTable";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function UsersPage() {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);


  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.getUsers();
      setUsers(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load users");
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreate = async (userData: Omit<User, "id">) => {
    try {
      const newUser = await adminApi.createUser(userData);
      setUsers((prev) => [...prev, newUser]);
      toast({
        title: "Success",
        description: "User created successfully",
      });
    } catch (e) {
      toast({
        title: "Error",
        description: e instanceof Error ? e.message : "Failed to create user",
        variant: "destructive",
      });
      throw e; // Re-throw to be handled by the form
    }
  };

  const handleDelete = async (userId: string) => {
    setUserToDelete(userId);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;

    try {
      await adminApi.deleteUser(userToDelete);
      setUsers((prev) => prev.filter((user) => user.id !== userToDelete));
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
    } catch (e) {
      toast({
        title: "Error",
        description: e instanceof Error ? e.message : "Failed to delete user",
        variant: "destructive",
      });
    } finally {
      setUserToDelete(null);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
  };

  const handleUpdate = async (userData: Omit<User, "id">) => {
    if (!editingUser) return;

    try {
      const updatedUser = await adminApi.updateUser(
        editingUser.id,
        userData
      );
      setUsers((prev) =>
        prev.map((user) => (user.id === editingUser.id ? updatedUser : user))
      );
      setEditingUser(null);
      toast({
        title: "Success",
        description: "User updated successfully",
      });
    } catch (e) {
      toast({
        title: "Error",
        description: e instanceof Error ? e.message : "Failed to update user",
        variant: "destructive",
      });
      throw e;
    }
  };

  return (
    <ErrorBoundary>
      <ProtectedRoute requiredRole="admin">
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Employee Management</h1>
            </div>

            <div className="grid gap-6">
              {/* Create Employee Form */}
              <CreateEmployeeForm onSubmit={handleCreate} />

              {/* Employees Table */}
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="p-6">
                  <h2 className="text-lg font-semibold mb-4">Employees</h2>
                  {loading ? (
                    <div className="flex justify-center py-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
                    </div>
                  ) : error ? (
                    <div className="bg-red-50 text-red-700 p-4 rounded-md">
                      {error}
                    </div>
                  ) : (
                    <EmployeesTable
                      users={users}
                      onDelete={handleDelete}
                      onEdit={handleEdit}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Delete Confirmation Dialog */}
          <AlertDialog
            open={!!userToDelete}
            onOpenChange={() => setUserToDelete(null)}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the
                  user account and remove their data from the system.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={confirmDelete}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Edit User Dialog */}
          <Dialog
            open={!!editingUser}
            onOpenChange={() => setEditingUser(null)}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Employee</DialogTitle>
                <DialogDescription>
                  Update the employee&apos;s information.
                </DialogDescription>
              </DialogHeader>
              {editingUser && (
                <CreateEmployeeForm
                  onSubmit={handleUpdate}
                  initialData={editingUser}
                />
              )}
            </DialogContent>
          </Dialog>

          <Toaster />
        </div>
      </ProtectedRoute>
    </ErrorBoundary>
  );
}
