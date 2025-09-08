import { User } from "@/types";

// Mock data based on seed.json
const mockUsers: User[] = [
  {
    id: "admin_1",
    username: "admin",
    name: "Admin",
    role: "admin",
  },
  {
    id: "admin_2",
    username: "superadmin",
    name: "Super Admin",
    role: "admin",
  },
  {
    id: "emp_1",
    username: "emp1",
    name: "Employee One",
    role: "employee",
  },
  {
    id: "emp_2",
    username: "emp2",
    name: "Employee Two",
    role: "employee",
  },
  {
    id: "emp_3",
    username: "emp3",
    name: "Night Shift Employee",
    role: "employee",
  },
  {
    id: "emp_4",
    username: "checkpoint1",
    name: "Checkpoint Alpha",
    role: "employee",
  },
  {
    id: "emp_5",
    username: "checkpoint2",
    name: "Checkpoint Beta",
    role: "employee",
  },
];

// In-memory storage for mock data
let users = [...mockUsers];

export const mockUserService = {
  getUsers: async () => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    return [...users];
  },

  createUser: async (userData: Omit<(typeof mockUsers)[0], "id">) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const newUser = {
      ...userData,
      id: `emp_${Date.now()}`, // Generate a unique ID
    };
    users.push(newUser);
    return newUser;
  },

  updateUser: async (
    userId: string,
    userData: Partial<(typeof mockUsers)[0]>
  ) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const index = users.findIndex((u) => u.id === userId);
    if (index === -1) {
      throw new Error("User not found");
    }
    users[index] = { ...users[index], ...userData };
    return users[index];
  },

  deleteUser: async (userId: string) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const index = users.findIndex((u) => u.id === userId);
    if (index === -1) {
      throw new Error("User not found");
    }
    users = users.filter((u) => u.id !== userId);
  },

  // Helper to reset mock data (useful for testing)
  resetMockData: () => {
    users = [...mockUsers];
  },
};
