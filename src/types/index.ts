// API Types for Parking Reservation System

export interface User {
  id: string;
  username: string;
  name: string;
  role: "admin" | "employee";
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  rateNormal: number;
  rateSpecial: number;
}

export interface Zone {
  id: string;
  name: string;
  categoryId: string;
  gateIds: string[];
  totalSlots: number;
  occupied: number;
  free: number;
  reserved: number;
  reservedSlots: number;
  availableSlots: number;
  availableForVisitors: number;
  availableForSubscribers: number;
  rateNormal: number;
  rateSpecial: number;
  open: boolean;
  specialActive?: boolean; // WebSocket field for special rate status
  categoryName?: string; // Optional field for display purposes
  updatedAt?: string; // Optional field for tracking updates
}

export interface Gate {
  id: string;
  name: string;
  zoneIds: string[];
  location: string;
}

export interface Subscription {
  id: string;
  userName: string;
  active: boolean;
  category: string;
  cars: Car[];
  startsAt: string;
  expiresAt: string;
  currentCheckins: CurrentCheckin[];
}

export interface Car {
  plate: string;
  brand: string;
  model: string;
  color: string;
}

export interface CurrentCheckin {
  ticketId: string;
  zoneId: string;
  checkinAt: string;
}

export interface Ticket {
  id: string;
  type: "visitor" | "subscriber";
  zoneId: string;
  gateId: string;
  checkinAt: string;
  checkoutAt?: string;
  subscriptionId?: string;
}

export interface CheckinRequest {
  gateId: string;
  zoneId: string;
  type: "visitor" | "subscriber";
  subscriptionId?: string;
  licensePlate?: string;
}

export interface CheckinResponse {
  ticket: Ticket;
  zoneState: Zone;
}

export interface CheckoutRequest {
  ticketId: string;
  forceConvertToVisitor?: boolean;
}

export interface BreakdownItem {
  from: string;
  to: string;
  hours: number;
  rateMode: "normal" | "special";
  rate: number;
  amount: number;
  description?: string;
  quantity?: number;
  total?: number;
}

export interface CheckoutResponse {
  ticketId: string;
  checkinAt: string;
  checkoutAt: string;
  durationHours: number;
  breakdown: BreakdownItem[];
  amount: number;
  zoneState: Zone;
}

export interface RushHour {
  id: string;
  dayOfWeek: number; // 1-7 where 1 is Monday
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
}

export interface Vacation {
  id: string;
  name: string;
  startDate: string; // ISO date string
  endDate: string; // ISO date string
}

export interface ParkingStateReport {
  zoneId: string;
  name: string;
  totalSlots: number;
  occupied: number;
  free: number;
  reserved: number;
  availableForVisitors: number;
  availableForSubscribers: number;
  subscriberCount: number;
  open: boolean;
}

// WebSocket Types
export interface WebSocketMessage {
  type: "zone-update" | "admin-update";
  payload: Zone | AdminUpdateMessage["payload"];
}

export interface ZoneUpdateMessage {
  type: "zone-update";
  payload: Zone;
}

export interface AdminUpdateMessage {
  type: "admin-update";
  payload: {
    adminId: string;
    action:
      | "category-rates-changed"
      | "zone-closed"
      | "zone-opened"
      | "vacation-added"
      | "rush-updated";
    targetType: "category" | "zone" | "vacation" | "rush";
    targetId: string;
    details?: Record<string, unknown>;
    timestamp: string;
  };
}

// API Error Response
export interface ApiError {
  status: "error";
  message: string;
  errors?: Record<string, string[]>;
}

// Form Types
export interface LoginForm {
  username: string;
  password: string;
}

export interface SubscriptionForm {
  subscriptionId: string;
}

export interface TicketLookupForm {
  ticketId: string;
}

// Component Props Types
export interface ZoneCardProps {
  zone: Zone;
  selectedTab: "visitor" | "subscriber";
  onSelect: (zone: Zone) => void;
  disabled?: boolean;
}

export interface GateHeaderProps {
  gate: Gate;
  connectionStatus: "connected" | "disconnected" | "connecting";
}

export interface TicketModalProps {
  ticket: Ticket | null;
  isOpen: boolean;
  onClose: () => void;
}

export interface CheckinModalProps {
  isOpen: boolean;
  onClose: () => void;
  zone: Zone | null;
  type: "visitor" | "subscriber";
}

// Utility Types
export type ConnectionStatus = "connected" | "disconnected" | "connecting";
export type UserRole = "admin" | "employee";
export type TicketType = "visitor" | "subscriber";
export type RateMode = "normal" | "special";
export type NotificationType = "success" | "error" | "warning" | "info";

export interface TicketData {
  id?: string;
  zoneName?: string;
  checkInAt?: string;
  expiresAt?: string;
  amount?: number;
  qrCode?: string;
  subscriptionId?: string;
}
