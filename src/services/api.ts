import {
  AuthResponse,
  Category,
  Zone,
  Gate,
  Subscription,
  Ticket,
  CheckinRequest,
  CheckinResponse,
  CheckoutRequest,
  CheckoutResponse,
  RushHour,
  Vacation,
  ParkingStateReport,
  User,
  ApiError as ApiErrorType,
} from "@/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";

class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public errors?: Record<string, string[]>
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData: ApiErrorType = await response.json();
    throw new ApiError(response.status, errorData.message, errorData.errors);
  }
  return response.json();
}

function getAuthHeaders(token?: string): HeadersInit {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

// Auth API
export const authApi = {
  login: async (username: string, password: string): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ username, password }),
    });
    return handleResponse<AuthResponse>(response);
  },
};

// Master Data API
export const masterApi = {
  getGates: async (): Promise<Gate[]> => {
    const response = await fetch(`${API_BASE_URL}/master/gates`);
    return handleResponse<Gate[]>(response);
  },

  getZones: async (gateId?: string): Promise<Zone[]> => {
    const url = gateId
      ? `${API_BASE_URL}/master/zones?gateId=${gateId}`
      : `${API_BASE_URL}/master/zones`;
    const response = await fetch(url);
    return handleResponse<Zone[]>(response);
  },

  getCategories: async (): Promise<Category[]> => {
    const response = await fetch(`${API_BASE_URL}/master/categories`);
    return handleResponse<Category[]>(response);
  },
};

// Subscriptions API
export const subscriptionsApi = {
  getSubscription: async (id: string): Promise<Subscription> => {
    const response = await fetch(`${API_BASE_URL}/subscriptions/${id}`);
    return handleResponse<Subscription>(response);
  },
};

// Tickets API
export const ticketsApi = {
  checkin: async (
    data: CheckinRequest,
    token?: string
  ): Promise<CheckinResponse> => {
    const response = await fetch(`${API_BASE_URL}/tickets/checkin`, {
      method: "POST",
      headers: getAuthHeaders(token),
      body: JSON.stringify(data),
    });
    return handleResponse<CheckinResponse>(response);
  },

  checkout: async (
    data: CheckoutRequest,
    token?: string
  ): Promise<CheckoutResponse> => {
    const response = await fetch(`${API_BASE_URL}/tickets/checkout`, {
      method: "POST",
      headers: getAuthHeaders(token),
      body: JSON.stringify(data),
    });
    return handleResponse<CheckoutResponse>(response);
  },

  getTicket: async (id: string): Promise<Ticket> => {
    const response = await fetch(`${API_BASE_URL}/tickets/${id}`);
    return handleResponse<Ticket>(response);
  },
};

// Admin API
export const adminApi = {
  getParkingState: async (token: string): Promise<ParkingStateReport[]> => {
    const response = await fetch(
      `${API_BASE_URL}/admin/reports/parking-state`,
      {
        headers: getAuthHeaders(token),
      }
    );
    return handleResponse<ParkingStateReport[]>(response);
  },

  updateCategory: async (
    id: string,
    data: Partial<Category>,
    token: string
  ): Promise<Category> => {
    const response = await fetch(`${API_BASE_URL}/admin/categories/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(token),
      body: JSON.stringify(data),
    });
    return handleResponse<Category>(response);
  },

  updateZoneOpen: async (
    id: string,
    open: boolean,
    token: string
  ): Promise<{ zoneId: string; open: boolean }> => {
    const response = await fetch(`${API_BASE_URL}/admin/zones/${id}/open`, {
      method: "PUT",
      headers: getAuthHeaders(token),
      body: JSON.stringify({ open }),
    });
    return handleResponse<{ zoneId: string; open: boolean }>(response);
  },

  createRushHour: async (
    data: Omit<RushHour, "id">,
    token: string
  ): Promise<RushHour> => {
    const response = await fetch(`${API_BASE_URL}/admin/rush-hours`, {
      method: "POST",
      headers: getAuthHeaders(token),
      body: JSON.stringify(data),
    });
    return handleResponse<RushHour>(response);
  },

  createVacation: async (
    data: Omit<Vacation, "id">,
    token: string
  ): Promise<Vacation> => {
    const response = await fetch(`${API_BASE_URL}/admin/vacations`, {
      method: "POST",
      headers: getAuthHeaders(token),
      body: JSON.stringify(data),
    });
    return handleResponse<Vacation>(response);
  },

  getSubscriptions: async (token: string): Promise<Subscription[]> => {
    const response = await fetch(`${API_BASE_URL}/admin/subscriptions`, {
      headers: getAuthHeaders(token),
    });
    return handleResponse<Subscription[]>(response);
  },

  getUsers: async (token: string): Promise<User[]> => {
    const response = await fetch(`${API_BASE_URL}/admin/users`, {
      headers: getAuthHeaders(token),
    });
    return handleResponse<User[]>(response);
  },

  createUser: async (data: Omit<User, "id">, token: string): Promise<User> => {
    const response = await fetch(`${API_BASE_URL}/admin/users`, {
      method: "POST",
      headers: getAuthHeaders(token),
      body: JSON.stringify(data),
    });
    return handleResponse<User>(response);
  },
};

export { ApiError };
