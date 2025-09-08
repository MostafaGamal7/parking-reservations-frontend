import React from "react";
import { Zone } from "@/types/zone";
import { cn } from "@/lib/utils";
import { Info, AlertCircle, CheckCircle, XCircle } from "lucide-react";

interface ZoneCardProps {
  zone: Zone & {
    availableForVisitors: number;
    availableForSubscribers: number;
    rateNormal: number;
    rateSpecial: number;
    specialActive: boolean;
    open: boolean;
  };
  isSelected: boolean;
  isVisitor: boolean;
  isDisabled?: boolean;
  onSelect: (zoneId: string) => void;
  className?: string;
}

export const ZoneCard: React.FC<ZoneCardProps> = ({
  zone,
  isSelected,
  isVisitor,
  isDisabled: propIsDisabled,
  onSelect,
  className,
}) => {
  // Check if this is a maintenance zone
  const isMaintenance =
    zone.categoryName?.toLowerCase().includes("maintenance") || false;

  // Get availability information from server data
  const availableSlots = isVisitor
    ? zone.availableForVisitors
    : zone.availableForSubscribers;
  const isAvailable = isMaintenance || (zone.open && availableSlots > 0);

  // Determine if zone is disabled
  const isDisabled =
    propIsDisabled !== undefined
      ? Boolean(propIsDisabled)
      : !zone.open || availableSlots <= 0;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isDisabled) return;
    // Only update selection, don't trigger check-in
    onSelect(zone.id);
  };

  const renderStatusBadge = () => {
    // Special case for maintenance zones
    if (isMaintenance) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          <Info className="h-3 w-3 mr-1" />
          Maintenance
        </span>
      );
    }

    if (!zone.open) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <XCircle className="h-3 w-3 mr-1" />
          Closed
        </span>
      );
    }

    // Show different status based on user type
    if (isVisitor) {
      if (zone.availableForVisitors <= 0) {
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <AlertCircle className="h-3 w-3 mr-1" />
            No Visitor Slots
          </span>
        );
      }
    } else {
      if (zone.availableForSubscribers <= 0) {
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <AlertCircle className="h-3 w-3 mr-1" />
            No Subscriber Slots
          </span>
        );
      }
    }

    // If we get here, the zone is available
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <CheckCircle className="h-3 w-3 mr-1" />
        {isVisitor ? "Available for Visitors" : "Available for Subscribers"}
      </span>
    );
  };

  return (
    <div
      className={cn(
        "p-4 rounded-lg border transition-all",
        "hover:shadow-md",
        isSelected
          ? "ring-2 ring-blue-500 bg-blue-50 border-blue-200"
          : "border-gray-200 hover:border-gray-300",
        isDisabled
          ? "opacity-70 cursor-not-allowed bg-gray-50"
          : "cursor-pointer",
        className
      )}
      data-available={isAvailable}
      data-available-slots={availableSlots}
      data-visitor={isVisitor}
      data-maintenance={isMaintenance}
      onClick={handleClick}
      onKeyDown={(e: React.KeyboardEvent) => {
        if ((e.key === "Enter" || e.key === " ") && !isDisabled) {
          e.preventDefault();
          // Only update selection, don't trigger check-in
          onSelect(zone.id);
        }
      }}
      role="button"
      tabIndex={0}
      aria-disabled={isDisabled}
      aria-label={`Zone ${zone.name}. ${
        isDisabled ? "Not available" : "Select this zone"
      }`}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-medium text-gray-900 text-base flex items-center gap-2">
            {zone.name}
            {/* <Tooltip content={`Category: ${zone.categoryId.replace('cat_', '') || 'General'}`}>
              <Info className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-help" />
            </Tooltip> */}
            {/* style this span */}
            <span className="px-1 py-0.5 bg-blue-100 text-xs rounded-sm font-medium">
              {zone.categoryId.replace("cat_", "")[0].toUpperCase() +
                zone.categoryId.replace("cat_", "").slice(1)}
            </span>
          </h3>
          <div className="mt-1">{renderStatusBadge()}</div>
        </div>
      </div>

      <div className="space-y-2 text-sm mt-3">
        {/* Rates Section */}
        <div
          className={cn(
            "p-2 rounded border",
            zone.specialActive
              ? "bg-amber-50 border-amber-200"
              : "bg-gray-50 border-gray-200"
          )}
        >
          {/* Standard Rate - Always shown */}
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium text-gray-700">
              Standard Rate
            </span>
            <span
              className={cn(
                "font-medium",
                zone.specialActive
                  ? "text-gray-500 line-through"
                  : "text-gray-800"
              )}
            >
              ${zone.rateNormal.toFixed(2)}
              <span className="text-xs font-normal text-gray-500">/hr</span>
            </span>
          </div>

          {/* Special Rate - Only shown when active */}
          {zone.specialActive && (
            <div className="flex justify-between items-center mt-1">
              <span className="text-xs font-medium text-amber-700 flex items-center">
                🎉 Special Rate
              </span>
              <span className="font-bold text-amber-800">
                ${zone.rateSpecial.toFixed(2)}
                <span className="text-xs font-normal text-amber-700">/hr</span>
              </span>
            </div>
          )}
        </div>

        {/* Availability Section */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-gray-50 p-2 rounded">
            <div className="text-xs text-gray-500">Total Slots</div>
            <div className="font-medium">{zone.totalSlots}</div>
          </div>
          <div className="bg-gray-50 p-2 rounded">
            <div className="text-xs text-gray-500">Occupied</div>
            <div className="font-medium">{zone.occupied}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="bg-blue-50 p-2 rounded">
            <div className="text-xs text-blue-600">
              Available for {isVisitor ? "Visitors" : "Subscribers"}
            </div>
            <div
              className={cn("font-medium", {
                "text-blue-700": availableSlots > 0,
                "text-red-600": availableSlots <= 0,
              })}
            >
              {isVisitor
                ? zone.availableForVisitors
                : zone.availableForSubscribers}
              {availableSlots <= 0 && (
                <span className="ml-1 text-xs text-red-500">(Full)</span>
              )}
            </div>
          </div>
          <div className="bg-gray-50 p-2 rounded">
            <div className="text-xs text-gray-500">Reserved</div>
            <div className="font-medium">{zone.reservedSlots || 0}</div>
          </div>
        </div>

        {/* Show both availabilities in a small note */}
        <div className="text-xs text-gray-500 mt-1">
          {isVisitor
            ? `Subscribers: ${zone.availableForSubscribers} available`
            : `Visitors: ${zone.availableForVisitors} available`}
        </div>
      </div>

      {!zone.open ? (
        <div className="mt-2 pt-2 border-t border-gray-100 text-xs text-red-600">
          This zone is currently closed
        </div>
      ) : (
        !isAvailable && (
          <div className="mt-2 pt-2 border-t border-gray-100 text-xs text-amber-600">
            No {isVisitor ? "visitor" : "subscriber"} spots available
          </div>
        )
      )}
    </div>
  );
};

export default ZoneCard;
