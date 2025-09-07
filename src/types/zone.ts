export interface Zone {
  id: string;
  name: string;
  categoryId: string;
  categoryName?: string;
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
  specialActive: boolean;
  open: boolean;
  isVip?: boolean;
  isMaintenance?: boolean;
  isDisabled?: boolean;
  updatedAt?: string;
}

export interface ZoneUpdate extends Partial<Zone> {
  id: string;
  specialActive?: boolean;
  occupied?: number;
  free?: number;
  availableForVisitors?: number;
  availableForSubscribers?: number;
}

export interface ZoneCardProps {
  zone: Zone;
  isSelected: boolean;
  isVisitor: boolean;
  onSelect: (zoneId: string) => void;
  className?: string;
}

export interface ZoneGridProps {
  zones: Zone[];
  selectedZone: string | null;
  onSelectZone: (zoneId: string) => void;
  isVisitor: boolean;
  isLoading?: boolean;
  error?: string | null;
}

export interface CheckInFormProps {
  onSubmit: (data: CheckInFormData) => Promise<void>;
  isSubmitting: boolean;
  error?: string | null;
}

export interface CheckInFormData {
  zoneId: string;
  type: 'visitor' | 'subscriber';
  subscriptionId?: string;
}

export interface Ticket {
  id: string;
  zoneId: string;
  zoneName: string;
  checkInAt: string;
  expiresAt?: string;
  type: 'visitor' | 'subscriber';
  status: 'active' | 'checked-out' | 'expired';
  amount?: number;
  currency?: string;
  qrCode?: string;
}

export interface TicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: Ticket | null;
}

export interface GateHeaderProps {
  gateId: string;
  isConnected: boolean;
  lastUpdated?: string;
  onRefresh?: () => void;
}
