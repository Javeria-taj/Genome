"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { YearlyClimateData } from "@/types/climate";

interface CoordinateContextType {
  selectedCoords: { lat: number; lng: number } | null;
  setSelectedCoords: (coords: { lat: number; lng: number } | null) => void;
  locationLabel: string;
  setLocationLabel: (label: string) => void;
  climateDataA: YearlyClimateData[] | null;
  setClimateDataA: (data: YearlyClimateData[] | null) => void;
  climateDataB: YearlyClimateData[] | null;
  setClimateDataB: (data: YearlyClimateData[] | null) => void;
}

const CoordinateContext = createContext<CoordinateContextType | undefined>(undefined);

export function CoordinateProvider({ children }: { children: ReactNode }) {
  const [selectedCoords, setSelectedCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locationLabel, setLocationLabel] = useState<string>("");
  const [climateDataA, setClimateDataA] = useState<YearlyClimateData[] | null>(null);
  const [climateDataB, setClimateDataB] = useState<YearlyClimateData[] | null>(null);

  return (
    <CoordinateContext.Provider
      value={{
        selectedCoords,
        setSelectedCoords,
        locationLabel,
        setLocationLabel,
        climateDataA,
        setClimateDataA,
        climateDataB,
        setClimateDataB,
      }}
    >
      {children}
    </CoordinateContext.Provider>
  );
}

export function useCoordinateContext() {
  const context = useContext(CoordinateContext);
  if (context === undefined) {
    throw new Error("useCoordinateContext must be used within a CoordinateProvider");
  }
  return context;
}
