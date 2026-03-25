import type { Metadata } from "next";
import { Space_Mono, Instrument_Serif } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const spaceMono = Space_Mono({ 
  subsets: ["latin"], 
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--font-space-mono" 
});

const instrumentSerif = Instrument_Serif({ 
  subsets: ["latin"], 
  weight: ["400"],
  style: ["normal", "italic"],
  variable: "--font-instrument-serif" 
});

export const metadata: Metadata = {
  title: "GeoSense — Climate Telemetry Dashboard",
  description: "40-year climate data analysis powered by Open-Meteo API",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${spaceMono.variable} ${instrumentSerif.variable}`}>
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: 'var(--paper2)',
              color: 'var(--ink)',
              border: '1px solid var(--ink)',
              borderRadius: '0',
              fontFamily: 'var(--mono)',
              fontSize: '10px',
            },
          }}
        />
      </body>
    </html>
  );
}
