"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import { useFleetStore, Booking, Vehicle } from "@/store/fleetStore";
import { useToastStore } from "@/store/toastStore";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ClipboardList, 
  Plus, 
  Search, 
  MapPin, 
  Calendar, 
  Car, 
  X, 
  Sparkles, 
  Info,
  Trash2,
  AlertTriangle,
  Check,
  Ban,
  Clock,
  CircleDollarSign,
  Phone
} from "lucide-react";

export default function BookingsPage() {
  const { 
    bookings, 
    vehicles, 
    loading, 
    addBooking, 
    updateBooking, 
    isVehicleAvailable 
  } = useFleetStore();
  
  const { addToast } = useToastStore();

  // Search & Filter State
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [paymentFilter, setPaymentFilter] = useState("All");

  // Drawer / Form State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
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

  // Live conflict warning state
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);

  const bookingStatuses: Booking["bookingStatus"][] = ["Confirmed", "Pending", "Cancelled", "Completed"];
  const paymentStatuses: Booking["paymentStatus"][] = ["Paid", "Partial", "Unpaid"];

  // Reset Form
  const resetForm = () => {
    setCustomerName("");
    setPhone("");
    setPickupLocation("");
    setDropLocation("");
    
    // Set default dates as today and tomorrow at 10am
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T10:00`;
    
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = `${tomorrow.getFullYear()}-${pad(tomorrow.getMonth() + 1)}-${pad(tomorrow.getDate())}T18:00`;
    
    setPickupDate(todayStr);
    setDropDate(tomorrowStr);
    
    // Default to first available vehicle if any
    const firstAvail = vehicles.find(v => v.status === "Available")?.id || "";
    setAssignedVehicle(firstAvail);
    
    setBookingStatus("Confirmed");
    setPaymentStatus("Paid");
    setTotalAmount(5000);
    setConflictWarning(null);
  };

  // Open Drawer for Add
  const handleOpenAdd = () => {
    setEditingBooking(null);
    resetForm();
    setIsDrawerOpen(true);
  };

  // Open Drawer for Edit
  const handleOpenEdit = (b: Booking) => {
    setEditingBooking(b);
    setCustomerName(b.customerName);
    setPhone(b.phone);
    setPickupLocation(b.pickupLocation);
    setDropLocation(b.dropLocation);
    setPickupDate(b.pickupDate);
    setDropDate(b.dropDate);
    setAssignedVehicle(b.assignedVehicle);
    setBookingStatus(b.bookingStatus);
    setPaymentStatus(b.paymentStatus);
    setTotalAmount(b.totalAmount || 0);
    setIsDrawerOpen(true);
  };

  // Trigger real-time overlapping checking when Form fields change
  useEffect(() => {
    if (!assignedVehicle || !pickupDate || !dropDate) {
      setConflictWarning(null);
      return;
    }

    if (new Date(pickupDate).getTime() >= new Date(dropDate).getTime()) {
      setConflictWarning("Invalid Dates: Drop date must be after pickup date.");
      return;
    }

    // Call validation engine from Zustand store
    const check = isVehicleAvailable(assignedVehicle, pickupDate, dropDate, editingBooking?.id);
    if (!check.available) {
      if (check.conflict) {
        setConflictWarning(
          `Conflict: This vehicle is already reserved by ${check.conflict.customerName} (${new Date(check.conflict.pickupDate).toLocaleDateString()} - ${new Date(check.conflict.dropDate).toLocaleDateString()}).`
        );
      } else {
        setConflictWarning("Conflict: This vehicle is currently marked Out of Service or in Maintenance.");
      }
    } else {
      setConflictWarning(null);
    }
  }, [assignedVehicle, pickupDate, dropDate, editingBooking, isVehicleAvailable]);

  // Form submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !phone || !pickupLocation || !dropLocation || !pickupDate || !dropDate || !assignedVehicle) {
      addToast("Please fill in all reservation nodes.", "warning");
      return;
    }

    if (conflictWarning && conflictWarning.startsWith("Conflict")) {
      addToast("Cannot finalize booking: Overlapping fleet schedule collision.", "error");
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
        addToast(`Reservation updated: ${customerName}'s trip modified.`, "success");
      } else {
        await addBooking(bookingData);
        addToast(`Reservation confirmed for ${customerName}!`, "success");
      }
      setIsDrawerOpen(false);
    } catch (err: any) {
      addToast(err.message || "Failed to submit booking schedule.", "error");
    } finally {
      setFormLoading(false);
    }
  };

  // Fast Cancel Action
  const handleCancelBooking = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to cancel the reservation for ${name}?`)) {
      try {
        await updateBooking(id, { bookingStatus: "Cancelled" });
        addToast(`Cancelled reservation for ${name}.`, "warning");
      } catch (err) {
        addToast("Failed to cancel reservation.", "error");
      }
    }
  };

  // Complete Trip Action
  const handleCompleteBooking = async (id: string, name: string) => {
    try {
      await updateBooking(id, { bookingStatus: "Completed" });
      addToast(`Marked ${name}'s trip as completed!`, "success");
    } catch (err) {
      addToast("Failed to update status.", "error");
    }
  };

  // Filter Bookings Listing
  const filteredBookings = bookings.filter((b) => {
    const matchesSearch = 
      b.customerName.toLowerCase().includes(search.toLowerCase()) ||
      b.phone.includes(search) ||
      b.pickupLocation.toLowerCase().includes(search.toLowerCase()) ||
      b.dropLocation.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "All" || b.bookingStatus === statusFilter;
    const matchesPayment = paymentFilter === "All" || b.paymentStatus === paymentFilter;

    return matchesSearch && matchesStatus && matchesPayment;
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/40 pb-5">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
              Reservation Console
            </h2>
            <p className="text-sm text-slate-400 font-medium mt-1">
              Add new travel routes, assign vehicles, manage billing, and enforce collision protections.
            </p>
          </div>
          <button
            onClick={handleOpenAdd}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white text-xs font-bold shadow-[0_4px_15px_rgba(99,102,241,0.25)] transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Reservation</span>
          </button>
        </div>

        {/* Filters Toolbar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border border-slate-800/50 bg-slate-900/20 p-4 rounded-2xl backdrop-blur-sm">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search by customer name, route nodes, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-800/80 bg-slate-950/40 text-xs placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-all text-slate-100"
            />
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider whitespace-nowrap">
              Status:
            </span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-800/80 bg-slate-950/40 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 transition-all"
            >
              <option value="All">All Reservations</option>
              {bookingStatuses.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Payment filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider whitespace-nowrap">
              Payment:
            </span>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-800/80 bg-slate-950/40 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 transition-all"
            >
              <option value="All">All Payment States</option>
              {paymentStatuses.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Bookings Feed / List */}
        {filteredBookings.length === 0 ? (
          <div className="rounded-3xl border glass-card p-12 text-center max-w-md mx-auto my-10">
            <Info className="w-10 h-10 text-slate-500 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-slate-200">No Reservations Found</h4>
            <p className="text-xs text-slate-400 mt-1">
              Refine your filters or create a new booking above.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => {
              const vehicle = vehicles.find((v) => v.id === booking.assignedVehicle);

              const statusColors = {
                Confirmed: "status-glow-available border border-emerald-500/20 text-emerald-400",
                Pending: "status-glow-maintenance border border-amber-500/20 text-amber-400",
                Cancelled: "status-glow-out border border-slate-500/20 text-slate-400",
                Completed: "status-glow-booked border border-rose-500/20 text-rose-400",
              };

              const paymentColors = {
                Paid: "text-emerald-400 bg-emerald-950/20 border border-emerald-800/30",
                Partial: "text-amber-400 bg-amber-950/20 border border-amber-800/30",
                Unpaid: "text-rose-400 bg-rose-950/20 border border-rose-800/30",
              };

              const formattedPickup = new Date(booking.pickupDate).toLocaleDateString(undefined, {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              });

              const formattedDrop = new Date(booking.dropDate).toLocaleDateString(undefined, {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              });

              return (
                <motion.div
                  key={booking.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl border glass-card p-5 hover:border-slate-700/60 transition-all flex flex-col xl:flex-row justify-between xl:items-center gap-5 relative group"
                >
                  <div className="flex-grow grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Customer Info */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-extrabold text-slate-100 group-hover:text-indigo-300 transition-colors truncate max-w-[160px]">
                          {booking.customerName}
                        </h4>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-extrabold ${statusColors[booking.bookingStatus]}`}>
                          {booking.bookingStatus}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
                        <Phone className="w-3.5 h-3.5 text-slate-500" />
                        <span>{booking.phone}</span>
                      </div>
                    </div>

                    {/* Route Details */}
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                        Travel Path
                      </span>
                      <div className="flex items-center gap-1 text-xs text-slate-300 font-semibold truncate max-w-[200px]">
                        <MapPin className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                        <span>{booking.pickupLocation}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-slate-400 font-semibold truncate max-w-[200px] pl-4">
                        <span className="text-[10px] text-slate-500 mr-1">to</span>
                        <span>{booking.dropLocation}</span>
                      </div>
                    </div>

                    {/* Schedule Dates */}
                    <div className="space-y-1 text-xs">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                        Date Range
                      </span>
                      <div className="flex items-center gap-1.5 font-semibold text-slate-300">
                        <Calendar className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                        <span>{formattedPickup}</span>
                      </div>
                      <div className="flex items-center gap-1.5 font-semibold text-slate-400 pl-5">
                        <span className="text-[10px] text-slate-500">until</span>
                        <span>{formattedDrop}</span>
                      </div>
                    </div>

                    {/* Assigned Vehicle */}
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                        Assigned Inventory
                      </span>
                      {vehicle ? (
                        <div className="flex items-center gap-2">
                          <Car className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                          <div>
                            <p className="text-xs font-bold text-slate-200">
                              {vehicle.vehicleName}
                            </p>
                            <span className="text-[9px] text-slate-500 font-extrabold uppercase">
                              {vehicle.vehicleNumber}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs font-semibold text-rose-400 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Unassigned / Deleted</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Pricing and Operations Drawer Actions */}
                  <div className="flex flex-row xl:flex-col items-center xl:items-end justify-between xl:justify-center gap-3 border-t xl:border-t-0 xl:border-l border-slate-800/40 pt-4 xl:pt-0 xl:pl-5 flex-shrink-0">
                    <div className="text-left xl:text-right">
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                        Total billing
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-base font-extrabold text-slate-100">
                          ₹ {(booking.totalAmount || 0).toLocaleString("en-IN")}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold ${paymentColors[booking.paymentStatus]}`}>
                          {booking.paymentStatus}
                        </span>
                      </div>
                    </div>

                    {/* Operational controls */}
                    <div className="flex items-center gap-1.5 text-xs font-semibold">
                      {booking.bookingStatus === "Confirmed" && (
                        <>
                          <button
                            onClick={() => handleCompleteBooking(booking.id, booking.customerName)}
                            className="p-2 rounded-xl bg-emerald-950/30 hover:bg-emerald-950/60 border border-emerald-500/20 text-emerald-400 hover:text-emerald-300 transition-all cursor-pointer shadow-md"
                            title="Complete Trip"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleCancelBooking(booking.id, booking.customerName)}
                            className="p-2 rounded-xl bg-rose-950/20 hover:bg-rose-950/40 border border-rose-500/10 text-rose-400 hover:text-rose-300 transition-all cursor-pointer"
                            title="Cancel Reservation"
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      
                      <button
                        onClick={() => handleOpenEdit(booking)}
                        className="px-3 py-2 rounded-xl bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/40 text-slate-300 hover:text-white transition-all cursor-pointer"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Form Drawer (Adding/Editing) */}
        <AnimatePresence>
          {isDrawerOpen && (
            <>
              {/* Overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsDrawerOpen(false)}
                className="fixed inset-0 bg-slate-950 z-45 backdrop-blur-sm"
              />

              {/* Slider panel */}
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
                        <ClipboardList className="w-5 h-5 animate-pulse" />
                      </div>
                      <div>
                        <h3 className="text-base font-extrabold text-slate-100">
                          {editingBooking ? "Edit Reservation details" : "Schedule New Route"}
                        </h3>
                        <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                          Manivtha Booking Dispatch
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsDrawerOpen(false)}
                      className="p-1.5 rounded-xl border border-slate-800 hover:bg-slate-900 text-slate-400 hover:text-slate-200 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Form fields */}
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
                          placeholder="e.g. Ramesh Kumar"
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
                          placeholder="e.g. +91 98450 12345"
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
                          placeholder="e.g. Kempegowda Airport"
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
                          placeholder="e.g. Coorg Resorst"
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
                          {bookingStatuses.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
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
                          {paymentStatuses.map((p) => (
                            <option key={p} value={p}>{p}</option>
                          ))}
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
                        placeholder="e.g. 5000"
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-800/80 bg-slate-950/40 text-xs placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-all text-slate-100"
                      />
                    </div>
                  </form>
                </div>

                {/* Form Footer */}
                <div className="flex gap-3 border-t border-slate-800/40 pt-4 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsDrawerOpen(false)}
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
