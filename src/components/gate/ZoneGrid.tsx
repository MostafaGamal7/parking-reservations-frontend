import React from 'react';
import { Zone } from '@/types/zone';
import { ZoneCard } from './ZoneCard';
import { cn } from '@/lib/utils';
// Using a simple div for loading state
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface ProcessedZone extends Zone {
  isMaintenance: boolean;
  isVip: boolean;
  availableSlots: number;
  isAvailable: boolean;
  isDisabled: boolean;
}

interface ZoneGridProps {
  zones: Zone[];
  selectedZone: string | null;
  onSelectZone: (zoneId: string | null) => void;
  isVisitor?: boolean;
  isLoading?: boolean;
  error?: string | null;
  className?: string;
}

export const ZoneGrid: React.FC<ZoneGridProps> = ({
  zones,
  selectedZone,
  onSelectZone,
  isVisitor = true,
  isLoading = false,
  error = null,
  className = '',
}) => {
  if (isLoading) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}>
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-40 bg-gray-200 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className={className}>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error loading zones</AlertTitle>
        <AlertDescription>
          {error}
        </AlertDescription>
      </Alert>
    );
  }

  if (zones.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <p className="text-gray-500">No zones available for this gate.</p>
      </div>
    );
  }

  const handleZoneSelect = (zoneId: string) => {
    // Toggle selection if clicking the same zone
    if (selectedZone === zoneId) {
      onSelectZone(null);
    } else {
      onSelectZone(zoneId);
    }
  };

  const handleZoneClick = (zoneId: string, isDisabled: boolean) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isDisabled) {
      handleZoneSelect(zoneId);
    }
  };

  // Process zones - keep all zones including closed ones
  const processedZones: ProcessedZone[] = zones.map(zone => {
    const isMaintenance = zone.categoryName?.toLowerCase().includes('maintenance') || false;
    const isVip = zone.name.toLowerCase().includes('vip') || false;
    const availableSlots = isVisitor ? zone.availableForVisitors : zone.availableForSubscribers;
    const isAvailable = isMaintenance || (zone.open && availableSlots > 0);
    
    return {
      ...zone,
      isMaintenance,
      isVip,
      availableSlots,
      isAvailable,
      isDisabled: !zone.open || !isAvailable
    };
  });

  // Sort open zones
  const openZones = [...processedZones]
    .filter(zone => zone.open)
    .sort((a, b) => {
      // Maintenance zones first
      if (a.isMaintenance && !b.isMaintenance) return -1;
      if (!a.isMaintenance && b.isMaintenance) return 1;
      
      // Then VIP zones
      if (a.isVip && !b.isVip) return -1;
      if (!a.isVip && b.isVip) return 1;
      
      // Then sort by name
      return a.name.localeCompare(b.name);
    });

  // Sort closed zones
  const closedZones = [...processedZones]
    .filter(zone => !zone.open)
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div 
      className={`grid grid-cols-1 gap-6 ${className}`}
      onClick={(e) => {
        // Prevent click events from propagating to parent elements
        e.stopPropagation();
      }}
    >
      {/* Open Zones */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {openZones.map((zone) => {
        const isSelected = selectedZone === zone.id;
        const isDisabled = Boolean(zone.isDisabled);
        
        return (
          <div
            key={zone.id}
            className={cn(
              'transition-opacity',
              isDisabled ? 'opacity-50' : 'cursor-pointer hover:opacity-90',
              isSelected ? 'ring-2 ring-blue-500' : 'ring-1 ring-transparent',
              'rounded-lg',
              !zone.open ? 'border-red-100' : 'border-transparent',
              zone.open && (isVisitor ? zone.availableForVisitors <= 0 : zone.availableForSubscribers <= 0) && 'border-amber-100'
            )}
            onClick={handleZoneClick(zone.id, isDisabled)}
            onKeyDown={(e: React.KeyboardEvent) => {
              if ((e.key === 'Enter' || e.key === ' ') && !isDisabled) {
                e.preventDefault();
                handleZoneSelect(zone.id);
              }
            }}
            role="button"
            tabIndex={0}
            aria-disabled={isDisabled}
            title={isDisabled 
              ? !zone.open 
                ? 'This zone is closed' 
                : `No ${isVisitor ? 'visitor' : 'subscriber'} slots available`
              : `Select ${zone.name}`
            }
          >
            <ZoneCard
              zone={zone}
              isSelected={isSelected}
              isVisitor={isVisitor}
              isDisabled={isDisabled}
              onSelect={handleZoneSelect}
              className={cn(
                'h-full',
                isSelected ? 'ring-2 ring-blue-500' : 'ring-1 ring-gray-200',
                isDisabled ? 'opacity-50' : 'hover:shadow-md cursor-pointer',
                'transition-all duration-200 rounded-lg overflow-hidden'
              )}
            />
          </div>
        );
      })}
    </div>
      
      {/* Closed Zones - Only shown if there are any */}
      {closedZones.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-medium text-gray-500 mb-4">Closed Zones</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {closedZones.map((zone) => {
              const isSelected = selectedZone === zone.id;
              
              return (
                <div
                  key={zone.id}
                  className={cn(
                    'transition-opacity',
                    'rounded-lg border border-gray-200',
                    'cursor-not-allowed' // Always show as not clickable
                  )}
                >
                  <ZoneCard
                    zone={zone}
                    isSelected={isSelected}
                    isVisitor={isVisitor}
                    isDisabled={true} // Always disable closed zones
                    onSelect={() => {}} // No-op for closed zones
                    className="h-full opacity-70"
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ZoneGrid;
