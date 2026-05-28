"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import { useFleetStore, Vehicle, Booking } from "@/store/fleetStore";
import { useToastStore } from "@/store/toastStore";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Car, 
  Users, 
  Plus,
  Compass,
  X,
  Sparkles,
  Info,
  Clock,
  MapPin,
  CircleDollarSign,
  AlertTriangle,
  Phone
} from "lucide-react";

export default function CalendarPage() {
  const { 
    vehicles, 
    bookings, 
    isVehicleAvailable, 
    addBooking, 
    updateBooking 
  } = useFleetStore();

  const { addToast } = useToastStore();

  // Calendar States
  const [viewMode, setViewMode] = useState<"Daily" | "Weekly" | "Monthly">("Monthly");
  const [currentDate, setCurrentDate] = useState<Date>(new Date("2026-05-29T10:00:00")); // Anchor around mock data base

  // Booking Form Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);

  // Form Fields
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [pickupLocation, setPickupLocation] = useState("");
  const [dropLocation, setDropLocation] = useState("");
  const [pickupDate, setPickupDate] = useState("");
  const [dropDate, setDropDate] = useState("");
  const [assignedVehicle, setAssignedVehicle] = useState("");
  const [bookingStatus, setBookingStatus] = useState<Booking["bookingStatus"]>("Confirmed");
  const [paymentStatus, setPaymentStatus] = useState<Booking["paymentStatus"]>("Paid");
  const [totalAmount, setTotalAmount] = useState(5000);
  const [formLoading, setFormLoading] = useState(false);
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);

  // Sync collision warning when inputs change
  useEffect(() => {
    if (!assignedVehicle || !pickupDate || !dropDate) {
      setConflictWarning(null);
      return;
    }
    if (new Date(pickupDate).getTime() >= new Date(dropDate).getTime()) {
      setConflictWarning("Invalid Dates: Drop date must be after pickup date.");
      return;
    }
    const check = isVehicleAvailable(assignedVehicle, pickupDate, dropDate, editingBooking?.id);
    if (!check.available) {
      if (check.conflict) {
        setConflictWarning(
          `Conflict: Already booked by ${check.conflict.customerName} (${new Date(check.conflict.pickupDate).toLocaleDateString()} - ${new Date(check.conflict.dropDate).toLocaleDateString()}).`
        );
      } else {
        setConflictWarning("Conflict: Marked Out of Service or in Maintenance.");
      }
    } else {
      setConflictWarning(null);
    }
  }, [assignedVehicle, pickupDate, dropDate, editingBooking, isVehicleAvailable]);

  // Open booking generator drawer for an empty cell click
  const handleOpenAddEmpty = (vehicleId: string, startDateStr: string, endDateStr: string) => {
    setEditingBooking(null);
    setCustomerName("");
    setPhone("");
    setPickupLocation("");
    setDropLocation("");
    setPickupDate(startDateStr);
    setDropDate(endDateStr);
    setAssignedVehicle(vehicleId);
    setBookingStatus("Confirmed");
    setPaymentStatus("Paid");
    setTotalAmount(4500);
    setConflictWarning(null);
    setIsModalOpen(true);
  };

  // Open edit booking drawer for visual bar click
  const handleOpenEdit = (booking: Booking) => {
    setEditingBooking(booking);
    setCustomerName(booking.customerName);
    setPhone(booking.phone);
    setPickupLocation(booking.pickupLocation);
    setDropLocation(booking.dropLocation);
    setPickupDate(booking.pickupDate);
    setDropDate(booking.dropDate);
    setAssignedVehicle(booking.assignedVehicle);
    setBookingStatus(booking.bookingStatus);
    setPaymentStatus(booking.paymentStatus);
    setTotalAmount(booking.totalAmount || 0);
    setIsModalOpen(true);
  };

  // Submit booking handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !phone || !pickupLocation || !dropLocation || !pickupDate || !dropDate || !assignedVehicle) {
      addToast("Please fill in all required fields.", "warning");
      return;
    }
    if (conflictWarning && conflictWarning.startsWith("Conflict")) {
      addToast("Double-booking reservation blocked by system engine.", "error");
      return;
    }

    setFormLoading(true);
    const bookingData = {
      customerName,
      phone,
      pickupLocation,
      dropLocation,
      pickupDate,
      dropDate,
      assignedVehicle,
      bookingStatus,
      paymentStatus,
      totalAmount: Number(totalAmount),
    };

    try {
      if (editingBooking) {
        await updateBooking(editingBooking.id, bookingData);
        addToast(`Modified ${customerName}'s reservation details.`, "success");
      } else {
        await addBooking(bookingData);
        addToast(`Successfully booked vehicle for ${customerName}!`, "success");
      }
      setIsModalOpen(false);
    } catch (err: any) {
      addToast(err.message || "Failed to submit booking.", "error");
    } finally {
      setFormLoading(false);
    }
  };

  // Timeline builders depending on views
  const getDaysInMonth = (date: Date) => {
    const y = date.getFullYear();
    const m = date.getMonth();
    return new Date(y, m + 1, 0).getDate();
  };

  const shiftTime = (direction: "prev" | "next") => {
    const d = new Date(currentDate);
    if (viewMode === "Daily") {
      d.setDate(d.getDate() + (direction === "next" ? 1 : -1));
    } else if (viewMode === "Weekly") {
      d.setDate(d.getDate() + (direction === "next" ? 7 : -7));
    } else {
      d.setMonth(d.getMonth() + (direction === "next" ? 1 : -1));
    }
    setCurrentDate(d);
  };

  // 1. Monthly Columns Builder
  const buildMonthlyTimeline = () => {
    const totalDays = getDaysInMonth(currentDate);
    const columns = [];
    for (let i = 1; i <= totalDays; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
      columns.push({
        label: i.toString(),
        sublabel: date.toLocaleDateString(undefined, { weekday: "narrow" }),
        dateKey: `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${i.toString().padStart(2, '0')}`,
        dateObj: date,
      });
    }
    return columns;
  };

  // 2. Weekly Columns Builder
  const buildWeeklyTimeline = () => {
    const columns = [];
    const base = new Date(currentDate);
    // Align with Monday of that week
    const day = base.getDay();
    const diff = base.getDate() - day + (day === 0 ? -6 : 1);
    const startOfWeek = new Date(base.setDate(diff));
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      columns.push({
        label: date.toLocaleDateString(undefined, { weekday: "short" }),
        sublabel: date.getDate().toString(),
        dateKey: `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`,
        dateObj: date,
      });
    }
    return columns;
  };

  // 3. Daily Columns Builder
  const buildDailyTimeline = () => {
    const columns = [];
    for (let h = 0; h < 24; h += 2) {
      columns.push({
        label: `${h.toString().padStart(2, '0')}:00`,
        sublabel: "",
        dateKey: `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${currentDate.getDate().toString().padStart(2, '0')}T${h.toString().padStart(2, '0')}:00`,
        hour: h,
      });
    }
    return columns;
  };

  // Render variables
  const timelineColumns = viewMode === "Daily" 
    ? buildDailyTimeline() 
    : viewMode === "Weekly" 
      ? buildWeeklyTimeline() 
      : buildMonthlyTimeline();

  const formattedHeader = () => {
    if (viewMode === "Daily") {
      return currentDate.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    } else if (viewMode === "Weekly") {
      const base = new Date(currentDate);
      const day = base.getDay();
      const diff = base.getDate() - day + (day === 0 ? -6 : 1);
      const start = new Date(base.setDate(diff));
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      return `Week of ${start.toLocaleDateString(undefined, {month:'short', day:'numeric'})} - ${end.toLocaleDateString(undefined, {month:'short', day:'numeric', year:'numeric'})}`;
    } else {
      return currentDate.toLocaleDateString(undefined, { year: 'numeric', month: 'long' });
    }
  };

  // Helper: Find which active booking falls into a specific row cell
  const getCellEvent = (vehicleId: string, dateKey: string, hour?: number) => {
    // 1. Check if vehicle is in maintenance or out of service
    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (!vehicle) return null;

    if (vehicle.status === "Out of Service") {
      return { type: "out" as const, label: "Out of Service" };
    }

    if (vehicle.status === "Maintenance" || vehicle.maintenanceStatus === "Under Maintenance") {
      return { type: "maintenance" as const, label: "Maintenance" };
    }

    // 2. Check bookings
    const activeBookings = bookings.filter(b => 
      b.assignedVehicle === vehicleId &&
      (b.bookingStatus === "Confirmed" || b.bookingStatus === "Pending")
    );

    for (const b of activeBookings) {
      const pick = new Date(b.pickupDate);
      const drop = new Date(b.dropDate);

      if (viewMode === "Daily" && hour !== undefined) {
        // Precise daily hour overlapping checks
        const cellTime = new Date(`${dateKey.split('T')[0]}T${hour.toString().padStart(2, '0')}:00`).getTime();
        const cellTimeEnd = cellTime + 2 * 60 * 60 * 1000; // 2 hour cells

        if (pick.getTime() < cellTimeEnd && drop.getTime() > cellTime) {
          return { type: "booking" as const, booking: b };
        }
      } else {
        // Daily/Weekly overlapping checks
        const cellDayStart = new Date(`${dateKey}T00:00:00`).getTime();
        const cellDayEnd = new Date(`${dateKey}T23:59:59`).getTime();

        if (pick.getTime() < cellDayEnd && drop.getTime() > cellDayStart) {
          return { type: "booking" as const, booking: b };
        }
      }
    }

    return null;
  };

  return (
    <AdminLayout>
      <div className="space-y-6 select-none h-full flex flex-col">
        {/* Header toolbar */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-slate-800/40 pb-5">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
              Fleet Scheduler Calendar
            </h2>
            <p className="text-sm text-slate-400 font-medium mt-1">
              Visualize availability, drill down into customer bookings, and book free slots directly.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* View Mode selection */}
            <div className="flex border border-slate-800 bg-slate-950/40 p-1 rounded-xl">
              {(["Daily", "Weekly", "Monthly"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    viewMode === mode 
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10" 
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>

            {/* Time Shifters */}
            <div className="flex items-center gap-2 border border-slate-800 bg-slate-950/40 p-1 rounded-xl">
              <button
                onClick={() => shiftTime("prev")}
                className="p-1.5 rounded-lg hover:bg-slate-900 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-bold text-slate-300 min-w-[120px] text-center px-2 truncate">
                {formattedHeader()}
              </span>
              <button
                onClick={() => shiftTime("next")}
                className="p-1.5 rounded-lg hover:bg-slate-900 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Legend Indicator Map */}
        <div className="flex flex-wrap items-center gap-5 text-[11px] font-bold text-slate-400 border border-slate-800/40 bg-slate-900/10 px-4 py-2.5 rounded-xl">
          <span className="uppercase tracking-widest text-slate-500 mr-2">Color Codes:</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-emerald-500/80 shadow-[0_0_8px_rgba(34,197,94,0.3)]" />
            <span>Available (Green)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-rose-500/80 shadow-[0_0_8px_rgba(239,68,68,0.3)]" />
            <span>Booked / Reserved (Red)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-amber-500/80 shadow-[0_0_8px_rgba(234,179,8,0.3)]" />
            <span>Maintenance Block (Yellow)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-slate-600/80" />
            <span>Out of Service (Gray)</span>
          </div>
        </div>

        {/* Timeline Grid Container */}
        {vehicles.length === 0 ? (
          <div className="rounded-3xl border glass-card p-12 text-center max-w-md mx-auto my-12">
            <Info className="w-10 h-10 text-slate-500 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-slate-200">No Fleet Inventory Loaded</h4>
            <p className="text-xs text-slate-400 mt-1">
              Initialize demo data in the Dashboard to visualize scheduler timelines.
            </p>
          </div>
        ) : (
          <div className="flex-grow border glass-card rounded-2xl overflow-hidden flex flex-col">
            {/* Horizontal Timeline Scrolling window */}
            <div className="overflow-x-auto overflow-y-hidden flex-grow relative max-w-full">
              {/* Header dates/hours */}
              <div 
                className="grid calendar-grid border-b border-slate-800/40 bg-slate-950/40 text-center py-3 select-none"
                style={{ "--calendar-cols": timelineColumns.length } as React.CSSProperties}
              >
                <div className="px-4 text-left font-black uppercase text-[10px] tracking-wider text-slate-400 border-r border-slate-800/40 flex items-center">
                  Fleet Registry
                </div>
                {timelineColumns.map((col, idx) => (
                  <div key={idx} className="flex flex-col items-center justify-center border-r border-slate-800/20 text-[10px] font-semibold">
                    <span className="text-slate-400">{col.label}</span>
                    {col.sublabel && (
                      <span className="text-slate-500 text-[9px] font-extrabold uppercase mt-0.5">{col.sublabel}</span>
                    )}
                  </div>
                ))}
              </div>

              {/* Rows */}
              <div className="divide-y divide-slate-800/40 overflow-y-auto max-h-[calc(100vh-360px)]">
                {vehicles.map((v) => (
                  <div 
                    key={v.id} 
                    className="grid calendar-grid group/row hover:bg-slate-800/5 items-stretch"
                    style={{ "--calendar-cols": timelineColumns.length } as React.CSSProperties}
                  >
                    {/* Leftmost column: Vehicle Details card */}
                    <div className="px-4 py-3 border-r border-slate-800/40 bg-slate-950/10 group-hover/row:bg-slate-950/30 flex items-center gap-3 select-none sticky left-0 z-10 flex-shrink-0">
                      <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-indigo-400 shadow-inner flex-shrink-0">
                        <Car className="w-4 h-4" />
                      </div>
                      <div className="overflow-hidden">
                        <h4 className="text-xs font-extrabold text-slate-200 group-hover/row:text-indigo-300 transition-colors truncate">
                          {v.vehicleName}
                        </h4>
                        <div className="flex items-center gap-1.5 mt-0.5 text-[9px] font-extrabold text-slate-500 uppercase">
                          <Users className="w-3 h-3 text-slate-600 flex-shrink-0" />
                          <span>{v.seatingCapacity} Seats</span>
                        </div>
                      </div>
                    </div>

                    {/* Timeline columns for this vehicle */}
                    {timelineColumns.map((col, idx) => {
                      const event = getCellEvent(v.id, col.dateKey, 'hour' in col ? col.hour : undefined);

                      if (event?.type === "booking") {
                        const b = event.booking!;
                        return (
                          <div 
                            key={idx} 
                            onClick={() => handleOpenEdit(b)}
                            className="border-r border-slate-800/20 p-1 flex items-center relative z-2 cursor-pointer select-none"
                          >
                            <div className="w-full h-8 rounded-lg status-glow-booked flex items-center px-2 text-[9px] font-extrabold uppercase overflow-hidden leading-tight truncate border timeline-event-bar select-none animate-pulse hover:animate-none">
                              <span className="truncate">{b.customerName}</span>
                            </div>
                          </div>
                        );
                      }

                      if (event?.type === "maintenance") {
                        return (
                          <div key={idx} className="border-r border-slate-800/20 p-1 flex items-center relative z-2 select-none cursor-default">
                            <div className="w-full h-8 rounded-lg status-glow-maintenance flex items-center justify-center text-[9px] font-extrabold uppercase border timeline-event-bar select-none">
                              <span className="truncate text-center">Service</span>
                            </div>
                          </div>
                        );
                      }

                      if (event?.type === "out") {
                        return (
                          <div key={idx} className="border-r border-slate-800/20 p-1 flex items-center relative z-2 select-none cursor-default">
                            <div className="w-full h-8 rounded-lg status-glow-out flex items-center justify-center text-[9px] font-extrabold uppercase border select-none opacity-50">
                              <span>Out</span>
                            </div>
                          </div>
                        );
                      }

                      // Empty Slot (Available)
                      let startClickDate = "";
                      let endClickDate = "";
                      const cellHour = "hour" in col ? col.hour : undefined;

                      if (viewMode === "Daily" && cellHour !== undefined) {
                        const baseStr = col.dateKey.split('T')[0];
                        const pad = (n: number) => n.toString().padStart(2, '0');
                        startClickDate = `${baseStr}T${pad(cellHour)}:00`;
                        endClickDate = `${baseStr}T${pad(cellHour + 2)}:00`;
                      } else {
                        // Monthly/Weekly views: Whole day booking
                        const pad = (n: number) => n.toString().padStart(2, '0');
                        const start = "dateObj" in col && col.dateObj ? col.dateObj : new Date();
                        startClickDate = `${start.getFullYear()}-${pad(start.getMonth() + 1)}-${pad(start.getDate())}T10:00`;
                        
                        const end = new Date(start);
                        end.setDate(start.getDate() + 1);
                        endClickDate = `${end.getFullYear()}-${pad(end.getMonth() + 1)}-${pad(end.getDate())}T18:00`;
                      }

                      return (
                        <div 
                          key={idx}
                          onClick={() => handleOpenAddEmpty(v.id, startClickDate, endClickDate)}
                          className="border-r border-slate-800/20 hover:bg-emerald-950/15 relative z-1 transition-all flex items-center justify-center group/cell cursor-pointer group-hover/row:border-emerald-500/5 select-none"
                        >
                          <div className="opacity-0 group-hover/cell:opacity-100 p-1 rounded bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 scale-90 group-hover/cell:scale-100 transition-all select-none">
                            <Plus className="w-3.5 h-3.5" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Modal Drawer Form for quick creations / edits */}
        <AnimatePresence>
          {isModalOpen && (
            <>
              {/* Overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsModalOpen(false)}
                className="fixed inset-0 bg-slate-950 z-45 backdrop-blur-sm"
              />

              {/* Slider drawer panel */}
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 28, stiffness: 220 }}
                className="fixed inset-y-0 right-0 w-full max-w-lg bg-[#030712] border-l border-slate-800/60 z-50 p-6 md:p-8 flex flex-col justify-between shadow-2xl overflow-y-auto h-full select-none"
              >
                <div>
                  {/* Drawer Header */}
                  <div className="flex items-center justify-between border-b border-slate-800/40 pb-4 mb-6">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-indigo-950 border border-indigo-800 text-indigo-400">
                        <CalendarIcon className="w-5 h-5 animate-pulse" />
                      </div>
                      <div>
                        <h3 className="text-base font-extrabold text-slate-100">
                          {editingBooking ? "Edit Booking Details" : "Quick Dispatch Reservation"}
                        </h3>
                        <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                          Manivtha Booking Dispatch
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsModalOpen(false)}
                      className="p-1.5 rounded-xl border border-slate-800 hover:bg-slate-900 text-slate-400 hover:text-slate-200 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold">
                    {/* Live Overlap alert banner */}
                    {conflictWarning && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-4 rounded-xl border border-rose-500/20 bg-rose-950/20 text-rose-300 flex items-start gap-2.5 shadow-[0_0_15px_rgba(239,68,68,0.1)]"
                      >
                        <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-extrabold uppercase tracking-wider">Collision Alert</p>
                          <p className="mt-1 font-medium leading-relaxed">{conflictWarning}</p>
                        </div>
                      </motion.div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      {/* Customer Name */}
                      <div className="space-y-1.5">
                        <label className="text-slate-400 uppercase tracking-wider">
                          Customer Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          placeholder="e.g. Preeti Sinha"
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-800/80 bg-slate-950/40 text-xs placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-all text-slate-100"
                        />
                      </div>

                      {/* Phone */}
                      <div className="space-y-1.5">
                        <label className="text-slate-400 uppercase tracking-wider">
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="e.g. +91 93412 11002"
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-800/80 bg-slate-950/40 text-xs placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-all text-slate-100"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Pickup Location */}
                      <div className="space-y-1.5">
                        <label className="text-slate-400 uppercase tracking-wider">
                          Pickup Node *
                        </label>
                        <input
                          type="text"
                          required
                          value={pickupLocation}
                          onChange={(e) => setPickupLocation(e.target.value)}
                          placeholder="e.g. Indiranagar"
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-800/80 bg-slate-950/40 text-xs placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-all text-slate-100"
                        />
                      </div>

                      {/* Drop Location */}
                      <div className="space-y-1.5">
                        <label className="text-slate-400 uppercase tracking-wider">
                          Drop Node *
                        </label>
                        <input
                          type="text"
                          required
                          value={dropLocation}
                          onChange={(e) => setDropLocation(e.target.value)}
                          placeholder="e.g. Mysore Resorts"
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-800/80 bg-slate-950/40 text-xs placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-all text-slate-100"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Pickup Date */}
                      <div className="space-y-1.5">
                        <label className="text-slate-400 uppercase tracking-wider">
                          Pickup Date & Time *
                        </label>
                        <input
                          type="datetime-local"
                          required
                          value={pickupDate}
                          onChange={(e) => setPickupDate(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-800/80 bg-slate-950/40 text-xs focus:outline-none focus:border-indigo-500 transition-all text-slate-100"
                        />
                      </div>

                      {/* Drop Date */}
                      <div className="space-y-1.5">
                        <label className="text-slate-400 uppercase tracking-wider">
                          Drop Date & Time *
                        </label>
                        <input
                          type="datetime-local"
                          required
                          value={dropDate}
                          onChange={(e) => setDropDate(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-800/80 bg-slate-950/40 text-xs focus:outline-none focus:border-indigo-500 transition-all text-slate-100"
                        />
                      </div>
                    </div>

                    {/* Assigned Vehicle Selector (Enforces collision checks) */}
                    <div className="space-y-1.5">
                      <label className="text-slate-400 uppercase tracking-wider block">
                        Assigned Vehicle * (Evaluated in Selected Dates)
                      </label>
                      <select
                        value={assignedVehicle}
                        onChange={(e) => setAssignedVehicle(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-800/80 bg-slate-950/40 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 transition-all"
                      >
                        <option value="" disabled>Select active vehicle</option>
                        {vehicles.map((v) => {
                          const availabilityStatus = isVehicleAvailable(v.id, pickupDate, dropDate, editingBooking?.id);
                          
                          let suffix = " [Available]";
                          let isDisabled = false;

                          if (v.status === "Out of Service" || v.maintenanceStatus === "Under Maintenance") {
                            suffix = " [Out of Service / In Maintenance]";
                            isDisabled = true;
                          } else if (!availabilityStatus.available) {
                            suffix = availabilityStatus.conflict 
                              ? ` [Double Booking Conflict: reserved by ${availabilityStatus.conflict.customerName}]`
                              : " [Blocked]";
                            isDisabled = true;
                          }

                          return (
                            <option key={v.id} value={v.id} disabled={isDisabled} className={isDisabled ? "text-rose-500/50" : "text-emerald-400"}>
                              {v.vehicleName} ({v.vehicleNumber}) - {v.seatingCapacity}S {suffix}
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Booking Status */}
                      <div className="space-y-1.5">
                        <label className="text-slate-400 uppercase tracking-wider">
                          Confirmation Status *
                        </label>
                        <select
                          value={bookingStatus}
                          onChange={(e) => setBookingStatus(e.target.value as Booking["bookingStatus"])}
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-800/80 bg-slate-950/40 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 transition-all"
                        >
                          <option value="Confirmed">Confirmed</option>
                          <option value="Pending">Pending</option>
                          <option value="Cancelled">Cancelled</option>
                          <option value="Completed">Completed</option>
                        </select>
                      </div>

                      {/* Payment Status */}
                      <div className="space-y-1.5">
                        <label className="text-slate-400 uppercase tracking-wider">
                          Payment Status *
                        </label>
                        <select
                          value={paymentStatus}
                          onChange={(e) => setPaymentStatus(e.target.value as Booking["paymentStatus"])}
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-800/80 bg-slate-950/40 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 transition-all"
                        >
                          <option value="Paid">Paid</option>
                          <option value="Partial">Partial</option>
                          <option value="Unpaid">Unpaid</option>
                        </select>
                      </div>
                    </div>

                    {/* Pricing */}
                    <div className="space-y-1.5">
                      <label className="text-slate-400 uppercase tracking-wider flex items-center gap-1">
                        <CircleDollarSign className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Estimated Bill (INR ₹) *</span>
                      </label>
                      <input
                        type="number"
                        required
                        value={totalAmount}
                        onChange={(e) => setTotalAmount(Number(e.target.value))}
                        placeholder="e.g. 4500"
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-800/80 bg-slate-950/40 text-xs placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-all text-slate-100"
                      />
                    </div>
                  </form>
                </div>

                {/* Form Footer */}
                <div className="flex gap-3 border-t border-slate-800/40 pt-4 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-3 rounded-xl border border-slate-800 bg-slate-950/20 hover:bg-slate-900 text-slate-300 font-bold text-xs transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={formLoading || (!!conflictWarning && conflictWarning.startsWith("Conflict"))}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {formLoading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{editingBooking ? "Save Changes" : "Confirm Booking"}</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  );
}
