"use client";

import { useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { useFleetStore, Vehicle } from "@/store/fleetStore";
import { useToastStore } from "@/store/toastStore";
import { motion as mAnimation, AnimatePresence } from "framer-motion";
import { 
  Car, 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  Wrench, 
  Users, 
  X, 
  Sparkles,
  Info,
  Calendar,
  Layers
} from "lucide-react";

export default function VehiclesPage() {
  const { vehicles, loading, addVehicle, updateVehicle, deleteVehicle } = useFleetStore();
  const { addToast } = useToastStore();

  // Search & Filter State
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  // Drawer / Form State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  // Form values
  const [name, setName] = useState("");
  const [number, setNumber] = useState("");
  const [type, setType] = useState<Vehicle["type"]>("SUV");
  const [capacity, setCapacity] = useState(7);
  const [status, setStatus] = useState<Vehicle["status"]>("Available");
  const [maintStatus, setMaintStatus] = useState<Vehicle["maintenanceStatus"]>("Good");
  const [image, setImage] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  const vehicleTypes: Vehicle["type"][] = ["Sedan", "SUV", "Tempo Traveller", "Luxury Coach"];
  const vehicleStatuses: Vehicle["status"][] = ["Available", "Booked", "On Trip", "Maintenance", "Out of Service"];
  const maintenanceStates: Vehicle["maintenanceStatus"][] = ["Good", "Scheduled", "Under Maintenance"];

  // Open drawer for adding
  const handleOpenAdd = () => {
    setEditingVehicle(null);
    setName("");
    setNumber("");
    setType("SUV");
    setCapacity(7);
    setStatus("Available");
    setMaintStatus("Good");
    setImage("");
    setIsDrawerOpen(true);
  };

  // Open drawer for editing
  const handleOpenEdit = (v: Vehicle) => {
    setEditingVehicle(v);
    setName(v.vehicleName);
    setNumber(v.vehicleNumber);
    setType(v.type);
    setCapacity(v.seatingCapacity);
    setStatus(v.status);
    setMaintStatus(v.maintenanceStatus);
    setImage(v.image);
    setIsDrawerOpen(true);
  };

  // Delete vehicle
  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete ${name} from the fleet?`)) {
      try {
        await deleteVehicle(id);
        addToast(`Successfully removed ${name} from the database.`, "success");
      } catch (err) {
        addToast("Failed to delete vehicle.", "error");
      }
    }
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !number || !capacity) {
      addToast("Please fill in all required fields.", "warning");
      return;
    }

    // Capacity check
    if (capacity <= 0) {
      addToast("Seating capacity must be a positive number.", "warning");
      return;
    }

    setFormLoading(true);
    
    // Choose professional default image based on vehicle type if URL not supplied
    const defaultImages = {
      Sedan: "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&q=80&w=600",
      SUV: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=600",
      "Tempo Traveller": "https://images.unsplash.com/photo-1542282088-fe8426682b8f?auto=format&fit=crop&q=80&w=600",
      "Luxury Coach": "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=600",
    };
    
    const finalImage = image.trim() || defaultImages[type];

    const vehicleData = {
      vehicleName: name,
      vehicleNumber: number.toUpperCase().trim(),
      type,
      seatingCapacity: Number(capacity),
      status: editingVehicle ? status : "Available", // When creating, it starts available
      image: finalImage,
      availability: editingVehicle ? (status === "Available") : true,
      maintenanceStatus: maintStatus,
    };

    try {
      if (editingVehicle) {
        await updateVehicle(editingVehicle.id, vehicleData);
        addToast(`Fleet updated: ${name} details modified.`, "success");
      } else {
        await addVehicle(vehicleData);
        addToast(`Successfully added ${name} to Manivtha Travels fleet.`, "success");
      }
      setIsDrawerOpen(false);
    } catch (err: any) {
      addToast(`Error: ${err.message}`, "error");
    } finally {
      setFormLoading(false);
    }
  };

  // Filter listings
  const filteredVehicles = vehicles.filter((v) => {
    const matchesSearch = 
      v.vehicleName.toLowerCase().includes(search.toLowerCase()) || 
      v.vehicleNumber.toLowerCase().includes(search.toLowerCase());
    
    const matchesType = typeFilter === "All" || v.type === typeFilter;
    const matchesStatus = statusFilter === "All" || v.status === statusFilter;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/40 pb-5">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
              Fleet Operations
            </h2>
            <p className="text-sm text-slate-400 font-medium mt-1">
              Add vehicles, manage service intervals, and organize active travel inventory.
            </p>
          </div>
          <button
            onClick={handleOpenAdd}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white text-xs font-bold shadow-[0_4px_15px_rgba(99,102,241,0.25)] transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Vehicle</span>
          </button>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border border-slate-800/50 bg-slate-900/20 p-4 rounded-2xl backdrop-blur-sm">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search by name, plate number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-800/80 bg-slate-950/40 text-xs placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-all text-slate-100"
            />
          </div>

          {/* Type filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider whitespace-nowrap">
              Type:
            </span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-800/80 bg-slate-950/40 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 transition-all"
            >
              <option value="All">All Categories</option>
              {vehicleTypes.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
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
              <option value="All">All Statuses</option>
              {vehicleStatuses.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Fleet Listings Grid */}
        {filteredVehicles.length === 0 ? (
          <div className="rounded-3xl border glass-card p-12 text-center max-w-md mx-auto my-10">
            <Info className="w-10 h-10 text-slate-500 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-slate-200">No Vehicles Match Criteria</h4>
            <p className="text-xs text-slate-400 mt-1">
              Adjust your search keywords or category filters to find matches.
            </p>
          </div>
        ) : (
          <mAnimation.div 
            layout
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
          >
            {filteredVehicles.map((vehicle) => {
              const statusGlows = {
                Available: "status-glow-available",
                Booked: "status-glow-booked",
                "On Trip": "status-glow-ontrip",
                Maintenance: "status-glow-maintenance",
                "Out of Service": "status-glow-out"
              };

              const maintenanceColors = {
                Good: "text-emerald-400 bg-emerald-950/20 border border-emerald-900/30",
                Scheduled: "text-indigo-400 bg-indigo-950/20 border border-indigo-900/30",
                "Under Maintenance": "text-amber-400 bg-amber-950/20 border border-amber-900/30",
              };

              return (
                <mAnimation.div
                  key={vehicle.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="rounded-2xl border glass-card overflow-hidden flex flex-col group relative"
                >
                  {/* Vehicle Thumbnail Image */}
                  <div className="relative h-44 w-full bg-slate-900 overflow-hidden">
                    <img
                      src={vehicle.image}
                      alt={vehicle.vehicleName}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        // Fallback image if unsplash load fails
                        e.currentTarget.src = "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=600";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/20 to-transparent" />
                    
                    {/* Floating Glowy Status Badge */}
                    <span className={`absolute top-4 right-4 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border shadow-lg backdrop-blur-md ${statusGlows[vehicle.status]}`}>
                      {vehicle.status}
                    </span>
                  </div>

                  {/* Vehicle Body Content */}
                  <div className="p-5 flex-grow flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-base font-extrabold text-slate-100 group-hover:text-indigo-300 transition-colors">
                            {vehicle.vehicleName}
                          </h3>
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5 inline-block">
                            {vehicle.vehicleNumber}
                          </span>
                        </div>
                        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-cyan-400 border border-cyan-800/40 bg-cyan-950/20 px-2 py-0.5 rounded">
                          <Layers className="w-3 h-3" />
                          <span>{vehicle.type}</span>
                        </span>
                      </div>

                      {/* Specs stats */}
                      <div className="grid grid-cols-2 gap-2 mt-4 border-t border-slate-800/40 pt-4 text-xs font-semibold">
                        <div className="flex items-center gap-2 text-slate-400">
                          <Users className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                          <span>{vehicle.seatingCapacity} Seater</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-400">
                          <Wrench className="w-4 h-4 text-amber-500 flex-shrink-0" />
                          <span className={`px-2 py-0.5 rounded text-[10px] truncate max-w-[100px] ${maintenanceColors[vehicle.maintenanceStatus]}`}>
                            {vehicle.maintenanceStatus}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Operational Actions */}
                    <div className="flex items-center gap-2 mt-5 border-t border-slate-800/30 pt-4">
                      <button
                        onClick={() => handleOpenEdit(vehicle)}
                        className="flex-1 py-2 rounded-xl bg-slate-800/50 hover:bg-indigo-950/20 border border-slate-700/50 hover:border-indigo-500/30 text-indigo-300 hover:text-indigo-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit Details</span>
                      </button>
                      <button
                        onClick={() => handleDelete(vehicle.id, vehicle.vehicleName)}
                        className="p-2 rounded-xl border border-slate-800 hover:border-rose-800 bg-slate-900/40 hover:bg-rose-950/20 text-slate-500 hover:text-rose-400 transition-all cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </mAnimation.div>
              );
            })}
          </mAnimation.div>
        )}

        {/* Drawer Component for Adding / Editing */}
        <AnimatePresence>
          {isDrawerOpen && (
            <>
              {/* Dark Overlay */}
              <mAnimation.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsDrawerOpen(false)}
                className="fixed inset-0 bg-slate-950 z-45 backdrop-blur-sm"
              />

              {/* Slide-over Form Container */}
              <mAnimation.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 28, stiffness: 220 }}
                className="fixed inset-y-0 right-0 w-full max-w-md bg-[#030712] border-l border-slate-800/60 z-50 p-6 md:p-8 flex flex-col justify-between shadow-2xl overflow-y-auto h-full select-none"
              >
                <div>
                  {/* Drawer Header */}
                  <div className="flex items-center justify-between border-b border-slate-800/40 pb-4 mb-6">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-indigo-950 border border-indigo-800 text-indigo-400">
                        <Car className="w-5 h-5 animate-pulse" />
                      </div>
                      <div>
                        <h3 className="text-base font-extrabold text-slate-100">
                          {editingVehicle ? "Edit Vehicle Details" : "Add Vehicle to Fleet"}
                        </h3>
                        <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                          Manivtha Fleet Inventory
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

                  {/* Form Panel */}
                  <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold">
                    {/* Vehicle Name */}
                    <div className="space-y-1.5">
                      <label className="text-slate-400 uppercase tracking-wider">
                        Vehicle Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Toyota Innova Crysta"
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-800/80 bg-slate-950/40 text-xs placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-all text-slate-100"
                      />
                    </div>

                    {/* Registration Plate */}
                    <div className="space-y-1.5">
                      <label className="text-slate-400 uppercase tracking-wider">
                        License Plate Number *
                      </label>
                      <input
                        type="text"
                        required
                        value={number}
                        onChange={(e) => setNumber(e.target.value)}
                        placeholder="e.g. KA-01-MJ-9999"
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-800/80 bg-slate-950/40 text-xs placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-all text-slate-100"
                      />
                    </div>

                    {/* Type & Seating Capacity grid */}
                    <div className="grid grid-cols-2 gap-4">
                      {/* Vehicle Category */}
                      <div className="space-y-1.5">
                        <label className="text-slate-400 uppercase tracking-wider">
                          Category *
                        </label>
                        <select
                          value={type}
                          onChange={(e) => setType(e.target.value as Vehicle["type"])}
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-800/80 bg-slate-950/40 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 transition-all"
                        >
                          {vehicleTypes.map((t) => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      </div>

                      {/* Seating */}
                      <div className="space-y-1.5">
                        <label className="text-slate-400 uppercase tracking-wider">
                          Capacity (Seats) *
                        </label>
                        <input
                          type="number"
                          required
                          value={capacity}
                          onChange={(e) => setCapacity(Number(e.target.value))}
                          placeholder="e.g. 7"
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-800/80 bg-slate-950/40 text-xs placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-all text-slate-100"
                        />
                      </div>
                    </div>

                    {editingVehicle && (
                      <div className="grid grid-cols-2 gap-4">
                        {/* Status */}
                        <div className="space-y-1.5">
                          <label className="text-slate-400 uppercase tracking-wider">
                            Operational Status *
                          </label>
                          <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value as Vehicle["status"])}
                            className="w-full px-3 py-2.5 rounded-xl border border-slate-800/80 bg-slate-950/40 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 transition-all"
                          >
                            {/* Available, Maintenance, Out of Service can be toggled by hand. Booked/On trip are managed by Bookings */}
                            <option value="Available">Available</option>
                            <option value="Maintenance">Maintenance</option>
                            <option value="Out of Service">Out of Service</option>
                            <option value="Booked" disabled>Booked (System Auto)</option>
                            <option value="On Trip" disabled>On Trip (System Auto)</option>
                          </select>
                        </div>

                        {/* Maintenance */}
                        <div className="space-y-1.5">
                          <label className="text-slate-400 uppercase tracking-wider">
                            Health Status *
                          </label>
                          <select
                            value={maintStatus}
                            onChange={(e) => setMaintStatus(e.target.value as Vehicle["maintenanceStatus"])}
                            className="w-full px-3 py-2.5 rounded-xl border border-slate-800/80 bg-slate-950/40 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 transition-all"
                          >
                            {maintenanceStates.map((ms) => (
                              <option key={ms} value={ms}>{ms}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}

                    {/* Image URL */}
                    <div className="space-y-1.5">
                      <label className="text-slate-400 uppercase tracking-wider">
                        Custom Image URL
                      </label>
                      <input
                        type="url"
                        value={image}
                        onChange={(e) => setImage(e.target.value)}
                        placeholder="Leave blank for generic unsplash asset"
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
                    disabled={formLoading}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    {formLoading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{editingVehicle ? "Save Changes" : "Submit Vehicle"}</span>
                      </>
                    )}
                  </button>
                </div>
              </mAnimation.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  );
}
