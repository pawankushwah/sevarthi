# Sevarthi — Local Services & Ride Booking Platform

> Rapido-inspired multi-service platform connecting customers with local service providers. Built with MERN stack, Socket.io real-time updates, Leaflet maps, and mobile-first design.

## For Instructor who is checking this project
I have included a demo mode in this project. You can test the full "Customer to Provider" workflow without needing two devices. To use it, navigate to the `/demo` page (accessible from the login screen) and enable "Demo Mode". A background bot will automatically "detect" your booking and accept it within 5-10 seconds, simulating the entire booking lifecycle.

## 🌐 Live Demo
**[→ click here](https://sevarthi.vercel.app/)**

## ✨ Features

### Customer
- Browse services in 3 groups: **Rides** 🏍️ | **Quick Services** ⚡ | **Extended Projects** 🔨
- Live map (OpenStreetMap) to pin pickup & drop locations
- Real-time fare estimation
- Track booking status through full lifecycle (Requested → Confirmed → In Progress → Completed)
- Pay via **UPI (QR Code)** or **Cash**
- Wallet: recharge, view balance, transaction history
- Rate & review service providers

### Service Provider
- Register for exactly one service (rides, quick, or extended)
- Toggle online/offline availability
- See & accept incoming booking requests in real-time (Socket.io)
- Broadcast live location during active jobs
- Update job status and add work notes
- Wallet with earnings history

### Admin
- Dashboard with stats (bookings, revenue, providers, customers)
- Approve/reject service provider accounts
- View all bookings

## 🛠 Tech Stack
| | Tech |
|---|---|
| Frontend | React + Vite, TailwindCSS v4, Leaflet.js, Socket.io-client |
| Backend | Node.js + Express, Socket.io |
| Database | MongoDB Atlas + Mongoose |
| Auth | JWT + bcrypt |
| Maps | Leaflet.js + OpenStreetMap (free) |
| Payments | UPI deep-link QR, Cash |

## 📋 Service Groups
| Group | Services | Pricing |
|---|---|---|
| 🏍️ **Rides** | Bike, Auto, Cab | per km |
| ⚡ **Quick** | Electrician, Plumber, AC Repair, Cleaning, Pest Control | per hour / fixed |
| 🔨 **Extended** | Carpenter, Mason, Painter, Civil Work, Interior Designer | per day |

## 🚀 Setup Instructions

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free tier works)

### 1. Clone & Configure
```bash
git clone https://github.com/pawankushwah/sevarthi.git
cd sevarthi
```

### 2. Backend
```bash
cd server
cp .env.example .env   # fill in MONGO_URI and JWT_SECRET
npm install
npm run seed           # seeds services + creates admin account
npm run dev            # starts on http://localhost:5000
```

### 3. Frontend
```bash
cd client
npm install
npm run dev            # starts on http://localhost:5173
```

### 4. Default Credentials
```
# admin
Phone: 0000000000
Password: admin123
```
```
# customer
Phone: 9999999999
Password: password
```
```
# provider
Phone: 8888888888
Password: password
```

## 🤖 Demo Mode & Bot Simulation
To ensure a smooth evaluation experience for instructors, Sevarthi includes a dedicated **Demo Mode**. This allows you to test the full "Customer to Provider" workflow without needing two devices.

### How to use:
1.  Navigate to the `/demo` page (accessible from the login screen).
2.  Enable **"Demo Mode"**.
3.  Login as a **Customer** and place a booking.

### What happens in Demo Mode?
-   **Automated Acceptance**: A background bot will automatically "detect" your booking and accept it within 5-10 seconds.
-   **Live Simulation**: The bot will simulate provider movement on your map, moving towards the pickup point.
-   **Status Progression**: The bot will automatically update the job status (Confirmed → In Progress → Completed) after realistic pauses.
-   **Dead-App Protection**: This ensures the instructor is never stuck waiting for a real person to accept a request during a demo.

## 💰 Payment & Wallet Logic
- **UPI**: Customer scans provider's UPI QR → pays via any UPI app → taps "I've Paid" → provider wallet credited
- **Cash**: Customer taps "Confirm Cash" → booking marked paid → provider wallet credited
- **Unpaid protection**: If customer doesn't pay → debt tracked on customer profile → 10% platform cut deducted from provider wallet as protection

## 📁 Project Structure
```
sevarthi/
├── server/          # Node.js + Express backend
│   ├── models/      # MongoDB schemas
│   ├── routes/      # REST API routes
│   ├── middleware/  # JWT auth
│   ├── socket/      # Socket.io handlers
│   ├── seed.js      # DB seeder
│   └── index.js     # Entry point
└── client/          # React + Vite frontend
    └── src/
        ├── pages/   # All page components
        └── components/ # Shared UI components
```
