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
  Zone as ApiZone,
  Ticket as ApiTicket,
  TicketData,
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
  login: async (credentials: {
    username: string;
    password: string;
    role: string;
  }): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(credentials),
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

// Type for Ticket API response
interface TicketApiResponse {
  id: string;
  zoneId: string;
  type: "visitor" | "subscriber";
  checkinAt: string;
  expiresAt?: string;
  amount?: number;
  qrCode?: string;
  subscriptionId?: string;
  licensePlate?: string;
}

/**
 * Fetches zones for a specific gate
 */
// Convert API Zone to frontend Zone type
const mapApiZoneToZone = (apiZone: ApiZone): Zone => ({
  ...apiZone,
  specialActive: apiZone.specialActive ?? false,
  categoryName:
    "categoryName" in apiZone ? String(apiZone["categoryName"]) : "Unknown",
  updatedAt:
    "updatedAt" in apiZone
      ? String(apiZone["updatedAt"])
      : new Date().toISOString(),
  reservedSlots: "reserved" in apiZone ? Number(apiZone["reserved"]) : 0,
  availableSlots: "free" in apiZone ? Number(apiZone["free"]) : 0,
  // Ensure all required Zone properties are included
  gateIds: apiZone.gateIds || [],
  open: apiZone.open ?? true,
});

export const fetchZones = async (gateId: string): Promise<Zone[]> => {
  try {
    const zones = await masterApi.getZones(gateId);
    return zones.map(mapApiZoneToZone);
  } catch (error) {
    console.error("Failed to fetch zones:", error);
    throw error;
  }
};

/**
 * Checks in a visitor to a zone
 */
// Convert API Ticket to frontend TicketData type
const mapApiTicketToTicketData = (
  apiTicket: ApiTicket,
  zoneName: string
): TicketData => {
  const ticket = apiTicket as unknown as TicketApiResponse;
  return {
    id: ticket.id,
    zoneName: zoneName,
    checkInAt: ticket.checkinAt,
    expiresAt: ticket.expiresAt,
    amount: ticket.amount,
    qrCode: ticket.qrCode,
  };
};

interface CheckInVisitorParams {
  gateId: string;
  zoneId: string;
  licensePlate: string;
}

export const checkInVisitor = async ({
  gateId,
  zoneId,
  licensePlate,
}: CheckInVisitorParams): Promise<{ ticket: TicketData }> => {
  try {
    // First get the zone name
    const zones = await masterApi.getZones(gateId);
    const zone = zones.find((z) => z.id === zoneId);
    if (!zone) {
      throw new Error(`Zone with ID ${zoneId} not found`);
    }

    // Then check in
    const request: CheckinRequest = {
      gateId,
      zoneId,
      type: "visitor",
      licensePlate, // Include license plate in the request
    };

    const response = await ticketsApi.checkin(request);

    // Map the response to the frontend TicketData type
    return {
      ticket: mapApiTicketToTicketData(response.ticket, zone.name),
    };
  } catch (error) {
    console.error("Check-in failed:", error);
    throw error;
  }
};

/**
 * Verifies a subscription and checks in the subscriber
 */
interface CheckInSubscriberParams {
  gateId: string;
  zoneId: string;
  subscriptionId: string;
}

export const checkInSubscriber = async ({
  gateId,
  zoneId,
  subscriptionId,
}: CheckInSubscriberParams): Promise<{ ticket: TicketData }> => {
  try {
    // Get zones and verify subscription in parallel
    const [zones] = await Promise.all([
      masterApi.getZones(gateId),
      subscriptionsApi.getSubscription(subscriptionId), // Verify subscription exists
    ]);

    const zone = zones.find((z) => z.id === zoneId);
    if (!zone) {
      throw new Error(`Zone with ID ${zoneId} not found`);
    }

    // Then check in the subscriber
    const response = await ticketsApi.checkin({
      gateId,
      zoneId,
      type: "subscriber",
      subscriptionId,
    });

    // Map the response to the frontend TicketData type
    return {
      ticket: {
        ...mapApiTicketToTicketData(response.ticket, zone.name),
        // Preserve the subscriptionId entered by the user, since backend ticket payload may omit it
        subscriptionId,
      },
    };
  } catch (error) {
    console.error("Subscriber check-in failed:", error);
    throw error;
  }
};

/**
 * Fetches subscription details
 */
// Fetch subscription details
// Note: This is a simplified version that just passes through the API response
// You might want to map this to a frontend type if needed
export const fetchSubscription = async (subscriptionId: string) => {
  try {
    return await subscriptionsApi.getSubscription(subscriptionId);
  } catch (error) {
    console.error("Failed to fetch subscription:", error);
    throw error;
  }
};

/**
 * Fetches gate details
 */
// Fetch gate details and include the zones
// This is a more complete version that includes the gate's zones
export const fetchGateDetails = async (gateId: string) => {
  try {
    const [gates, zones] = await Promise.all([
      masterApi.getGates(),
      masterApi.getZones(gateId),
    ]);

    const gate = gates.find((g) => g.id === gateId);
    if (!gate) {
      throw new Error(`Gate with ID ${gateId} not found`);
    }

    // Map the zones to the frontend Zone type
    const gateZones = zones
      .filter((zone) => zone.gateIds?.includes(gateId))
      .map(mapApiZoneToZone);

    return {
      ...gate,
      zones: gateZones,
    };
  } catch (error) {
    console.error("Failed to fetch gate details:", error);
    throw error;
  }
};
