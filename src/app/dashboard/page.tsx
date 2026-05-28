"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { useFleetStore, Vehicle, Booking } from "@/store/fleetStore";
import { useToastStore } from "@/store/toastStore";
import { motion } from "framer-motion";
import { 
  Car, 
  CalendarRange, 
  CheckCircle2, 
  Wrench, 
  Compass,
  ArrowRight,
  Database,
  RefreshCw,
  Coins
} from "lucide-react";
import Link from "next/link";

export default function Dashboard() {
  const { vehicles, bookings, loading, generateDemoData, clearAllData } = useFleetStore();
  const { addToast } = useToastStore();
  const [isGenerating, setIsGenerating] = useState(false);

  // Metrics calculations
  const totalVehicles = vehicles.length;
  const activeBookings = bookings.filter(b => b.bookingStatus === "Confirmed" || b.bookingStatus === "Pending").length;
  const availableVehicles = vehicles.filter(v => v.status === "Available").length;
  const maintenanceVehicles = vehicles.filter(v => v.status === "Maintenance" || v.maintenanceStatus === "Under Maintenance").length;

  // Revenue estimation (mock calculation based on paid bookings)
  const totalRevenue = bookings
    .filter(b => b.bookingStatus !== "Cancelled" && b.paymentStatus === "Paid")
    .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

  const handleGenerateDemo = async () => {
    setIsGenerating(true);
    try {
      await generateDemoData();
      addToast("Successfully generated 10 demo vehicles and 20 sample bookings!", "success");
    } catch (err) {
      addToast("Failed to generate demo data.", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClearData = async () => {
    if (confirm("Are you sure you want to delete all fleet and booking data?")) {
      try {
        await clearAllData();
        addToast("All data successfully cleared.", "warning");
      } catch (err) {
        addToast("Failed to clear data.", "error");
      }
    }
  };

  // Fleet Status Percentages for Gauge
  const bookedPercent = totalVehicles > 0 ? Math.round((vehicles.filter(v => v.status === "Booked" || v.status === "On Trip").length / totalVehicles) * 100) : 0;
  const availPercent = totalVehicles > 0 ? Math.round((availableVehicles / totalVehicles) * 100) : 0;
  const maintPercent = totalVehicles > 0 ? Math.round((maintenanceVehicles / totalVehicles) * 100) : 0;
  const otherPercent = 100 - bookedPercent - availPercent - maintPercent;

  // Animation constants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: "spring" as const, stiffness: 100 } }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/40 pb-5">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
              Fleet Overview
            </h2>
            <p className="text-sm text-slate-400 font-medium mt-1">
              Live fleet operations, capacity utilization, and double-booking controls.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {totalVehicles === 0 ? (
              <button
                onClick={handleGenerateDemo}
                disabled={isGenerating}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white text-xs font-bold shadow-[0_4px_15px_rgba(99,102,241,0.25)] transition-all cursor-pointer disabled:opacity-75"
              >
                {isGenerating ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Database className="w-3.5 h-3.5" />
                )}
                <span>Generate Demo Data</span>
              </button>
            ) : (
              <button
                onClick={handleClearData}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-800 hover:border-rose-900 bg-slate-950/40 hover:bg-rose-950/15 text-slate-400 hover:text-rose-400 text-xs font-bold transition-all cursor-pointer"
              >
                <span>Reset Database</span>
              </button>
            )}
          </div>
        </div>

        {totalVehicles === 0 ? (
          /* Empty State Banner */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border glass-card p-8 md:p-12 text-center max-w-2xl mx-auto my-12 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[80px]" />
            <Compass className="w-16 h-16 text-indigo-400/80 mx-auto animate-spin-slow mb-4" />
            <h3 className="text-xl font-bold text-slate-100">Welcome to your Fleet Manager</h3>
            <p className="text-sm text-slate-400 mt-2 max-w-md mx-auto">
              Get started by generating our 10 realistic demo vehicles and 20 sample bookings spanning daily, weekly, and monthly periods.
            </p>
            <button
              onClick={handleGenerateDemo}
              disabled={isGenerating}
              className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-sm shadow-lg shadow-indigo-500/20 transition-all cursor-pointer"
            >
              {isGenerating ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Database className="w-4 h-4" />
              )}
              <span>Initialize Demo Data</span>
            </button>
          </motion.div>
        ) : (
          /* Dashboard Grid */
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4"
          >
            {/* Stat Card 1: Total Fleet */}
            <motion.div variants={itemVariants} className="rounded-2xl border glass-card p-5 relative overflow-hidden group select-none">
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-colors" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Fleet</p>
                  <h3 className="text-3xl font-extrabold mt-1 text-slate-100">{totalVehicles}</h3>
                </div>
                <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-500/10 text-indigo-400 group-hover:scale-110 transition-transform">
                  <Car className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/40 pt-3">
                <span className="font-semibold text-indigo-400">Manivtha Fleet Size</span>
                <span>Active Duty</span>
              </div>
            </motion.div>

            {/* Stat Card 2: Active Bookings */}
            <motion.div variants={itemVariants} className="rounded-2xl border glass-card p-5 relative overflow-hidden group select-none">
              <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-2xl group-hover:bg-rose-500/10 transition-colors" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Active Bookings</p>
                  <h3 className="text-3xl font-extrabold mt-1 text-rose-400">{activeBookings}</h3>
                </div>
                <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/10 text-rose-400 group-hover:scale-110 transition-transform">
                  <CalendarRange className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/40 pt-3">
                <span className="font-semibold text-rose-400">Overlap Checks Active</span>
                <span>Reserved Slots</span>
              </div>
            </motion.div>

            {/* Stat Card 3: Available Vehicles */}
            <motion.div variants={itemVariants} className="rounded-2xl border glass-card p-5 relative overflow-hidden group select-none">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Available Now</p>
                  <h3 className="text-3xl font-extrabold mt-1 text-emerald-400">{availableVehicles}</h3>
                </div>
                <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/40 pt-3">
                <span className="font-semibold text-emerald-400">{Math.round((availableVehicles/totalVehicles)*100)}% available</span>
                <span>Ready to assign</span>
              </div>
            </motion.div>

            {/* Stat Card 4: Under Maintenance */}
            <motion.div variants={itemVariants} className="rounded-2xl border glass-card p-5 relative overflow-hidden group select-none">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-colors" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Maintenance</p>
                  <h3 className="text-3xl font-extrabold mt-1 text-amber-400">{maintenanceVehicles}</h3>
                </div>
                <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/10 text-amber-400 group-hover:scale-110 transition-transform">
                  <Wrench className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/40 pt-3">
                <span className="font-semibold text-amber-400">{maintenanceVehicles} blocked</span>
                <span>Safety standard checks</span>
              </div>
            </motion.div>
          </motion.div>
        )}

        {totalVehicles > 0 && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Left side: Recent bookings feed & Revenue */}
            <div className="xl:col-span-2 space-y-6">
              {/* Recent Bookings Panel */}
              <div className="border glass-card rounded-2xl p-5 relative overflow-hidden">
                <div className="flex items-center justify-between border-b border-slate-800/40 pb-4 mb-4">
                  <h3 className="text-base font-bold text-slate-200 flex items-center gap-2">
                    <CalendarRange className="w-4.5 h-4.5 text-indigo-400" />
                    <span>Recent Activity Feed</span>
                  </h3>
                  <Link
                    href="/bookings"
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 hover:underline"
                  >
                    <span>View all Bookings</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="text-slate-400 text-xs font-semibold uppercase tracking-wider border-b border-slate-800/50 pb-2">
                        <th className="py-2.5">Customer / Route</th>
                        <th>Dates</th>
                        <th>Assigned Vehicle</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/20 text-slate-300 font-medium">
                      {bookings.slice(0, 5).map((booking) => {
                        const vehicle = vehicles.find(v => v.id === booking.assignedVehicle);
                        
                        const statusColors = {
                          Confirmed: "status-glow-available border border-emerald-500/20 text-emerald-400",
                          Pending: "status-glow-maintenance border border-amber-500/20 text-amber-400",
                          Cancelled: "status-glow-out border border-slate-500/20 text-slate-400",
                          Completed: "status-glow-booked border border-rose-500/20 text-rose-400",
                        };

                        const formattedPickup = new Date(booking.pickupDate).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric'
                        });

                        return (
                          <tr key={booking.id} className="hover:bg-slate-800/10 transition-colors">
                            <td className="py-3">
                              <p className="text-slate-200 font-semibold text-sm truncate max-w-[150px]">
                                {booking.customerName}
                              </p>
                              <span className="text-[10px] text-slate-400 font-normal">
                                {booking.pickupLocation} → {booking.dropLocation}
                              </span>
                            </td>
                            <td>
                              <p className="text-slate-200 text-xs font-semibold">
                                {formattedPickup}
                              </p>
                              <span className="text-[10px] text-slate-500 font-normal">
                                {new Date(booking.pickupDate).toLocaleTimeString(undefined, {hour: '2-digit', minute:'2-digit'})}
                              </span>
                            </td>
                            <td>
                              <span className="text-xs text-indigo-300 hover:underline">
                                {vehicle?.vehicleName || "Unknown Vehicle"}
                              </span>
                            </td>
                            <td>
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-extrabold ${statusColors[booking.bookingStatus]}`}>
                                {booking.bookingStatus}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Revenue Snapshot Card */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border glass-card rounded-2xl p-5 relative overflow-hidden group select-none">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl" />
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/10 text-emerald-400">
                      <Coins className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Realized Revenue</p>
                      <h4 className="text-xl font-black text-slate-200 mt-0.5">
                        ₹ {totalRevenue.toLocaleString("en-IN")}
                      </h4>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-500 font-semibold mt-4">
                    Based on paid, active, or completed trips in local database.
                  </p>
                </div>

                <div className="border glass-card rounded-2xl p-5 relative overflow-hidden group select-none">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl" />
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/10 text-indigo-400">
                      <Compass className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Fleet Utilization</p>
                      <h4 className="text-xl font-black text-slate-200 mt-0.5">
                        {Math.round(((vehicles.filter(v => v.status === "Booked" || v.status === "On Trip").length) / totalVehicles) * 100)} %
                      </h4>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-500 font-semibold mt-4">
                    Current active booking ratio of operational fleet.
                  </p>
                </div>
              </div>
            </div>

            {/* Right side: Radial Utilization gauge */}
            <div className="border glass-card rounded-2xl p-5 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-200 mb-1">Fleet Allocation</h3>
                <p className="text-xs text-slate-400 font-medium">Visual distribution of vehicle statuses.</p>
              </div>

              {/* Custom SVG Radial / Donut Visual Chart */}
              <div className="relative flex items-center justify-center my-6 h-48">
                {/* SVG Ring circles */}
                <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    className="stroke-slate-800/40 fill-transparent"
                    strokeWidth="8"
                  />
                  {/* Green slice: Available */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    className="stroke-emerald-500 fill-transparent"
                    strokeWidth="8"
                    strokeDasharray={`${availPercent * 2.51} 251`}
                    strokeLinecap="round"
                  />
                  {/* Red slice: Booked */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    className="stroke-rose-500 fill-transparent"
                    strokeWidth="8"
                    strokeDasharray={`${bookedPercent * 2.51} 251`}
                    strokeDashoffset={`-${availPercent * 2.51}`}
                    strokeLinecap="round"
                  />
                  {/* Yellow slice: Maintenance */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    className="stroke-amber-500 fill-transparent"
                    strokeWidth="8"
                    strokeDasharray={`${maintPercent * 2.51} 251`}
                    strokeDashoffset={`-${(availPercent + bookedPercent) * 2.51}`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute text-center">
                  <h4 className="text-3xl font-black text-slate-200">
                    {availPercent}%
                  </h4>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                    Available
                  </p>
                </div>
              </div>

              {/* Status legends */}
              <div className="space-y-2 border-t border-slate-800/40 pt-4 text-xs font-semibold">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="text-slate-400">Available</span>
                  </div>
                  <span className="text-slate-200">{availableVehicles} vehicles</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <span className="text-slate-400">Booked / On Trip</span>
                  </div>
                  <span className="text-slate-200">
                    {vehicles.filter(v => v.status === "Booked" || v.status === "On Trip").length} vehicles
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span className="text-slate-400">Maintenance</span>
                  </div>
                  <span className="text-slate-200">{maintenanceVehicles} vehicles</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
