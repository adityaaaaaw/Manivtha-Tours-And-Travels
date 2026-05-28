import { create } from "zustand";
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  doc, 
  deleteDoc, 
  onSnapshot, 
  query,
  setDoc
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase";

export interface Vehicle {
  id: string;
  vehicleName: string;
  vehicleNumber: string;
  type: "Sedan" | "SUV" | "Tempo Traveller" | "Luxury Coach";
  seatingCapacity: number;
  status: "Available" | "Booked" | "On Trip" | "Maintenance" | "Out of Service";
  image: string;
  availability: boolean;
  maintenanceStatus: "Good" | "Under Maintenance" | "Scheduled";
}

export interface Booking {
  id: string;
  customerName: string;
  phone: string;
  pickupLocation: string;
  dropLocation: string;
  pickupDate: string; // ISO format e.g., YYYY-MM-DDTHH:mm
  dropDate: string; // ISO format e.g., YYYY-MM-DDTHH:mm
  assignedVehicle: string; // Vehicle ID
  bookingStatus: "Confirmed" | "Pending" | "Cancelled" | "Completed";
  paymentStatus: "Paid" | "Partial" | "Unpaid";
  totalAmount?: number;
}

interface FleetState {
  vehicles: Vehicle[];
  bookings: Booking[];
  loading: boolean;
  error: string | null;
  
  // Real-time listener unsubscribes
  unsubVehicles: (() => void) | null;
  unsubBookings: (() => void) | null;
  
  // Fetch Actions
  fetchVehicles: () => Promise<void>;
  fetchBookings: () => Promise<void>;
  startRealTimeListeners: () => void;
  stopRealTimeListeners: () => void;

  // Vehicle Actions
  addVehicle: (vehicle: Omit<Vehicle, "id">) => Promise<void>;
  updateVehicle: (id: string, data: Partial<Vehicle>) => Promise<void>;
  deleteVehicle: (id: string) => Promise<void>;

  // Booking Actions
  addBooking: (booking: Omit<Booking, "id">) => Promise<void>;
  updateBooking: (id: string, data: Partial<Booking>) => Promise<void>;
  cancelBooking: (id: string) => Promise<void>;
  
  // Double-Booking Engine & Utility Actions
  isVehicleAvailable: (vehicleId: string, pickupDate: string, dropDate: string, excludeBookingId?: string) => { available: boolean; conflict?: Booking };
  generateDemoData: () => Promise<void>;
  clearAllData: () => Promise<void>;
}

// Utility to verify date overlap: (StartA <= EndB) and (EndA >= StartB)
export const checkOverlap = (startA: string, endA: string, startB: string, endB: string): boolean => {
  const sA = new Date(startA).getTime();
  const eA = new Date(endA).getTime();
  const sB = new Date(startB).getTime();
  const eB = new Date(endB).getTime();
  
  return sA < eB && eA > sB;
};

export const useFleetStore = create<FleetState>((set, get) => ({
  vehicles: [],
  bookings: [],
  loading: false,
  error: null,
  unsubVehicles: null,
  unsubBookings: null,

  fetchVehicles: async () => {
    set({ loading: true, error: null });
    if (isFirebaseConfigured && db) {
      try {
        const querySnapshot = await getDocs(collection(db, "vehicles"));
        const vehiclesList: Vehicle[] = [];
        querySnapshot.forEach((doc) => {
          vehiclesList.push({ id: doc.id, ...doc.data() } as Vehicle);
        });
        set({ vehicles: vehiclesList, loading: false });
      } catch (err: any) {
        set({ error: err.message, loading: false });
      }
    } else {
      // Mock local storage fallback
      const stored = localStorage.getItem("manivtha_vehicles");
      set({ 
        vehicles: stored ? JSON.parse(stored) : [], 
        loading: false 
      });
    }
  },

  fetchBookings: async () => {
    set({ loading: true, error: null });
    if (isFirebaseConfigured && db) {
      try {
        const querySnapshot = await getDocs(collection(db, "bookings"));
        const bookingsList: Booking[] = [];
        querySnapshot.forEach((doc) => {
          bookingsList.push({ id: doc.id, ...doc.data() } as Booking);
        });
        set({ bookings: bookingsList, loading: false });
      } catch (err: any) {
        set({ error: err.message, loading: false });
      }
    } else {
      // Mock local storage fallback
      const stored = localStorage.getItem("manivtha_bookings");
      set({ 
        bookings: stored ? JSON.parse(stored) : [], 
        loading: false 
      });
    }
  },

  startRealTimeListeners: () => {
    // If listeners are already active, do nothing
    if (get().unsubVehicles || get().unsubBookings) return;

    if (isFirebaseConfigured && db) {
      const unsubVehicles = onSnapshot(collection(db, "vehicles"), (snapshot) => {
        const vehiclesList: Vehicle[] = [];
        snapshot.forEach((doc) => {
          vehiclesList.push({ id: doc.id, ...doc.data() } as Vehicle);
        });
        set({ vehicles: vehiclesList });
      }, (err) => set({ error: err.message }));

      const unsubBookings = onSnapshot(collection(db, "bookings"), (snapshot) => {
        const bookingsList: Booking[] = [];
        snapshot.forEach((doc) => {
          bookingsList.push({ id: doc.id, ...doc.data() } as Booking);
        });
        set({ bookings: bookingsList });
      }, (err) => set({ error: err.message }));

      set({ unsubVehicles, unsubBookings });
    } else {
      // Mock mode: polling or manual refresh only
      get().fetchVehicles();
      get().fetchBookings();
    }
  },

  stopRealTimeListeners: () => {
    const { unsubVehicles, unsubBookings } = get();
    if (unsubVehicles) unsubVehicles();
    if (unsubBookings) unsubBookings();
    set({ unsubVehicles: null, unsubBookings: null });
  },

  addVehicle: async (vehicleData) => {
    set({ loading: true, error: null });
    if (isFirebaseConfigured && db) {
      try {
        await addDoc(collection(db, "vehicles"), vehicleData);
      } catch (err: any) {
        set({ error: err.message, loading: false });
        throw err;
      }
    } else {
      const { vehicles } = get();
      const newVehicle: Vehicle = {
        id: `mock-vehicle-${Date.now()}`,
        ...vehicleData
      };
      const updated = [...vehicles, newVehicle];
      localStorage.setItem("manivtha_vehicles", JSON.stringify(updated));
      set({ vehicles: updated, loading: false });
    }
  },

  updateVehicle: async (id, data) => {
    set({ loading: true, error: null });
    if (isFirebaseConfigured && db) {
      try {
        const vehicleRef = doc(db, "vehicles", id);
        await updateDoc(vehicleRef, data);
      } catch (err: any) {
        set({ error: err.message, loading: false });
        throw err;
      }
    } else {
      const { vehicles } = get();
      const updated = vehicles.map((v) => (v.id === id ? { ...v, ...data } : v));
      localStorage.setItem("manivtha_vehicles", JSON.stringify(updated));
      set({ vehicles: updated, loading: false });
    }
  },

  deleteVehicle: async (id) => {
    set({ loading: true, error: null });
    if (isFirebaseConfigured && db) {
      try {
        await deleteDoc(doc(db, "vehicles", id));
      } catch (err: any) {
        set({ error: err.message, loading: false });
        throw err;
      }
    } else {
      const { vehicles, bookings } = get();
      const updatedVehicles = vehicles.filter((v) => v.id !== id);
      // Clean up bookings assigned to deleted vehicle
      const updatedBookings = bookings.map((b) => 
        b.assignedVehicle === id ? { ...b, bookingStatus: "Cancelled" as const } : b
      );
      localStorage.setItem("manivtha_vehicles", JSON.stringify(updatedVehicles));
      localStorage.setItem("manivtha_bookings", JSON.stringify(updatedBookings));
      set({ vehicles: updatedVehicles, bookings: updatedBookings, loading: false });
    }
  },

  isVehicleAvailable: (vehicleId, pickupDate, dropDate, excludeBookingId) => {
    const { vehicles, bookings } = get();
    const vehicle = vehicles.find((v) => v.id === vehicleId);
    
    // 1. Check if vehicle is Out of Service or Under Maintenance in general
    if (!vehicle || vehicle.status === "Out of Service" || vehicle.maintenanceStatus === "Under Maintenance") {
      return { available: false };
    }

    // 2. Scan all bookings for overlapping confirmed/pending assignments
    const activeBookings = bookings.filter((b) => 
      b.assignedVehicle === vehicleId &&
      b.id !== excludeBookingId && 
      (b.bookingStatus === "Confirmed" || b.bookingStatus === "Pending")
    );

    for (const b of activeBookings) {
      if (checkOverlap(pickupDate, dropDate, b.pickupDate, b.dropDate)) {
        return { available: false, conflict: b };
      }
    }

    return { available: true };
  },

  addBooking: async (bookingData) => {
    set({ loading: true, error: null });
    
    // Validate double-booking before inserting
    const avail = get().isVehicleAvailable(bookingData.assignedVehicle, bookingData.pickupDate, bookingData.dropDate);
    if (!avail.available) {
      const conflictMsg = avail.conflict 
        ? `Conflict: Vehicle is already booked by ${avail.conflict.customerName} during this period.`
        : "Vehicle is currently Out of Service or in Maintenance.";
      set({ error: conflictMsg, loading: false });
      throw new Error(conflictMsg);
    }

    if (isFirebaseConfigured && db) {
      try {
        await addDoc(collection(db, "bookings"), bookingData);
        
        // Update vehicle status in Firestore if necessary
        const vehicleRef = doc(db, "vehicles", bookingData.assignedVehicle);
        await updateDoc(vehicleRef, { status: "Booked" });
      } catch (err: any) {
        set({ error: err.message, loading: false });
        throw err;
      }
    } else {
      const { bookings, vehicles } = get();
      const newBooking: Booking = {
        id: `mock-booking-${Date.now()}`,
        ...bookingData
      };
      
      const updatedBookings = [...bookings, newBooking];
      const updatedVehicles = vehicles.map((v) => 
        v.id === bookingData.assignedVehicle ? { ...v, status: "Booked" as const } : v
      );
      
      localStorage.setItem("manivtha_bookings", JSON.stringify(updatedBookings));
      localStorage.setItem("manivtha_vehicles", JSON.stringify(updatedVehicles));
      set({ bookings: updatedBookings, vehicles: updatedVehicles, loading: false });
    }
  },

  updateBooking: async (id, data) => {
    set({ loading: true, error: null });
    
    const { bookings, vehicles } = get();
    const existingBooking = bookings.find((b) => b.id === id);
    if (!existingBooking) {
      set({ error: "Booking not found", loading: false });
      throw new Error("Booking not found");
    }

    // Verify double-booking with new info if either vehicle or dates are changing
    const vehicleId = data.assignedVehicle || existingBooking.assignedVehicle;
    const pDate = data.pickupDate || existingBooking.pickupDate;
    const dDate = data.dropDate || existingBooking.dropDate;
    const status = data.bookingStatus || existingBooking.bookingStatus;

    if (status !== "Cancelled" && status !== "Completed") {
      const avail = get().isVehicleAvailable(vehicleId, pDate, dDate, id);
      if (!avail.available) {
        const conflictMsg = avail.conflict 
          ? `Conflict: Vehicle is already booked by ${avail.conflict.customerName} during this period.`
          : "Vehicle is currently Out of Service or in Maintenance.";
        set({ error: conflictMsg, loading: false });
        throw new Error(conflictMsg);
      }
    }

    if (isFirebaseConfigured && db) {
      try {
        const bookingRef = doc(db, "bookings", id);
        await updateDoc(bookingRef, data);
        
        // Sync vehicle statuses if status is completed/cancelled
        if (data.bookingStatus === "Cancelled" || data.bookingStatus === "Completed") {
          const vehicleRef = doc(db, "vehicles", vehicleId);
          await updateDoc(vehicleRef, { status: "Available" });
        }
      } catch (err: any) {
        set({ error: err.message, loading: false });
        throw err;
      }
    } else {
      const updatedBookings = bookings.map((b) => (b.id === id ? { ...b, ...data } : b));
      
      let updatedVehicles = [...vehicles];
      if (data.bookingStatus === "Cancelled" || data.bookingStatus === "Completed") {
        updatedVehicles = vehicles.map((v) => 
          v.id === vehicleId ? { ...v, status: "Available" as const } : v
        );
      } else if (data.bookingStatus === "Confirmed" && existingBooking.bookingStatus !== "Confirmed") {
        updatedVehicles = vehicles.map((v) => 
          v.id === vehicleId ? { ...v, status: "Booked" as const } : v
        );
      }

      localStorage.setItem("manivtha_bookings", JSON.stringify(updatedBookings));
      localStorage.setItem("manivtha_vehicles", JSON.stringify(updatedVehicles));
      set({ bookings: updatedBookings, vehicles: updatedVehicles, loading: false });
    }
  },

  cancelBooking: async (id) => {
    await get().updateBooking(id, { bookingStatus: "Cancelled" });
  },

  clearAllData: async () => {
    set({ loading: true });
    if (isFirebaseConfigured && db) {
      try {
        const { vehicles, bookings } = get();
        for (const v of vehicles) {
          await deleteDoc(doc(db, "vehicles", v.id));
        }
        for (const b of bookings) {
          await deleteDoc(doc(db, "bookings", b.id));
        }
      } catch (err: any) {
        set({ error: err.message, loading: false });
      }
    } else {
      localStorage.removeItem("manivtha_vehicles");
      localStorage.removeItem("manivtha_bookings");
      set({ vehicles: [], bookings: [], loading: false });
    }
  },

  generateDemoData: async () => {
    set({ loading: true, error: null });

    // 10 premium sample vehicles
    const demoVehicles: Omit<Vehicle, "id">[] = [
      {
        vehicleName: "Toyota Innova Crysta",
        vehicleNumber: "KA-01-MJ-9999",
        type: "SUV",
        seatingCapacity: 7,
        status: "Available",
        image: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=600",
        availability: true,
        maintenanceStatus: "Good"
      },
      {
        vehicleName: "Force Traveller Premium",
        vehicleNumber: "KA-51-AB-1234",
        type: "Tempo Traveller",
        seatingCapacity: 14,
        status: "Booked",
        image: "https://images.unsplash.com/photo-1532581291347-9c39cf10a73c?auto=format&fit=crop&q=80&w=600",
        availability: false,
        maintenanceStatus: "Good"
      },
      {
        vehicleName: "Maruti Suzuki Ertiga",
        vehicleNumber: "KA-03-MK-7788",
        type: "SUV",
        seatingCapacity: 7,
        status: "On Trip",
        image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=600",
        availability: false,
        maintenanceStatus: "Good"
      },
      {
        vehicleName: "Mercedes-Benz V-Class Luxe",
        vehicleNumber: "KA-05-MM-0007",
        type: "Luxury Coach",
        seatingCapacity: 7,
        status: "Available",
        image: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=600",
        availability: true,
        maintenanceStatus: "Good"
      },
      {
        vehicleName: "Force Urbania Executive",
        vehicleNumber: "KA-04-UT-8800",
        type: "Tempo Traveller",
        seatingCapacity: 12,
        status: "Maintenance",
        image: "https://images.unsplash.com/photo-1542282088-fe8426682b8f?auto=format&fit=crop&q=80&w=600",
        availability: false,
        maintenanceStatus: "Under Maintenance"
      },
      {
        vehicleName: "Mahindra XUV700 AX7",
        vehicleNumber: "KA-53-XY-5555",
        type: "SUV",
        seatingCapacity: 7,
        status: "Available",
        image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=600",
        availability: true,
        maintenanceStatus: "Good"
      },
      {
        vehicleName: "Honda City Elegant",
        vehicleNumber: "KA-01-HC-1111",
        type: "Sedan",
        seatingCapacity: 5,
        status: "Available",
        image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=600",
        availability: true,
        maintenanceStatus: "Scheduled"
      },
      {
        vehicleName: "Eicher Luxury Coach 32S",
        vehicleNumber: "KA-09-EB-6600",
        type: "Luxury Coach",
        seatingCapacity: 32,
        status: "Available",
        image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=600",
        availability: true,
        maintenanceStatus: "Good"
      },
      {
        vehicleName: "Ashok Leyland Air Bus",
        vehicleNumber: "KA-08-AL-8899",
        type: "Luxury Coach",
        seatingCapacity: 45,
        status: "Booked",
        image: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&q=80&w=600",
        availability: false,
        maintenanceStatus: "Good"
      },
      {
        vehicleName: "Hyundai Verna SX",
        vehicleNumber: "KA-02-HV-2222",
        type: "Sedan",
        seatingCapacity: 5,
        status: "Out of Service",
        image: "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&q=80&w=600",
        availability: false,
        maintenanceStatus: "Under Maintenance"
      }
    ];

    let insertedVehicles: Vehicle[] = [];

    if (isFirebaseConfigured && db) {
      try {
        // Clear first
        await get().clearAllData();

        for (const v of demoVehicles) {
          const docRef = await addDoc(collection(db, "vehicles"), v);
          insertedVehicles.push({ id: docRef.id, ...v } as Vehicle);
        }
      } catch (err: any) {
        set({ error: err.message, loading: false });
        throw err;
      }
    } else {
      insertedVehicles = demoVehicles.map((v, index) => ({
        id: `mock-vehicle-id-${index + 1}`,
        ...v
      }));
      localStorage.setItem("manivtha_vehicles", JSON.stringify(insertedVehicles));
    }

    // Reference dates based on current time (2026-05-29)
    const base = new Date("2026-05-29T10:00:00");
    
    // Function to calculate a relative ISO date string
    const relDate = (daysOffset: number, hour: number = 10, min: number = 0): string => {
      const d = new Date(base);
      d.setDate(d.getDate() + daysOffset);
      d.setHours(hour);
      d.setMinutes(min);
      // Format as Local ISO string YYYY-MM-DDTHH:mm
      const pad = (n: number) => n.toString().padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

    // 20 realistic bookings
    const demoBookings: Omit<Booking, "id">[] = [
      // Force Traveller Premium conflicts / booking
      {
        customerName: "Ramesh Kumar",
        phone: "+91 98450 12345",
        pickupLocation: "Bangalore Airport (BLR)",
        dropLocation: "Coorg (Madikeri)",
        pickupDate: relDate(-2), // 2 days ago
        dropDate: relDate(2, 18), // 2 days from now
        assignedVehicle: insertedVehicles[1].id,
        bookingStatus: "Confirmed",
        paymentStatus: "Partial",
        totalAmount: 18500
      },
      // Maruti Suzuki Ertiga on trip
      {
        customerName: "Suresh Raina",
        phone: "+91 99000 88888",
        pickupLocation: "Majestic Metro Station",
        dropLocation: "Nandi Hills",
        pickupDate: relDate(-1, 6), // yesterday
        dropDate: relDate(0, 18), // today 6pm
        assignedVehicle: insertedVehicles[2].id,
        bookingStatus: "Confirmed",
        paymentStatus: "Paid",
        totalAmount: 4200
      },
      // Ashok Leyland Air Bus booked
      {
        customerName: "TCS Corporate Outing",
        phone: "+91 98888 77777",
        pickupLocation: "TCS Whitefield Office",
        dropLocation: "Mysore Palace Resorts",
        pickupDate: relDate(1, 6), // tomorrow
        dropDate: relDate(4, 20), // next week
        assignedVehicle: insertedVehicles[8].id,
        bookingStatus: "Confirmed",
        paymentStatus: "Paid",
        totalAmount: 75000
      },
      // Toyota Innova Crysta booking (future)
      {
        customerName: "Anita Sharma",
        phone: "+91 97412 34567",
        pickupLocation: "Indiranagar",
        dropLocation: "Ooty Botanical Gardens",
        pickupDate: relDate(3),
        dropDate: relDate(7, 16),
        assignedVehicle: insertedVehicles[0].id,
        bookingStatus: "Confirmed",
        paymentStatus: "Unpaid",
        totalAmount: 22000
      },
      // Mercedes-Benz V-Class booking (future)
      {
        customerName: "Vikram Malhotra",
        phone: "+91 95000 11223",
        pickupLocation: "Taj West End, Race Course Rd",
        dropLocation: "Kabini River Lodge",
        pickupDate: relDate(2, 8),
        dropDate: relDate(5, 17),
        assignedVehicle: insertedVehicles[3].id,
        bookingStatus: "Confirmed",
        paymentStatus: "Paid",
        totalAmount: 38000
      },
      // Eicher Luxury Coach booking (future)
      {
        customerName: "St. Joseph's College Tour",
        phone: "+91 91234 56789",
        pickupLocation: "St. Joseph's Campus",
        dropLocation: "Chikmagalur Coffee Estates",
        pickupDate: relDate(5, 5),
        dropDate: relDate(8, 22),
        assignedVehicle: insertedVehicles[7].id,
        bookingStatus: "Confirmed",
        paymentStatus: "Partial",
        totalAmount: 52000
      },
      // Mahindra XUV700 booking (future)
      {
        customerName: "Karan Johar",
        phone: "+91 96633 44556",
        pickupLocation: "Koramangala 3rd Block",
        dropLocation: "Wayand Wild Resorts",
        pickupDate: relDate(1, 9),
        dropDate: relDate(4, 15),
        assignedVehicle: insertedVehicles[5].id,
        bookingStatus: "Pending",
        paymentStatus: "Unpaid",
        totalAmount: 14000
      },
      // Past bookings (Completed)
      {
        customerName: "Dr. Alok Prasad",
        phone: "+91 94480 99000",
        pickupLocation: "Mallya Hospital",
        dropLocation: "Tirupati Temple",
        pickupDate: relDate(-8),
        dropDate: relDate(-5),
        assignedVehicle: insertedVehicles[0].id,
        bookingStatus: "Completed",
        paymentStatus: "Paid",
        totalAmount: 16800
      },
      {
        customerName: "Preeti Sinha",
        phone: "+91 93412 11002",
        pickupLocation: "Whitefield",
        dropLocation: "Wonderla Amusement Park",
        pickupDate: relDate(-6, 8),
        dropDate: relDate(-6, 20),
        assignedVehicle: insertedVehicles[6].id,
        bookingStatus: "Completed",
        paymentStatus: "Paid",
        totalAmount: 3800
      },
      {
        customerName: "Google India Group",
        phone: "+91 98855 00112",
        pickupLocation: "Google Signature Building",
        dropLocation: "Hampi Ruins",
        pickupDate: relDate(-12),
        dropDate: relDate(-8),
        assignedVehicle: insertedVehicles[7].id,
        bookingStatus: "Completed",
        paymentStatus: "Paid",
        totalAmount: 48000
      },
      {
        customerName: "Rajesh Patil",
        phone: "+91 97788 99001",
        pickupLocation: "Yelahanka",
        dropLocation: "Nandi Hills",
        pickupDate: relDate(-4, 6),
        dropDate: relDate(-4, 14),
        assignedVehicle: insertedVehicles[2].id,
        bookingStatus: "Completed",
        paymentStatus: "Paid",
        totalAmount: 3200
      },
      // Multi-booking for Toyota Innova Crysta (different time frames)
      {
        customerName: "David Miller",
        phone: "+91 99887 76655",
        pickupLocation: "Leela Palace Hotel",
        dropLocation: "Mysore Palace",
        pickupDate: relDate(9, 8),
        dropDate: relDate(11, 20),
        assignedVehicle: insertedVehicles[0].id,
        bookingStatus: "Confirmed",
        paymentStatus: "Partial",
        totalAmount: 11500
      },
      {
        customerName: "Meera Nair",
        phone: "+91 98440 22334",
        pickupLocation: "Malleshwaram",
        dropLocation: "Bannerghatta National Park",
        pickupDate: relDate(-1, 9),
        dropDate: relDate(-1, 17),
        assignedVehicle: insertedVehicles[0].id,
        bookingStatus: "Completed",
        paymentStatus: "Paid",
        totalAmount: 4500
      },
      // Cancelled bookings
      {
        customerName: "Sanjay Dutt",
        phone: "+91 99999 11111",
        pickupLocation: "JW Marriott VIP",
        dropLocation: "Gokarna Beaches",
        pickupDate: relDate(2),
        dropDate: relDate(6),
        assignedVehicle: insertedVehicles[3].id,
        bookingStatus: "Cancelled",
        paymentStatus: "Unpaid",
        totalAmount: 48000
      },
      {
        customerName: "Deepak Chahar",
        phone: "+91 98765 43210",
        pickupLocation: "M Chinnaswamy Stadium",
        dropLocation: "Kempegowda Airport",
        pickupDate: relDate(0, 12),
        dropDate: relDate(0, 14),
        assignedVehicle: insertedVehicles[6].id,
        bookingStatus: "Cancelled",
        paymentStatus: "Unpaid",
        totalAmount: 2500
      },
      // More future bookings to fill up the calendar
      {
        customerName: "Wipro Wedding Event",
        phone: "+91 94444 88888",
        pickupLocation: "Wipro Sarjapur Office",
        dropLocation: "Lalitha Mahal Palace, Mysore",
        pickupDate: relDate(8, 8),
        dropDate: relDate(12, 18),
        assignedVehicle: insertedVehicles[7].id,
        bookingStatus: "Confirmed",
        paymentStatus: "Partial",
        totalAmount: 68000
      },
      {
        customerName: "Nitin Gadkari",
        phone: "+91 98111 22233",
        pickupLocation: "Vidhana Soudha VIP Gate",
        dropLocation: "Hassan Highway Inspection",
        pickupDate: relDate(0, 14), // today afternoon
        dropDate: relDate(1, 18), // tomorrow evening
        assignedVehicle: insertedVehicles[6].id,
        bookingStatus: "Confirmed",
        paymentStatus: "Paid",
        totalAmount: 9800
      },
      {
        customerName: "Ananya Panday",
        phone: "+91 95555 44444",
        pickupLocation: "Sheraton Grand",
        dropLocation: "Nandi Hills Sunset Tour",
        pickupDate: relDate(4, 15),
        dropDate: relDate(4, 21),
        assignedVehicle: insertedVehicles[6].id,
        bookingStatus: "Pending",
        paymentStatus: "Unpaid",
        totalAmount: 4500
      },
      {
        customerName: "Arjun Rampal",
        phone: "+91 93333 22222",
        pickupLocation: "Shangri-La Hotel",
        dropLocation: "Eagleton Golf Resort",
        pickupDate: relDate(10, 7),
        dropDate: relDate(10, 18),
        assignedVehicle: insertedVehicles[5].id,
        bookingStatus: "Confirmed",
        paymentStatus: "Paid",
        totalAmount: 7200
      },
      {
        customerName: "Infosys Training Batch",
        phone: "+91 92222 11111",
        pickupLocation: "Infosys Electronic City",
        dropLocation: "Srirangapatna Heritage",
        pickupDate: relDate(14, 6),
        dropDate: relDate(15, 20),
        assignedVehicle: insertedVehicles[8].id,
        bookingStatus: "Confirmed",
        paymentStatus: "Paid",
        totalAmount: 38000
      }
    ];

    if (isFirebaseConfigured && db) {
      try {
        for (const b of demoBookings) {
          await addDoc(collection(db, "bookings"), b);
        }
      } catch (err: any) {
        set({ error: err.message, loading: false });
        throw err;
      }
    } else {
      const insertedBookings = demoBookings.map((b, index) => ({
        id: `mock-booking-id-${index + 1}`,
        ...b
      }));
      localStorage.setItem("manivtha_bookings", JSON.stringify(insertedBookings));
      set({ 
        vehicles: insertedVehicles, 
        bookings: insertedBookings, 
        loading: false 
      });
    }
  }
}));
