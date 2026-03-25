"use client";

import WorldMap from "@/components/map/WorldMap";
import { StatCard } from "@/components/ui/StatCard";
import { useCoordinateContext } from "@/context/CoordinateContext";
import { Crosshair, Database, MapPin, Activity, Globe } from "lucide-react";
import { useState } from "react";

export default function DashboardHome() {
  const { selectedCoords, locationLabel, climateDataA } = useCoordinateContext();
  const [savedCount, setSavedCount] = useState<number>(0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 animate-fade-in-up">
        <StatCard 
          title="Last Coordinates" 
          value={selectedCoords ? `${selectedCoords.lat.toFixed(2)}, ${selectedCoords.lng.toFixed(2)}` : "None"} 
          icon={<Crosshair className="w-6 h-6" />}
          highlight={!!selectedCoords}
          subtext={locationLabel || "Manual Target Selection"}
        />
        <StatCard 
          title="Saved Locations" 
          value={savedCount.toString()} 
          icon={<MapPin className="w-6 h-6" />}
          subtext="Retrieved from secure DB"
        />
        <StatCard 
          title="Data Points Loaded" 
          value={climateDataA ? (climateDataA.length * 5).toString() : "0"} 
          icon={<Database className="w-6 h-6" />}
          subtext="Session array size"
        />
        <StatCard 
          title="System Status" 
          value={
            <div className="flex items-center space-x-2 text-emerald text-glow">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald shadow-[0_0_8px_#10b981]"></span>
              </span>
              <span>Online</span>
            </div>
          } 
          icon={<Activity className="w-6 h-6" />}
          subtext="Open-Meteo API: Live"
        />
      </div>

      <div className="animate-fade-in-up" style={{ animationDelay: "150ms" }}>
        <h3 className="text-lg font-bold font-sans tracking-tight mb-4 flex items-center space-x-2 drop-shadow-md">
          <Globe className="w-5 h-5 text-cyan" />
          <span>Global Telemetry Array</span>
        </h3>
        <WorldMap onPinsChange={(count) => setSavedCount(count)} />
      </div>
    </div>
  );
}
