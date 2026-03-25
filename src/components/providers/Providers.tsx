"use client";

import { SessionProvider } from "next-auth/react";
import { CoordinateProvider } from "@/context/CoordinateContext";
import { ThemeProvider } from "@/context/ThemeContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <CoordinateProvider>
          {children}
        </CoordinateProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
