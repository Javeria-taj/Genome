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
  title: "Genome — GeoScience Dashboard",
  description: "40-year climate data analysis powered by Open-Meteo API",
  icons: { icon: '/favicon.svg' },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${spaceMono.variable} ${instrumentSerif.variable}`}>
        <div className="page-enter">
          {children}
        </div>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              fontFamily: 'Space Mono',
              fontSize: '11px',
              border: '1px solid var(--ink)',
              background: 'var(--paper)',
              color: 'var(--ink)',
            },
            success: { iconTheme: { primary: '#2ecc71', secondary: 'var(--paper)' } },
            error: { iconTheme: { primary: 'var(--accent)', secondary: 'var(--paper)' } },
          }}
        />
      </body>
    </html>
  );
}
