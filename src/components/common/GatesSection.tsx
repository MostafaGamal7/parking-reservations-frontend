"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { masterApi } from "@/services/api";
import { Gate, Zone, Category } from "@/types";
import Link from "next/link";
import { Car, MapPin, ArrowRight, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface EnhancedGate extends Gate {
  zones: Array<Zone & { category?: Category }>;
}

export default function GatesSection() {
  const { data: gatesData, isLoading: isLoadingGates } = useQuery({
    queryKey: ["gates"],
    queryFn: masterApi.getGates,
  });

  const { data: zones = [] } = useQuery({
    queryKey: ["zones"],
    queryFn: () => masterApi.getZones(),
    enabled: !!gatesData,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: masterApi.getCategories,
  });

  const enhancedGates = useMemo<EnhancedGate[]>(() => {
    if (!gatesData || !zones.length || !categories.length) return [];

    return gatesData.map(gate => {
      // Create a map to store unique categories
      const uniqueCategories = new Map<string, Zone & { category?: Category }>();
      
      gate.zoneIds.forEach(zoneId => {
        const zone = zones.find(z => z.id === zoneId);
        if (!zone) return;
        
        const category = categories.find(c => c.id === zone.categoryId);
        // Use categoryId as the key to ensure uniqueness
        if (!uniqueCategories.has(zone.categoryId)) {
          uniqueCategories.set(zone.categoryId, { ...zone, category });
        }
      });

      return {
        ...gate,
        zones: Array.from(uniqueCategories.values())
      };
    });
  }, [gatesData, zones, categories]);

  if (isLoadingGates) {
    return (
      <section id="gates" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48 rounded-lg" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="gates" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Choose Your Access Point
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Select a gate to check in. Each gate provides access to specific parking zones.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enhancedGates.map((gate) => (
            <Link
              key={gate.id}
              href={`/gate/${gate.id}`}
              className="group block"
            >
              <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-200 hover:shadow-lg h-full flex flex-col border border-gray-200">
                <div className="p-6 flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                      <Car className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {gate.name}
                    </h3>
                  </div>
                  <p className="text-gray-600 mb-4 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <span className="truncate">{gate.location}</span>
                  </p>
                  
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Zones:</span>
                      <span className="font-medium">{gate.zoneIds.length}</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {gate.zones.slice(0, 3).map((zone) => (
                        <Badge 
                          key={zone.id}
                          variant="outline"
                          className="flex items-center gap-1 text-xs"
                        >
                          <Shield className="h-3 w-3" />
                          {zone.category?.name || 'General'}
                        </Badge>
                      ))}
                      {gate.zones.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{gate.zones.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm text-blue-600 font-medium">
                    <span>Check in now</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">
              Need Help Choosing?
            </h3>
            <p className="text-gray-600 mb-6">
              Our parking system automatically guides you to the most convenient
              gate based on your destination. All gates provide access to our
              secure, monitored parking facilities.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">
              <div className="flex items-center justify-center space-x-2 text-gray-600">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Real-time availability</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-gray-600">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Secure access control</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-gray-600">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>24/7 monitoring</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
