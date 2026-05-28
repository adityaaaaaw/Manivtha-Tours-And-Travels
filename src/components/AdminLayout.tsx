"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useFleetStore } from "@/store/fleetStore";
import { useToastStore } from "@/store/toastStore";
import Navbar from "@/components/Navbar";
import { Loader2 } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, loading, initializeAuth } = useAuthStore();
  const { startRealTimeListeners, stopRealTimeListeners, fetchVehicles, fetchBookings } = useFleetStore();
  const { addToast } = useToastStore();

  // 1. Initialize Auth Listener on mount
  useEffect(() => {
    const unsub = initializeAuth();
    return () => unsub();
  }, [initializeAuth]);

  // 2. Sync Firestore Realtime Listeners when authenticated
  useEffect(() => {
    if (user) {
      startRealTimeListeners();
      // Also trigger an immediate initial fetch to populate state fast
      fetchVehicles();
      fetchBookings();
    }
    return () => {
      stopRealTimeListeners();
    };
  }, [user, startRealTimeListeners, stopRealTimeListeners, fetchVehicles, fetchBookings]);

  // 3. Route Protection check
  useEffect(() => {
    if (!loading && !user) {
      addToast("Access Denied. Please sign in as an administrator.", "error");
      router.push("/");
    }
  }, [user, loading, router, addToast]);

  // Render loading state
  if (loading || (!user && loading)) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#020617] text-slate-100 select-none">
        <div className="relative flex flex-col items-center justify-center p-8 rounded-3xl border glass-card max-w-sm w-full mx-4 shadow-2xl">
          <div className="absolute inset-0 bg-indigo-500/5 rounded-3xl blur-xl" />
          <Loader2 className="w-10 h-10 text-indigo-400 animate-spin" />
          <h3 className="mt-4 text-base font-semibold text-slate-200">
            Verifying Credentials
          </h3>
          <p className="mt-1 text-xs text-slate-400 text-center font-medium">
            Securing connection to Manivtha Tours & Travels console...
          </p>
        </div>
      </div>
    );
  }

  // If loading is done, but still checking redirect, return empty loading
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 overflow-x-hidden flex">
      {/* Sidebar Navigation */}
      <Navbar />

      {/* Main Panel Area */}
      <main className="flex-grow min-h-screen flex flex-col lg:pl-72 pt-20 lg:pt-4 p-4 lg:p-6 transition-all duration-300 w-full overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
