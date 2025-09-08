"use client";

import { useState } from "react";
import { adminApi } from "@/services/api";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

interface ZoneStatusControlProps {
  zoneId: string;
  isOpen: boolean;
  onStatusChange: (isOpen: boolean) => void;
  disabled?: boolean;
}

export function ZoneStatusControl({
  zoneId,
  isOpen,
  onStatusChange,
  disabled = false,
}: ZoneStatusControlProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleToggle = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("welink_auth_token") || "";
      await adminApi.updateZoneOpen(zoneId, !isOpen, token);
      onStatusChange(!isOpen);
      toast({
        title: "Zone status updated",
        description: `Zone ${zoneId} is now ${!isOpen ? "open" : "closed"}`,
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Error updating zone status",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <Switch
        checked={isOpen}
        onCheckedChange={handleToggle}
        disabled={disabled || isLoading}
        aria-label="Toggle zone status"
      />
      <span className="text-sm text-gray-500">
        {isLoading ? "Updating..." : isOpen ? "Open" : "Closed"}
      </span>
    </div>
  );
}
