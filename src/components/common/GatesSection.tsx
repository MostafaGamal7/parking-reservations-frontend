"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { masterApi } from "@/services/api";
import { Gate } from "@/types";
import Link from "next/link";
import { Car, MapPin, ArrowRight } from "lucide-react";

export default function GatesSection() {
  const [gates, setGates] = useState<Gate[]>([]);

  const { data: gatesData, isLoading } = useQuery({
    queryKey: ["gates"],
    queryFn: masterApi.getGates,
  });

  useEffect(() => {
    if (gatesData) {
      setGates(gatesData);
    }
  }, [gatesData]);

  return (
    <section id="gates" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Choose Your Access Point
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Select from our strategically located parking gates for convenient
            access to our facilities
          </p>
        </div>

        {/* Gates Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-xl shadow-lg p-6 animate-pulse"
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                  <div className="ml-4 flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {gates.map((gate) => (
              <Link
                key={gate.id}
                href={`/gate/${gate.id}`}
                className="group bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 p-6 border border-gray-100"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                      <Car className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {gate.name}
                      </h3>
                      <div className="flex items-center text-sm text-gray-500">
                        <MapPin className="h-4 w-4 mr-1" />
                        {gate.location}
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    Access to {gate.zoneIds.length} parking zone
                    {gate.zoneIds.length !== 1 ? "s" : ""}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      Gate ID: {gate.id}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Available
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Additional Info */}
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
