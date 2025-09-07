import { masterApi, ticketsApi, subscriptionsApi } from '@/services/api';
import type { Zone as ApiZone, Ticket as ApiTicket, CheckinRequest } from '@/types';
import type { Zone } from '@/types/zone';
import type { TicketData } from '@/components/gate/TicketModal';

// Type for Ticket API response
interface TicketApiResponse {
  id: string;
  zoneId: string;
  type: 'visitor' | 'subscriber';
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
  categoryName: 'categoryName' in apiZone ? String(apiZone['categoryName']) : 'Unknown',
  updatedAt: 'updatedAt' in apiZone ? String(apiZone['updatedAt']) : new Date().toISOString(),
  reservedSlots: 'reserved' in apiZone ? Number(apiZone['reserved']) : 0,
  availableSlots: 'free' in apiZone ? Number(apiZone['free']) : 0,
  // Ensure all required Zone properties are included
  gateIds: apiZone.gateIds || [],
  open: apiZone.open ?? true,
});

export const fetchZones = async (gateId: string): Promise<Zone[]> => {
  try {
    const zones = await masterApi.getZones(gateId);
    return zones.map(mapApiZoneToZone);
  } catch (error) {
    console.error('Failed to fetch zones:', error);
    throw error;
  }
};

/**
 * Checks in a visitor to a zone
 */
// Convert API Ticket to frontend TicketData type
const mapApiTicketToTicketData = (apiTicket: ApiTicket, zoneName: string): TicketData => {
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

export const checkInVisitor = async ({ gateId, zoneId, licensePlate }: CheckInVisitorParams): Promise<{ ticket: TicketData }> => {
  try {
    // First get the zone name
    const zones = await masterApi.getZones(gateId);
    const zone = zones.find(z => z.id === zoneId);
    if (!zone) {
      throw new Error(`Zone with ID ${zoneId} not found`);
    }
    
    // Then check in
    const request: CheckinRequest = {
      gateId,
      zoneId,
      type: 'visitor',
      licensePlate, // Include license plate in the request
    };
    
    const response = await ticketsApi.checkin(request);
    
    // Map the response to the frontend TicketData type
    return {
      ticket: mapApiTicketToTicketData(response.ticket, zone.name)
    };
  } catch (error) {
    console.error('Check-in failed:', error);
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
  subscriptionId
}: CheckInSubscriberParams): Promise<{ ticket: TicketData }> => {
  try {
    // Get zones and verify subscription in parallel
    const [zones] = await Promise.all([
      masterApi.getZones(gateId),
      subscriptionsApi.getSubscription(subscriptionId) // Verify subscription exists
    ]);
    
    const zone = zones.find(z => z.id === zoneId);
    if (!zone) {
      throw new Error(`Zone with ID ${zoneId} not found`);
    }
    
    // Then check in the subscriber
    const response = await ticketsApi.checkin({
      gateId,
      zoneId,
      type: 'subscriber',
      subscriptionId,
    });
    
    // Map the response to the frontend TicketData type
    return {
      ticket: mapApiTicketToTicketData(response.ticket, zone.name)
    };
  } catch (error) {
    console.error('Subscriber check-in failed:', error);
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
    console.error('Failed to fetch subscription:', error);
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
      masterApi.getZones(gateId)
    ]);
    
    const gate = gates.find(g => g.id === gateId);
    if (!gate) {
      throw new Error(`Gate with ID ${gateId} not found`);
    }
    
    // Map the zones to the frontend Zone type
    const gateZones = zones
      .filter(zone => zone.gateIds?.includes(gateId))
      .map(mapApiZoneToZone);
    
    return {
      ...gate,
      zones: gateZones
    };
  } catch (error) {
    console.error('Failed to fetch gate details:', error);
    throw error;
  }
};
