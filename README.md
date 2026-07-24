# EchoScan — Acoustic Wall Inspection & Structural Diagnostics Platform

EchoScan is a full-stack non-destructive acoustic wall inspection application. It uses real-time Web Audio API signal processing (FFT spectrum, RMS volume, peak frequency) to classify wall structural composition (Solid, Hollow, or Cracked) and syncs data to an Express + MongoDB backend for scan history tracking, analytics dashboards, user authentication, and PDF inspection report generation.

---

## System Architecture

```
sonic-walls-1/
├── backend/                  # Node.js + Express + MongoDB TypeScript REST API
│   ├── src/
│   │   ├── config/           # Database connection setup (Mongoose)
│   │   ├── controllers/      # Route controllers (Auth, Scans, Reports, Uploads, Dashboard)
│   │   ├── middleware/       # JWT Auth, Multer upload, Error handling
│   │   ├── models/           # Mongoose User and Scan schemas
│   │   ├── routes/           # REST API endpoints
│   │   ├── services/         # Business logic services
│   │   ├── utils/            # PDFKit PDF inspection report generator
│   │   ├── uploads/          # Uploaded audio recordings storage
│   │   ├── app.ts            # Express app configuration & middleware
│   │   └── server.ts         # Server entry point
│   ├── .env                  # Backend environment variables
│   ├── package.json
│   └── tsconfig.json
│
├── src/                      # React + TypeScript Frontend (TanStack Start / Vite)
│   ├── components/echo/      # EchoScan, SpectrumVisualizer, DashboardView, HistoryView, AuthView
│   ├── context/              # AuthContext for JWT authentication & persistence
│   ├── lib/                  # Web Audio API analyzer & API client (`api.ts`)
│   ├── routes/               # TanStack Router pages (/, /scan, /dashboard, /history, /auth)
│   └── styles.css            # Tailored Tailwind CSS & glassmorphism theme
│
├── README.md
└── package.json
```

---

## Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm** or **bun**
- **MongoDB**: Local MongoDB instance running at `mongodb://127.0.0.1:27017/echoscan` or a MongoDB Atlas URI.

---

## Getting Started

### 1. Backend Setup & Startup

1. Open a terminal and navigate to the `backend/` folder:
   ```bash
   cd backend
   ```
2. Install dependencies (if not already installed):
   ```bash
   npm install
   ```
3. Configure environment variables in `backend/.env`:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://127.0.0.1:27017/echoscan
   JWT_SECRET=super_secret_echoscan_jwt_key_2026
   JWT_EXPIRES_IN=7d
   CLIENT_URL=http://localhost:8080
   ```
4. Start the backend development server:
   ```bash
   npm run dev
   ```
   The backend API will be running on `http://localhost:5000`.

### 2. Frontend Setup & Startup

1. From the project root directory (`sonic-walls-1/`):
   ```bash
   npm run dev
   ```
2. Open your browser and navigate to:
   ```
   http://localhost:8080
   ```

---

## REST API Documentation

Base URL: `http://localhost:5000/api`

### 1. Authentication

| Method | Endpoint | Description | Auth Required | Request Body |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | Register a new user | No | `{ "name": "Name", "email": "user@email.com", "password": "password" }` |
| `POST` | `/auth/login` | Log in user & retrieve JWT | No | `{ "email": "user@email.com", "password": "password" }` |
| `GET` | `/auth/profile` | Get current user details | Yes (Bearer Token) | None |

### 2. Scan Diagnostics & History

| Method | Endpoint | Description | Auth Required | Request Body / Query Params |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/scans` | Save a completed scan | Yes | `{ "wallType": "solid", "confidenceScore": 85, "peakFrequency": 240, "rms": 0.12, "duration": 1.5, "fftSummary": [...], "recommendation": "..." }` |
| `GET` | `/scans` | Get scan history | Yes | Query params: `?wallType=solid&search=keyword` |
| `GET` | `/scans/:id` | Get single scan details | Yes | None |
| `DELETE` | `/scans/:id` | Delete scan entry | Yes | None |

### 3. Audio File Upload

| Method | Endpoint | Description | Auth Required | Request Payload |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/upload` | Upload recorded audio file | Yes | `multipart/form-data` with field `audio` |

### 4. PDF Inspection Report Generation

| Method | Endpoint | Description | Auth Required | Output |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/report/:id` | Generate and download PDF report | Yes | Downloadable PDF Stream (`application/pdf`) |

### 5. Analytics & Dashboard

| Method | Endpoint | Description | Auth Required | Response |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/dashboard` | Fetch dashboard metrics & recent scans | Yes | Stats breakdown (total, today's, solid, hollow, cracked) + recent scans array |

---

## Key Features

1. **Local Web Audio Processing**: Computes FFT, peak frequency, RMS volume, and Hann windowing entirely in the browser for ultra-responsive feedback.
2. **Seamless Backend Auto-Sync**: Automatically saves completed scans to MongoDB when logged in.
3. **Professional PDF Reports**: Dynamically generates downloadable structural inspection reports with company logo placeholder, metric tables, and safety recommendations via PDFKit.
4. **Analytics Dashboard**: Real-time metrics breakdown and wall classification distribution charts.
5. **Scan History & Search**: Instant searching, filtering by wall type, report downloading, and record management.
