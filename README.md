# Manivtha Tours & Travels - Vehicle Availability & Fleet Scheduler

An advanced, production-ready travel-tech fleet management console and availability scheduler built using **Next.js 14 App Router**, **TypeScript**, **Tailwind CSS (v4)**, **Firebase Authentication**, **Firestore Database**, **Zustand**, and **Framer Motion**.

This platform provides an elegant, glassmorphic administrator workspace that streamlines vehicle scheduling, tracking, and reservations while mathematically preventing double-booking scheduling collisions.

---

## 🌟 Core Features

### 🔐 1. Administrative Gatekeeper Portal
* **Secured Workspace**: Professional Firebase Authentication supporting administrator registration and login.
* **Administrative Code Check**: Enforces the security key `MANIVTHA2026` during signup to prevent public registration.
* **Evaluation Center / Guest Bypass**: Instant evaluation bypass mode to immediately test the platform using realistic preloaded data (no Firebase credentials setup required).

### 📊 2. Dynamic Operations Dashboard
* **Operational Stat Indicators**: Real-time counter capsules mapping Total Fleet Size, Active Bookings, Available Vehicles, and Vehicles in Maintenance.
* **Fleet Allocation Dials**: A stunning SVG-driven custom radial donut chart mapping current fleet status percentages.
* **Financial Revenue Insights**: Visual counters evaluating current realized billing (Paid dispatches) versus outstanding dues.
* **Live Activity Feed**: Tracks and ranks the five most recent reservations at a glance.

### 🚗 3. Fleet & Vehicles Dispatch
* **Operational Catalog**: Beautiful grid detailing vehicle models (SUV, Sedan, Tempo Traveller, Luxury Coach), capacity stats, registration plates, and status badges.
* **Drawer-based CRUD Form**: Animated sliding drawer panel (using Framer Motion) to instantly add, edit, or delete vehicles.
* **Smart Filter & Keyword Search**: Multi-select dropdown filtering by vehicle category and active status.

### 📅 4. State-of-the-Art Interactive Calendar
* **Daily, Weekly, and Monthly Grids**: View reservation spans using interactive timelines.
* **Continuous Visual Capsules**: Overlapping bookings or maintenance blocks render as continuous visual capsules:
  * **Red (Booked)**: Hovering displays customer name, route, and phone. Clicking opens the reservation editor.
  * **Yellow (Maintenance)**: Highlights service intervals.
  * **Green Spaces (Available)**: Free slots. Clicking an empty slot opens the reservation form *pre-filled* with the corresponding vehicle and dates.

### 🛡️ 5. Smart Collision prevention Engine
* **Overlapping Check**: Standardizes reservation overlaps. Evaluates scheduling windows:
  $$\text{Overlap} \iff (StartA \le EndB) \land (EndA \ge StartB)$$
* **Real-time Form Validation**: When entering dates or selecting vehicles in the dispatch form, the engine evaluates overlaps. If a collision is found, a glowing Red alert warns the administrator and locks the submission action.
* **Interactive Dropdown Statuses**: Evaluates all 10 fleet vehicles for the selected date range, marking them as `[Available]` (green) or disabling them as `[Double Booking Conflict]` (red) with the conflicting customer's name.

### 📈 6. Interactive Revenue Analytics
* **Category Utilization**: High-end responsive progress gauges showing allocation busy ratios by category.
* **Revenue Breakdown**: Evaluates financial contributions from SUVs, Sedans, Tempo Travellers, and Coaches.
* **Dispatch Indexing**: Tracks completed, active, and cancelled reservation indicators.

---

## 🛠️ Technology Stack
* **Framework**: Next.js 14 (App Router)
* **Language**: TypeScript
* **Style System**: Tailwind CSS (v4)
* **Authentication**: Firebase Authentication
* **Database**: Firebase Firestore
* **State Management**: Zustand
* **Animations**: Framer Motion
* **Visual Icons**: Lucide React

---

## 📂 Project Directory Structure

```text
├── src/
│   ├── app/                    # Next.js App Router folders
│   │   ├── dashboard/          # Fleet overview dashboard
│   │   ├── vehicles/           # Fleet inventory CRUD console
│   │   ├── bookings/           # Reservation list & collision drawers
│   │   ├── calendar/           # Daily/Weekly/Monthly scheduler timeline
│   │   ├── analytics/          # Utilization & Revenue metrics
│   │   ├── globals.css         # Custom CSS & Glassmorphism layers
│   │   ├── layout.tsx          # Root HTML layout with Google Font Outfit
│   │   └── page.tsx            # Login/Signup Auth & Demo Bypass portal
│   ├── components/
│   │   ├── AdminLayout.tsx     # Route protection gate & sidebar layout
│   │   ├── Navbar.tsx          # Glassmorphic side navigations (Mobile drawer)
│   │   └── ToastContainer.tsx  # Framer Motion notifications portal
│   ├── lib/
│   │   └── firebase.ts         # Firebase SDK configuration
│   └── store/
│       ├── authStore.ts        # Zustand Authentication store
│       ├── fleetStore.ts       # Zustand Fleet, Bookings, & Collision stores
│       └── toastStore.ts       # Zustand lightweight Toast notifier store
├── package.json
└── tsconfig.json
```

---

## 🚀 Setup & Installation Instructions

### 1. Clone the Project & Install Dependencies
Navigate to the directory and run:
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env.local` file in the root directory and append your Firebase configuration keys:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

> [!NOTE]
> **Defensive Fallback Mode**
> If these credentials are not found in the environment, the application will automatically enter **Local Offline Fallback Mode** (persisting directly to LocalStorage). This allows full evaluation of all features without setting up Firebase.

### 3. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to experience the console.

### 4. Build for Production
To verify compilations and execute static checks:
```bash
npm run build
```

---

## ☁️ Vercel Deployment

This project is fully Vercel-optimized and complies with Next.js production builds.
1. Install Vercel CLI or link with GitHub.
2. In the Vercel dashboard, add the environment variables specified in `.env.local`.
3. Deploy!

---

## 🛡️ Database Security Rules (Firestore)

To secure the Firestore collections in production, utilize the following rules inside the Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permit read and write permissions to authenticated administrators only
    match /vehicles/{vehicleId} {
      allow read, write: if request.auth != null;
    }
    match /bookings/{bookingId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---
*Developed for **Manivtha Tours & Travels** – Secure Fleet Dispatching & Smart Reservation Scheduling.*
