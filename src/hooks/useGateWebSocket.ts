import { useEffect, useState, useCallback, useMemo } from 'react';
import { Zone } from '@/types/zone';
import { getWebSocketClient } from '@/services/websocket';
import { fetchZones } from '@/services/gate/api';

interface WebSocketMessage {
  type: string;
  payload: unknown;
}

interface WebSocketClient {
  subscribe: (gateId: string) => void;
  unsubscribe: (gateId: string) => void;
  addEventListener: (listener: (message: WebSocketMessage) => void) => void;
  removeEventListener?: (listener: (message: WebSocketMessage) => void) => void;
  isConnected: () => boolean;
  getLastError: () => string | null;
}

interface ZoneUpdateMessage {
  id: string;
  name?: string;
  totalSlots?: number;
  reserved?: number;
  free?: number;
  availableForVisitors?: number;
  availableForSubscribers?: number;
  specialActive?: boolean;
  updatedAt?: string;
  rateNormal?: number;
  rateSpecial?: number;
  open?: boolean;
  occupied?: number;
  categoryId?: string;
  categoryName?: string;
  isVip?: boolean;
  isMaintenance?: boolean;
  isDisabled?: boolean;
}

export const useGateWebSocket = (gateId: string) => {
  const [zones, setZones] = useState<Zone[]>([]);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const wsClient = useMemo(() => {
    if (typeof window === 'undefined') return null;
    return getWebSocketClient();
  }, []);

  const handleWebSocketMessage = useCallback((message: { type: string; payload: ZoneUpdateMessage }) => {
    if (!wsClient) return;

    if (message.type === 'zone-update') {
      const payload = message.payload;

      setZones(prevZones => {
        const zonesMap = new Map(prevZones.map(zone => [zone.id, zone]));
        const existingZone = zonesMap.get(payload.id);

        if (!existingZone) return prevZones; // Skip if zone doesn't exist

        const freeSlots = payload.free ?? existingZone.free ?? 0;
        const isOpen = payload.open !== undefined ? payload.open : existingZone.open;

        const updatedZone: Zone = {
          ...existingZone,
          ...(payload.name !== undefined && { name: payload.name }),
          ...(payload.totalSlots !== undefined && { totalSlots: payload.totalSlots }),
          ...(payload.occupied !== undefined && { occupied: payload.occupied }),
          ...(payload.free !== undefined && { free: payload.free }),
          ...(payload.reserved !== undefined && { 
            reserved: payload.reserved,
            reservedSlots: payload.reserved // Keep reservedSlots in sync with reserved
          }),
          ...(payload.availableForVisitors !== undefined && { 
            availableForVisitors: payload.availableForVisitors 
          }),
          ...(payload.availableForSubscribers !== undefined && { 
            availableForSubscribers: payload.availableForSubscribers 
          }),
          ...(payload.specialActive !== undefined && { 
            specialActive: payload.specialActive 
          }),
          ...(payload.open !== undefined && { open: payload.open }),
          ...(payload.rateNormal !== undefined && { rateNormal: payload.rateNormal }),
          ...(payload.rateSpecial !== undefined && { rateSpecial: payload.rateSpecial }),
          availableSlots: payload.availableForVisitors ?? existingZone.availableForVisitors,
          isDisabled: !isOpen || freeSlots <= 0,
          updatedAt: payload.updatedAt ?? new Date().toISOString(),
          categoryId: payload.categoryId ?? existingZone.categoryId,
          categoryName: payload.categoryName ?? existingZone.categoryName,
          gateIds: existingZone.gateIds || [], // Preserve existing gate IDs or default to empty array
          isVip: payload.isVip ?? existingZone.isVip,
          isMaintenance: payload.isMaintenance ?? existingZone.isMaintenance
        };

        zonesMap.set(payload.id, updatedZone);
        return Array.from(zonesMap.values());
      });
    } else if (message.type === 'admin-update') {
      console.log('Admin update:', message);
    }
  }, [wsClient]);

  useEffect(() => {
    if (!wsClient) return;

    wsClient.subscribe(gateId);

    const handleMessage = (msg: { type: string; payload: unknown }) => {
      try {
        if (msg.type === 'zone-update' || msg.type === 'admin-update') {
          handleWebSocketMessage(msg as { type: string; payload: ZoneUpdateMessage });
        }
      } catch (err) {
        console.error('Error processing WebSocket message:', err);
        setError('Failed to process zone update');
      }
    };

    const updateConnectionState = () => {
      setIsConnected(wsClient.isConnected?.() ?? false);
      setError(wsClient.getLastError?.() ?? null);
    };

    wsClient.addEventListener(handleMessage);
    updateConnectionState();

    const interval = setInterval(updateConnectionState, 5000);

    return () => {
      clearInterval(interval);
      // Use type assertion to safely handle removeEventListener
      const clientWithRemove = wsClient as WebSocketClient & { removeEventListener?: (listener: (message: WebSocketMessage) => void) => void };
      if (clientWithRemove.removeEventListener) {
        clientWithRemove.removeEventListener(handleMessage);
      }
      wsClient.unsubscribe(gateId);
    };
  }, [wsClient, gateId, handleWebSocketMessage]);

  useEffect(() => {
    return () => {
      if (wsClient) {
        wsClient.unsubscribe(gateId);
      }
      setIsConnected(false);
      setError('Disconnected');
    };
  }, [gateId, wsClient]);

  // Manually refresh zones
  const refreshZones = useCallback(async () => {
    try {
      // Fetch the latest zones from the server
      const latestZones = await fetchZones(gateId);
      // Update the local state with the latest zones
      setZones(latestZones);
      return latestZones;
    } catch (error) {
      console.error('Error refreshing zones:', error);
      setError('Failed to refresh zones');
      throw error;
    }
  }, [gateId]);

  // Initialize with empty zones if not connected
  useEffect(() => {
    if (!isConnected) {
      setZones([]);
    }
  }, [isConnected]);

  // No need for separate connection status effect as it's now handled in the main effect

  return { 
    zones, 
    isConnected, 
    error, 
    setZones,  // Keep setZones for backward compatibility
    refreshZones 
  };
};
