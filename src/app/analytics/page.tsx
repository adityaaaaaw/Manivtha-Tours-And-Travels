"use client";

import AdminLayout from "@/components/AdminLayout";
import { useFleetStore } from "@/store/fleetStore";
import { motion } from "framer-motion";
import { 
  BarChart3, 
  Coins, 
  Car, 
  TrendingUp, 
  ShieldAlert, 
  CalendarCheck,
  CheckCircle,
  Users,
  Compass
} from "lucide-react";

export default function AnalyticsPage() {
  const { vehicles, bookings } = useFleetStore();

  const totalVehicles = vehicles.length;
  const totalBookings = bookings.length;
  
  // Realized Revenue calculation
  const totalRevenue = bookings
    .filter(b => b.bookingStatus !== "Cancelled" && b.paymentStatus === "Paid")
    .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

  // Unpaid bookings log
  const outstandingRevenue = bookings
    .filter(b => b.bookingStatus !== "Cancelled" && b.paymentStatus !== "Paid")
    .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

  // Trips completed
  const completedTrips = bookings.filter(b => b.bookingStatus === "Completed").length;
  const cancelledTrips = bookings.filter(b => b.bookingStatus === "Cancelled").length;
  const activeTrips = bookings.filter(b => b.bookingStatus === "Confirmed" || b.bookingStatus === "Pending").length;

  // Total seat assets
  const totalSeats = vehicles.reduce((sum, v) => sum + v.seatingCapacity, 0);

  // Category analysis builder
  const getCategoryMetrics = (category: string) => {
    const categoryVehicles = vehicles.filter(v => v.type === category);
    const count = categoryVehicles.length;
    
    // Utilization: how many vehicles in this category are booked or on trip
    const allocated = categoryVehicles.filter(v => v.status === "Booked" || v.status === "On Trip").length;
    const utilization = count > 0 ? Math.round((allocated / count) * 100) : 0;
    
    // Category revenue
    const revenue = bookings
      .filter(b => {
        const vehicle = vehicles.find(v => v.id === b.assignedVehicle);
        return vehicle?.type === category && b.bookingStatus !== "Cancelled" && b.paymentStatus === "Paid";
      })
      .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

    return { count, utilization, revenue };
  };

  const categories = ["SUV", "Tempo Traveller", "Luxury Coach", "Sedan"];
  const categoryData = categories.map(cat => ({
    name: cat,
    ...getCategoryMetrics(cat)
  }));

  // Find highest contributing category
  const maxRevenue = Math.max(...categoryData.map(d => d.revenue), 1);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="border-b border-slate-800/40 pb-5">
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
            Revenue & Utilization Analytics
          </h2>
          <p className="text-sm text-slate-400 font-medium mt-1">
            Real-time visual metrics, asset contribution levels, and operational performance indicators.
          </p>
        </div>

        {totalVehicles === 0 ? (
          <div className="rounded-3xl border glass-card p-12 text-center max-w-md mx-auto my-12">
            <BarChart3 className="w-10 h-10 text-slate-500 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-slate-200">No Fleet Metrics</h4>
            <p className="text-xs text-slate-400 mt-1">
              Initialize demo data in the Dashboard to compile analytics reports.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {/* Gross Revenue */}
              <div className="rounded-2xl border glass-card p-5 relative overflow-hidden group select-none">
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl" />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Paid Revenue</p>
                    <h3 className="text-2xl font-black mt-1 text-emerald-400">
                      ₹ {totalRevenue.toLocaleString("en-IN")}
                    </h3>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/10 text-emerald-400">
                    <Coins className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/40 pt-3">
                  <span className="font-semibold text-emerald-400">₹ {outstandingRevenue.toLocaleString("en-IN")} outstanding</span>
                  <span>Realized gross</span>
                </div>
              </div>

              {/* Total Seats */}
              <div className="rounded-2xl border glass-card p-5 relative overflow-hidden group select-none">
                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl" />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Fleet Seats</p>
                    <h3 className="text-2xl font-black mt-1 text-indigo-400">
                      {totalSeats}
                    </h3>
                  </div>
                  <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/10 text-indigo-400">
                    <Users className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/40 pt-3">
                  <span className="font-semibold text-indigo-400">Active seat inventory</span>
                  <span>Passenger cap</span>
                </div>
              </div>

              {/* Booking success rate */}
              <div className="rounded-2xl border glass-card p-5 relative overflow-hidden group select-none">
                <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl" />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Dispatch Rate</p>
                    <h3 className="text-2xl font-black mt-1 text-cyan-400">
                      {totalBookings > 0 ? Math.round(((completedTrips + activeTrips) / totalBookings) * 100) : 0} %
                    </h3>
                  </div>
                  <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/10 text-cyan-400">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/40 pt-3">
                  <span className="font-semibold text-cyan-400">{completedTrips} trips finished</span>
                  <span>Success ratio</span>
                </div>
              </div>

              {/* Safety checks */}
              <div className="rounded-2xl border glass-card p-5 relative overflow-hidden group select-none">
                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl" />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Safety Index</p>
                    <h3 className="text-2xl font-black mt-1 text-amber-400">
                      {Math.round(((vehicles.filter(v => v.maintenanceStatus === "Good").length) / totalVehicles) * 100)} %
                    </h3>
                  </div>
                  <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/10 text-amber-400">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/40 pt-3">
                  <span className="font-semibold text-amber-400">{vehicles.filter(v => v.maintenanceStatus === "Good").length} healthy</span>
                  <span>Fleet health</span>
                </div>
              </div>
            </div>

            {/* Performance charts and proportions */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Category Capacity Utilization */}
              <div className="border glass-card rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-200 flex items-center gap-2">
                    <BarChart3 className="w-4.5 h-4.5 text-indigo-400" />
                    <span>Category Utilization Levels</span>
                  </h3>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">
                    Percentage of vehicles actively booked or on trips by category.
                  </p>
                </div>

                <div className="space-y-4 my-6">
                  {categoryData.map((d) => (
                    <div key={d.name} className="space-y-1.5 text-xs font-semibold">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-300">{d.name} ({d.count} Cars)</span>
                        <span className="text-indigo-400">{d.utilization}% Busy</span>
                      </div>
                      <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                        <div 
                          className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-cyan-500 shadow-[0_0_8px_rgba(99,102,241,0.3)]"
                          style={{ width: `${d.utilization}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-slate-800/40 pt-3 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                  Calculated based on live operational statuses in dispatch logs.
                </div>
              </div>

              {/* Proportional Revenue contributions */}
              <div className="border glass-card rounded-2xl p-5 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-200 flex items-center gap-2">
                    <Coins className="w-4.5 h-4.5 text-emerald-400" />
                    <span>Financial Contribution by Type</span>
                  </h3>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">
                    Relative realized revenue contributions from each fleet category.
                  </p>
                </div>

                <div className="space-y-4 my-6">
                  {categoryData.map((d) => {
                    const ratio = maxRevenue > 0 ? (d.revenue / maxRevenue) * 100 : 0;
                    return (
                      <div key={d.name} className="space-y-1.5 text-xs font-semibold">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-300">{d.name}</span>
                          <span className="text-emerald-400">
                            ₹ {d.revenue.toLocaleString("en-IN")}
                          </span>
                        </div>
                        <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                          <div 
                            className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-teal-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]"
                            style={{ width: `${ratio}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="border-t border-slate-800/40 pt-3 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                  Paid accounts only. Excludes pending or cancelled trips.
                </div>
              </div>
            </div>

            {/* Trip Dispatches breakdown stats */}
            <div className="border glass-card rounded-2xl p-5">
              <h3 className="text-base font-bold text-slate-200 mb-4 flex items-center gap-2">
                <CalendarCheck className="w-4.5 h-4.5 text-cyan-400" />
                <span>Dispatch Summary Report</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center text-xs font-semibold py-2">
                {/* Active/Pending */}
                <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-900/30">
                  <span className="text-[10px] text-indigo-400 font-extrabold uppercase tracking-widest block">
                    Active & Scheduled
                  </span>
                  <h4 className="text-3xl font-black text-indigo-300 mt-2">
                    {activeTrips}
                  </h4>
                  <p className="text-[10px] text-slate-500 font-medium mt-1">
                    Bookings waiting or current
                  </p>
                </div>

                {/* Completed */}
                <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-900/30">
                  <span className="text-[10px] text-emerald-400 font-extrabold uppercase tracking-widest block">
                    Trips Completed
                  </span>
                  <h4 className="text-3xl font-black text-emerald-300 mt-2">
                    {completedTrips}
                  </h4>
                  <p className="text-[10px] text-slate-500 font-medium mt-1">
                    Delivered tours & travels
                  </p>
                </div>

                {/* Cancelled */}
                <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/40">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block">
                    Trips Cancelled
                  </span>
                  <h4 className="text-3xl font-black text-slate-400 mt-2">
                    {cancelledTrips}
                  </h4>
                  <p className="text-[10px] text-slate-500 font-medium mt-1">
                    Cancelled reservations
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
