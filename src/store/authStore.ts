import { create } from "zustand";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from "firebase/auth";
import { auth, isFirebaseConfigured } from "@/lib/firebase";

export interface AdminUser {
  uid: string;
  email: string;
  displayName?: string;
  isAdmin: boolean;
}

interface AuthState {
  user: AdminUser | null;
  loading: boolean;
  error: string | null;
  isDemoMode: boolean;
  initializeAuth: () => () => void;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  bypassLogin: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: true,
  error: null,
  isDemoMode: !isFirebaseConfigured,

  initializeAuth: () => {
    if (isFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        if (firebaseUser) {
          set({
            user: {
              uid: firebaseUser.uid,
              email: firebaseUser.email || "",
              displayName: firebaseUser.displayName || "Administrator",
              isAdmin: true,
            },
            loading: false,
            isDemoMode: false,
          });
        } else {
          // If no firebase user, check if we have a local mock user
          const mockUserStr = localStorage.getItem("manivtha_mock_user");
          if (mockUserStr) {
            set({
              user: JSON.parse(mockUserStr),
              loading: false,
              isDemoMode: true,
            });
          } else {
            set({ user: null, loading: false });
          }
        }
      });
      return unsubscribe;
    } else {
      // Mock mode initialization
      if (typeof window !== "undefined") {
        const mockUserStr = localStorage.getItem("manivtha_mock_user");
        if (mockUserStr) {
          set({
            user: JSON.parse(mockUserStr),
            loading: false,
            isDemoMode: true,
          });
        } else {
          set({ user: null, loading: false, isDemoMode: true });
        }
      } else {
        set({ user: null, loading: false, isDemoMode: true });
      }
      // Return a dummy unsubscribe
      return () => {};
    }
  },

  login: async (email, password) => {
    set({ loading: true, error: null });
    if (isFirebaseConfigured && auth) {
      try {
        await signInWithEmailAndPassword(auth, email, password);
      } catch (err: any) {
        let msg = "Invalid email or password.";
        if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password") {
          msg = "Invalid email or password credentials.";
        } else if (err.code === "auth/invalid-email") {
          msg = "Please enter a valid email address.";
        }
        set({ error: msg, loading: false });
        throw new Error(msg);
      }
    } else {
      // Mock login: Accept any login or specific admin credentials for presentation
      await new Promise((resolve) => setTimeout(resolve, 800)); // Simulate delay
      const mockUser: AdminUser = {
        uid: "mock-admin-uid-123",
        email: email,
        displayName: email.split("@")[0].toUpperCase() || "Admin Profile",
        isAdmin: true,
      };
      localStorage.setItem("manivtha_mock_user", JSON.stringify(mockUser));
      set({ user: mockUser, loading: false, isDemoMode: true });
    }
  },

  signup: async (email, password, name) => {
    set({ loading: true, error: null });
    if (isFirebaseConfigured && auth) {
      try {
        await createUserWithEmailAndPassword(auth, email, password);
        // Note: You can update the display name here in a real scenario
        if (auth.currentUser) {
          set({
            user: {
              uid: auth.currentUser.uid,
              email: auth.currentUser.email || "",
              displayName: name || "Administrator",
              isAdmin: true,
            },
            loading: false,
            isDemoMode: false,
          });
        }
      } catch (err: any) {
        let msg = "Failed to sign up admin account.";
        if (err.code === "auth/email-already-in-use") {
          msg = "This email is already in use by another admin.";
        } else if (err.code === "auth/weak-password") {
          msg = "Password should be at least 6 characters.";
        }
        set({ error: msg, loading: false });
        throw new Error(msg);
      }
    } else {
      // Mock signup
      await new Promise((resolve) => setTimeout(resolve, 800));
      const mockUser: AdminUser = {
        uid: `mock-admin-${Date.now()}`,
        email: email,
        displayName: name || "Administrator",
        isAdmin: true,
      };
      localStorage.setItem("manivtha_mock_user", JSON.stringify(mockUser));
      set({ user: mockUser, loading: false, isDemoMode: true });
    }
  },

  logout: async () => {
    set({ loading: true });
    if (isFirebaseConfigured && auth) {
      try {
        await signOut(auth);
        localStorage.removeItem("manivtha_mock_user");
        set({ user: null, loading: false });
      } catch (err: any) {
        set({ error: "Logout failed", loading: false });
      }
    } else {
      await new Promise((resolve) => setTimeout(resolve, 300));
      localStorage.removeItem("manivtha_mock_user");
      set({ user: null, loading: false });
    }
  },

  clearError: () => set({ error: null }),

  bypassLogin: () => {
    const bypassUser: AdminUser = {
      uid: "bypass-admin-999",
      email: "admin@manivthatravels.com",
      displayName: "Manivtha Admin (Demo)",
      isAdmin: true,
    };
    localStorage.setItem("manivtha_mock_user", JSON.stringify(bypassUser));
    set({ user: bypassUser, loading: false, isDemoMode: true });
  },
}));
