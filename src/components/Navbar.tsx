"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useToastStore } from "@/store/toastStore";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, 
  Car, 
  Calendar as CalendarIcon, 
  ClipboardList, 
  BarChart3, 
  LogOut, 
  Menu, 
  X, 
  Compass
} from "lucide-react";
import Link from "next/link";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const { addToast } = useToastStore();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { name: "Dashboard", path: "/dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: "Vehicles", path: "/vehicles", icon: <Car className="w-5 h-5" /> },
    { name: "Calendar", path: "/calendar", icon: <CalendarIcon className="w-5 h-5" /> },
    { name: "Bookings", path: "/bookings", icon: <ClipboardList className="w-5 h-5" /> },
    { name: "Analytics", path: "/analytics", icon: <BarChart3 className="w-5 h-5" /> },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      addToast("Signed out successfully. Have a great day!", "success");
      router.push("/");
    } catch (err) {
      addToast("Error signing out. Please try again.", "error");
    }
  };

  const NavContent = () => (
    <div className="flex flex-col h-full">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-3 py-6 border-b border-slate-800/40">
        <div className="p-2.5 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 shadow-[0_0_15px_rgba(99,102,241,0.35)]">
          <Compass className="w-6 h-6 text-white animate-spin-slow" />
        </div>
        <div>
          <h1 className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-white via-indigo-200 to-cyan-300 bg-clip-text text-transparent">
            Manivtha
          </h1>
          <p className="text-[10px] uppercase tracking-widest text-cyan-400 font-bold">
            Tours & Travels
          </p>
        </div>
      </div>

      {/* Admin Profile Details */}
      <div className="px-3 py-5 mt-4 rounded-2xl bg-slate-900/40 border border-slate-800/50 backdrop-blur-sm mx-2">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 flex items-center justify-center font-bold text-white shadow-[0_0_10px_rgba(99,102,241,0.25)] text-sm">
              {user?.displayName ? user.displayName.substring(0, 2).toUpperCase() : "AD"}
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-slate-950 rounded-full animate-pulse"></span>
          </div>
          <div className="overflow-hidden">
            <h4 className="text-sm font-semibold truncate text-slate-100">
              {user?.displayName || "Operations Admin"}
            </h4>
            <p className="text-[10px] text-slate-400 font-medium truncate">
              {user?.email || "ops@manivtha.com"}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-grow mt-6 px-2 space-y-1.5">
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              onClick={() => setIsOpen(false)}
              className={`relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group ${
                isActive
                  ? "text-indigo-400 bg-indigo-950/20 border-l-2 border-indigo-500"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/30 border-l-2 border-transparent"
              }`}
            >
              {/* Highlight active container back glow */}
              {isActive && (
                <motion.div
                  layoutId="activeNavBackground"
                  className="absolute inset-0 bg-indigo-950/10 rounded-xl -z-10"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              
              <span className={`transition-colors group-hover:scale-105 duration-200 ${isActive ? "text-indigo-400" : "text-slate-400 group-hover:text-indigo-300"}`}>
                {item.icon}
              </span>
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout button */}
      <div className="p-3 border-t border-slate-800/40">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-950/20 border-l-2 border-transparent hover:border-rose-500 rounded-xl transition-all group"
        >
          <LogOut className="w-5 h-5 text-rose-400 transition-transform group-hover:-translate-x-0.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Floating Glass Card) */}
      <aside className="hidden lg:flex flex-col w-64 fixed inset-y-4 left-4 z-40 rounded-3xl border glass-card shadow-2xl p-2 select-none">
        <NavContent />
      </aside>

      {/* Mobile Top Navbar */}
      <header className="lg:hidden fixed top-0 inset-x-0 h-16 border-b glass-card z-40 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-gradient-to-tr from-indigo-600 to-cyan-500 shadow-md">
            <Compass className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-black tracking-tight text-white">
              MANIVTHA
            </h1>
            <p className="text-[8px] uppercase tracking-wider text-cyan-400 font-bold">
              Tours & Travels
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-xl border border-slate-800 bg-slate-900/60 text-slate-300 hover:text-white transition-colors"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Mobile Nav Drawer overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="lg:hidden fixed inset-0 bg-slate-950/80 z-45 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="lg:hidden fixed inset-y-0 left-0 w-64 max-w-[80vw] bg-[#030712] border-r border-slate-800 z-50 p-2 shadow-2xl"
            >
              <NavContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
