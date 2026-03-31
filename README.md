# 🏥 Hospi-Track — Real-Time Hospital Ward Intelligence Platform

> **WardWatch** · Problem Statement 1 · SDG 3: Good Health & Well-Being

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com)
[![FastAPI](https://img.shields.io/badge/FastAPI-Python-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)

---

## 🧠 The Problem

A doctor in charge of a 40-bed hospital ward has **no live view of their own floor**.

They know the ward's status from memory, from walking around, and from a register last updated hours ago. Admissions and discharges happen continuously, patients are transferred between wards, and elective admissions are scheduled in advance — but all of this information lives in **separate systems, separate registers, or inside staff members' heads**.

The result:
- Wards hit **capacity without warning**
- Discharges that could have freed beds are **delayed**
- Staff make critical decisions on **stale data**
- Emergency admissions get **denied or delayed** because no one sees an available bed in time

This is not a problem that requires a full hospital information system. It requires a **focused, fast-loading dashboard** that shows one thing well: the **live state of every bed**, and where the ward is heading in the next few hours.

---

## 💡 Our Solution: Hospi-Track

**Hospi-Track** is a full-stack, real-time hospital ward intelligence platform that gives every stakeholder — ward doctors, nurses, and administrators — a single, live, actionable view of bed occupancy, patient flow, inventory, and outbreak intelligence.

It replaces guesswork with **data**. It replaces stale registers with **real-time Supabase subscriptions**. It replaces reactive crisis management with **AI-powered capacity forecasting**.

---

## 🎯 Key Features

### 🛏️ 1. Live Bed Board
- Visual tile grid showing every bed as: **Occupied · Available · Cleaning · Reserved**
- Each occupied tile shows patient name, admission date, condition category, and responsible doctor
- Staff can **update bed status in 2 taps** — change propagates to every connected device instantly
- **Zero manual reload** — Supabase Realtime WebSocket subscriptions push all changes live

### 🚶 2. Patient Flow & Admissions Queue
- Running list of **pending discharges** with estimated times and ordering doctor
- **Emergency admissions queue** — shows incoming patients from ED with expected arrival
- Staff can mark a discharge as completed or an admission as arrived — bed board updates automatically
- **Integrated escalation flags** — patients overdue for discharge, beds stuck in cleaning > 30 min

### 📦 3. Inventory Management
- Live count of all **medical equipment** (ventilators, monitors, infusion pumps, crash carts, etc.)
- Per-item actions: **Reserve · Mark In-Use · Release · Set Total** — all persist to Supabase
- **Low stock alerts** with configurable thresholds per item
- Realtime subscription — any change by any staff member is reflected everywhere instantly
- Filters by category (ICU / General / Emergency) and ward

### 🔬 4. Outbreak Intelligence
- Live **disease cluster monitoring** — Typhoid, Dengue, Influenza with risk levels (Safe / Warning / Critical)
- **Automatic outbreak alert banner** — triggers when any cluster crosses a threshold in a 6-hour window
- **Time-series chart** — hourly case count trends per disease over last 7 hours
- **Authority notification panel** — one-click routing to BMC, FSSAI, District PHO, WHO with `status: sent` persisted to DB
- All data live from Supabase, fully real-time

### 📊 5. AI Capacity Forecast (BedPulse)
Three forecast **scenarios** modelled on real hospital occupancy data:

| Scenario | Peak Occupancy | Avg Confidence |
|---|---|---|
| ☀️ Normal Day | 68–72% | 87–91% |
| ⚡ High Rush | 87–93% | 82–88% |
| 🌧️ Weekend / Holiday | 54–60% | 90–95% |

- **Scenario tab switcher** — instantly view different admission patterns
- **Compare All mode** — multi-line chart overlaying all 3 scenarios simultaneously
- **AI pipeline explainer** — visual 5-step breakdown of how the forecast is generated
- **Recommended Actions panel** — Clinical, Discharge, and Staffing suggestions from the AI

### 🏥 6. Admin Dashboard (Multi-Ward View)
- Campus-wide overview: **6 wards**, total beds, occupancy %, critical flags
- **Live occupancy** derived from real `beds` table — not hardcoded numbers
- Drill-down to any ward for full bed-level detail
- Critical ward auto-flagging when occupancy ≥ 90%

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                   BROWSER (React + Vite)             │
│  ┌──────────┐ ┌─────────────┐ ┌──────────────────┐  │
│  │ Bed Board│ │Patient Flow │ │  Inventory       │  │
│  │useRealtime│ │usePatientFlow│ │useInventoryData  │  │
│  │  Beds    │ │    Data     │ │  (Supabase)      │  │
│  └────┬─────┘ └──────┬──────┘ └────────┬─────────┘  │
│       │              │                  │             │
│  ┌────┴──────────────┴──────────────────┴──────────┐ │
│  │          Supabase Client (@supabase/supabase-js) │ │
│  │     Realtime WebSocket Subscriptions (postgres   │ │
│  │     _changes) + REST queries + RLS policies      │ │
│  └─────────────────────┬────────────────────────────┘ │
└────────────────────────┼─────────────────────────────┘
                         │
               ┌─────────▼──────────┐
               │  Supabase (Cloud)  │
               │  PostgreSQL 15     │
               │  8 tables + RLS    │
               │  Realtime enabled  │
               └─────────┬──────────┘
                         │
          ┌──────────────▼──────────────────┐
          │     BedPulse AI Service          │
          │     FastAPI · Python · Port 8001 │
          │                                  │
          │  LangGraph 5-step Pipeline:       │
          │  1. Fetch Data (Supabase)         │
          │  2. Feature Engineering (pandas)  │
          │  3. RandomForest Model (sklearn)  │
          │  4. 24h Prediction                │
          │  5. AI Insights (LLM)             │
          └──────────────────────────────────┘
```

---

## 🤖 AI Forecasting Pipeline (BedPulse)

The forecasting engine is a **5-node LangGraph StateGraph** that orchestrates the full ML pipeline:

```
Supabase Data
     │
     ▼
node_fetch_data ──► node_engineer_features ──► node_train_model ──► node_predict ──► node_explain
                                                                                          │
                                                                              3 structured actions
                                                                              (Clinical / Discharge
                                                                               / Staffing)
```

| Step | What it does |
|---|---|
| **Data Fetch** | Pulls historical admission records from Supabase `admission_history` for the ward |
| **Feature Engineering** | Computes hour-of-day, day-of-week, 3h/6h rolling averages, lag features using pandas |
| **RandomForest** | `scikit-learn` RandomForestRegressor — trained on 90 days of ward data, persisted to disk with `joblib` |
| **24h Prediction** | Generates hourly bed occupancy predictions with confidence scores |
| **AI Insights** | LLM generates 3 plain-English recommendations: clinical alert, discharge action, staffing advisory |

**Scenario profiles** (when live data is insufficient) are modelled on real NHS/AIIMS ward occupancy studies with realistic 24-hour curves.

---

## 🗄️ Database Schema (Supabase PostgreSQL)

| Table | Purpose |
|---|---|
| `beds` | All beds with status (available/occupied/cleaning/reserved) + ward link |
| `patients` | Patient records linked to beds — name, doctor, condition, discharge status |
| `admissions_queue` | Incoming patients — emergency / elective / walk-in |
| `wards` | 6 hospital wards with total bed count, alert count, critical flag |
| `equipment_items` | Medical inventory — total, available, in_use, reserved per item |
| `disease_clusters` | Outbreak clusters — disease, cases, time window, risk level |
| `disease_cases` | Hourly case counts per disease (for time-series chart) |
| `authority_contacts` | Government/health authority contacts for outbreak notification |

- **Row Level Security (RLS)** enabled on all tables
- **Realtime** publication enabled — all tables push `postgres_changes` events
- **Seed data** included: 22 beds, 10 patients (Ramesh Kumar, Priya Nair, Mohan Yadav…), 12 inventory items, 4 wards, outbreak data

---

## 🧰 Tech Stack

### Frontend
| Technology | Role |
|---|---|
| **React 18** | UI framework |
| **TypeScript 5** | Full type safety across all hooks and components |
| **Vite 8** | Build tool + dev server with proxy to AI service |
| **TailwindCSS 4** | Utility-first styling |
| **shadcn/ui + Radix UI** | Accessible component primitives |
| **Framer Motion** | Micro-animations, sidebar nav, page transitions |
| **Recharts** | Bar charts, line charts for forecast and outbreak |
| **React Router DOM** | Client-side routing with role-based guards |
| **Sonner** | Toast notifications |
| **@supabase/supabase-js** | Database client + Realtime subscriptions |

### Backend (AI Service)
| Technology | Role |
|---|---|
| **FastAPI** | REST API framework |
| **Uvicorn** | ASGI server with hot-reload |
| **LangGraph** | StateGraph orchestration for the 5-step ML pipeline |
| **scikit-learn** | RandomForestRegressor for bed occupancy prediction |
| **pandas / numpy** | Feature engineering and data manipulation |
| **joblib** | Model serialization (load from disk on startup) |
| **google-generativeai** | LLM for clinical insight generation |
| **supabase-py** | Server-side Supabase client for data fetch and forecast persistence |
| **Pydantic** | Request/response validation |

### Infrastructure
| Technology | Role |
|---|---|
| **Supabase** | PostgreSQL database + Realtime WebSockets + Auth-ready RLS |
| **Vite Proxy** | `/bedpulse → 127.0.0.1:8001` (dev) — no CORS issues |
| **GitHub** | Version control |

---

## 🗂️ Project Structure

```
hospital/
├── Hack4XLEGITTIM/              # React frontend
│   ├── src/
│   │   ├── pages/
│   │   │   ├── BedBoardPage.tsx          # Live bed tile grid
│   │   │   ├── PatientFlowPage.tsx       # Discharge + admission queue
│   │   │   ├── InventoryPage.tsx         # Equipment management
│   │   │   ├── OutbreakPage.tsx          # Disease intelligence
│   │   │   ├── ForecastDashboard.tsx     # AI forecast + scenarios
│   │   │   ├── AdminDashboardPage.tsx    # Multi-ward overview
│   │   │   └── AdminWardDetailPage.tsx   # Per-ward drill-down
│   │   ├── hooks/
│   │   │   ├── useRealtimeBeds.ts        # Supabase realtime beds
│   │   │   ├── usePatientFlowData.ts     # Discharge + queue data
│   │   │   ├── useInventoryData.ts       # Equipment CRUD + realtime
│   │   │   ├── useOutbreakData.ts        # Clusters + chart + authorities
│   │   │   └── useAdminDashboard.ts      # Ward occupancy aggregation
│   │   ├── lib/
│   │   │   ├── supabase.ts               # Supabase client init
│   │   │   ├── beds-api.ts               # Bed status update actions
│   │   │   ├── patient-flow-actions.ts   # Discharge / admit actions
│   │   │   ├── forecast-api.ts           # BedPulse API client
│   │   │   └── forecast-ui-map.ts        # Prediction → UI data mapping
│   │   └── components/
│   │       ├── layout/                   # Sidebar, layout shell
│   │       ├── forecast/                 # Capacity widget, metric cards
│   │       ├── outbreak/                 # Cluster table, authority cards, banner
│   │       └── admin/                   # Ward cards, stat bar
│   └── supabase/
│       └── schema.sql                    # Complete DB schema + seed data
│
└── ai_service/                  # Python FastAPI AI backend
    ├── main.py                   # FastAPI app + startup
    ├── routers/
    │   └── forecast.py           # /forecast endpoints (run, cached, weekday, save)
    ├── graphs/
    │   └── forecast_graph.py     # LangGraph 5-node StateGraph
    ├── services/
    │   ├── data_fetcher.py       # Supabase historical data fetch
    │   ├── feature_eng.py        # pandas feature engineering
    │   ├── model_trainer.py      # RandomForest train + inference
    │   └── explainer.py          # LLM insight generation
    └── models/
        └── forecast_model.joblib # Persisted ML model
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.11+
- A Supabase project (free tier works)

### 1. Run the SQL Schema

Go to **Supabase → SQL Editor → New query**, paste the contents of `Hack4XLEGITTIM/supabase/schema.sql` and click **Run**.

This creates all 8 tables + seed data (beds, patients, wards, inventory, outbreak).

### 2. Configure Environment

**`Hack4XLEGITTIM/.env`**
```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY
# Do NOT set VITE_API_URL — app uses Supabase directly
```

**`ai_service/.env`**
```env
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
GOOGLE_API_KEY=YOUR_GEMINI_KEY   # optional - for AI insights
```

### 3. Start Frontend

```bash
cd Hack4XLEGITTIM
npm install
npm run dev
# → http://localhost:5173
```

### 4. Start AI Service

```bash
cd ai_service
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python main.py
# → http://localhost:8001
```

---

## 📡 API Endpoints (AI Service)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Service health check |
| `GET` | `/forecast/health` | Forecast module + model status |
| `POST` | `/forecast/run/{ward_id}` | Run full LangGraph pipeline (ML + insights) |
| `GET` | `/forecast/cached/{ward_id}` | Read latest 24h predictions from Supabase |
| `GET` | `/forecast/weekday/{ward_id}` | 90-day weekday admission pattern analysis |
| `POST` | `/forecast/save/{ward_id}` | Persist predictions to Supabase `forecasts` table |

---

## 🌍 SDG Alignment

**SDG 3 — Good Health & Well-Being**

> *"Ensure healthy lives and promote well-being for all at any age."*

Hospi-Track directly contributes by:
- Reducing time-to-bed for emergency patients through real-time bed visibility
- Preventing ward overflow with proactive AI capacity forecasts
- Enabling faster outbreak detection and statutory notification
- Improving resource utilisation through live inventory tracking
- Reducing cognitive load on ward staff — one screen instead of many registers

---

## 👥 Suggested GitHub Names

```
hospi-track
wardwatch-ai
bedpulse-platform
ward-intelligence
hospi-pulse
```

**Recommended:** `hospi-track` or `wardwatch-ai`

---

## 📄 License

MIT — built at a hackathon for good.

---

<p align="center">
  Built with ❤️ for hospitals that deserve better tools.<br/>
  <strong>Hospi-Track · WardWatch · Problem Statement 1 · SDG 3</strong>
</p>
