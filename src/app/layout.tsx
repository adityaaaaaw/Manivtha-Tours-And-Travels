import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import ToastContainer from "@/components/ToastContainer";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "Manivtha Tours & Travels | Fleet & Availability Calendar",
  description: "Advanced glassmorphic SaaS fleet management console, live availability schedules, and vehicle reservation collision checks.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} dark`}>
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="font-sans antialiased text-slate-100 min-h-screen bg-[#020617]">
        <ToastContainer />
        {children}
      </body>
    </html>
  );
}
