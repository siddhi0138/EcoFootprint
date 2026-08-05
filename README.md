<div align="center">

# 🌿 EcoScope

### *AI-powered sustainability, grounded in real data*

Scan or search any product for a real AI-generated environmental analysis, track your personal
carbon footprint, compare products, plan lower-carbon trips, chat with an AI assistant grounded
in real sustainability knowledge, and connect with a community of like-minded users. 🌍✨

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black&style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white&style=flat-square)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white&style=flat-square)
![FastAPI](https://img.shields.io/badge/FastAPI-Python-009688?logo=fastapi&logoColor=white&style=flat-square)
![Firebase](https://img.shields.io/badge/Firebase-Firestore%20%2B%20Auth-FFCA28?logo=firebase&logoColor=black&style=flat-square)
![Tailwind](https://img.shields.io/badge/TailwindCSS-3-06B6D4?logo=tailwindcss&logoColor=white&style=flat-square)

</div>

---

## 📖 Overview

EcoScope is a full-stack app: a React frontend talking to a Python/FastAPI backend that calls
real LLM providers (🔮 Gemini / OpenRouter) for product analysis, recommendations, lifecycle
generation, and a RAG-grounded chatbot. All
user data (carbon entries, scans, comparisons, course progress, community posts, orders, and
more) lives in 🔥 Firebase Firestore, under rules that scope everything to its owner.

---

## 🛠️ Tech Stack

### 🎨 Frontend
| | |
|---|---|
| ⚛️ **React 18** + **TypeScript** + **Vite** | Fast, type-safe UI |
| 💨 **Tailwind CSS** + **shadcn/ui** | Utility-first styling on Radix primitives, mobile-first responsive layouts throughout |
| 🧭 **React Router** | Page navigation |
| 📊 **Recharts** | Carbon trends, product analysis, radar/bar breakdowns |
| 📄 **jsPDF** | Real generated PDFs — checkout receipts, course certificates |
| 📝 **react-markdown** | Renders AI chat replies & article content as formatted markdown |
| 🔥 **Firebase SDK** | Auth (Google + email/password) and Firestore (client) |

### ⚙️ Backend
| | |
|---|---|
| 🚀 **FastAPI** (Python) + **Pydantic** | Typed request/response schemas throughout |
| 🌐 **httpx** | External API calls |
| 🤖 **OpenAI SDK** | Client for both Gemini and OpenRouter (OpenAI-compatible endpoints) |
| 🧠 **ChromaDB** + **sentence-transformers** | Vector store + embeddings for EcoBot's RAG pipeline |
| 🔐 **firebase-admin** | Server-side Firestore access for maintenance/seed scripts |

### ✨ GenAI, specifically
- 🔁 **Dual LLM providers with fallback** (Gemini → OpenRouter) for analysis, comparisons,
  recommendations, chat, and lifecycle generation — one provider hitting its free-tier limit
  never takes a feature down.
- 📸 **Vision analysis** — photo-based product identification via a vision-capable model.
- 📚 **RAG (Retrieval-Augmented Generation)** — `backend/rag/retriever.py` retrieves relevant
  knowledge chunks before EcoBot answers or a product lifecycle assessment is generated, so
  replies are grounded in cited sources (published LCA studies for lifecycle stages) rather than
  invented outright.
- 🛠️ **Function/tool calling** — the chat model can call real backend functions mid-conversation
  (carbon footprint calculation, product search) via `backend/services/tools.py`.
- 🧮 **Deterministic sustainability scoring** — the overall score is a fixed weighted formula over
  the carbon/packaging/health category scores (`backend/services/scoring.py`), not a number the
  LLM invents on its own.

### ☁️ Data & Infra
- 🔥 **Firebase Firestore** — primary database, explicit security rules (`firestore.rules`)
- 🌐 **Firebase Hosting** — frontend deployment target
- 🔑 **Firebase Auth** — Google Sign-In + email/password
- 🍃 **OpenFoodFacts** (product data/search, legacy→newer-API fallback), **DummyJSON**
  (marketplace catalog), **Nominatim** + **OpenRouteService** (routing)
- ➕ Optional: **eBay** (non-food search), **Gmail API / Resend** (transactional email, no
  personal password used)

---

## ✨ Features

| | |
|---|---|
| 📷 **AI Scanner** | Barcode scan, photo upload, or text search → real sustainability analysis |
| 🔍 **Product Analysis** | Real metrics breakdown, a genuine trend chart built from your own history (never fabricated), embedded Lifecycle tab, comparison, AI suggestions |
| ⚖️ **Product Comparison** | Side-by-side scoring with derived pros/cons + AI recommendation |
| 🛒 **Marketplace** | Real product catalog — favorite, compare, add to cart |
| 🌍 **Carbon Tracker** | Log emissions by category, AI-assisted estimation from plain text |
| 💡 **AI Recommendations** | Personalized suggestions from your real usage stats |
| 🤖 **EcoBot** | RAG-grounded chat assistant with tool-calling + persistent history |
| 🎓 **Education Center** | Real course content, per-lesson tracking, PDF certificates emailed on completion, one-click calendar add, independent course/article bookmarking |
| 🤝 **Community Hub** | Posts, groups with live group chat, events, challenges |
| 🚴 **Transportation Planner** | Real routing across walking/cycling/driving with real cost & emissions |
| 🧾 **Checkout** | Real PDF receipts, emailed on request, permanent order history |
| 👤 **Profile, Goals & Notifications** | Fully wired to real Firestore-backed state |

---

## 📁 Project Structure

```
EcoFootprint/
├── src/                     # React frontend
│   ├── components/          # Feature components (Scanner, Marketplace, EducationCenter, ...)
│   ├── contexts/             # Auth, Cart, UserData, ProductComparison, Notifications
│   ├── services/              # Typed API clients calling the FastAPI backend
│   └── pages/                  # Routed pages (Checkout, Goals, About, ...)
├── backend/
│   ├── app.py                # FastAPI entrypoint
│   ├── routes/                 # product, carbon, chat, recommendations, insights, rag, email
│   ├── services/                # llm.py (provider fallback), barcode.py, gmail/email, tools.py
│   ├── prompts/                   # LLM prompt builders
│   ├── rag/                        # retriever.py - Chroma-backed retrieval for EcoBot
│   └── scripts/                     # one-time setup helpers (e.g. Gmail OAuth token)
├── firestore.rules            # Firestore security rules
└── firebase.json               # Hosting + Firestore config
```

---

## 🚀 Getting Started

### ✅ Prerequisites
- **Node.js** 18+ and npm
- **Python** 3.10+
- A **Firebase project** (Firestore + Auth enabled)

### 1️⃣ Frontend setup

```bash
npm install
cp .env.example .env      # fill in your Firebase client config (see table below)
npm run dev                # → http://localhost:8080
```

### 2️⃣ Backend setup

```bash
cd backend
python -m venv venv
./venv/Scripts/activate     # Windows; use `source venv/bin/activate` on macOS/Linux
pip install -r requirements.txt
cp .env.example .env         # fill in at least one LLM key (see table below)
```

Place a Firebase **service account key** at `backend/secrets/serviceAccountKey.json` (Firebase
Console → Project Settings → Service Accounts → Generate new private key), then:

```bash
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

### 3️⃣ Firestore rules

```bash
npx firebase-tools deploy --only firestore:rules --project <your-project-id>
```

---

## 🔑 Environment Variables

**Frontend (`.env`)**

| Variable | Required | Notes |
|---|---|---|
| `VITE_FIREBASE_*` (7 keys) | ✅ Yes | Firebase client config — safe to expose, protected by Firestore rules |
| `VITE_OPEN_ROUTE_SERVICE_API_KEY` | ✅ For Transportation Planner | Free tier at openrouteservice.org |
| `VITE_API_BASE_URL` | ✅ Yes | Points at the backend, e.g. `http://localhost:8000` |

**Backend (`backend/.env`)**

| Variable | Required | Notes |
|---|---|---|
| `GEMINI_API_KEY` / `OPENROUTER_API_KEY` | ✅ At least one | Both tried in order; without either, features use a fallback estimation |
| `FIREBASE_SERVICE_ACCOUNT_PATH` | ✅ Yes | Path to your service account JSON |
| `FRONTEND_ORIGIN` | ✅ Yes | CORS — your frontend's URL |
| `EBAY_CLIENT_ID` / `EBAY_CLIENT_SECRET` | ⭐ Optional | Non-food product search |
| `GMAIL_*` / `RESEND_*` | ⭐ Optional | Transactional email — see `.env.example` comments for setup |

---

## 🔧 Available Scripts

- `npm run dev` — 🖥️ start the frontend dev server (port 8080)
- `npm run build` — 📦 production build
- `npm run preview` — 👀 preview the production build locally
- `npm run lint` — 🧹 ESLint

Backend: `uvicorn app:app --reload` (from `backend/`, with the venv active).

---

## 🚀 Deployment

- **Frontend** → `npm run build` then `npx firebase-tools deploy --only hosting`
- **Firestore rules** → `npx firebase-tools deploy --only firestore:rules`
- **Backend** → any host that runs a long-lived Python ASGI process (Cloud Run, Render,
  Railway, a VM, etc.) — no Firebase-specific hosting requirement

---

## 🤝 Contributing

1. 🍴 Fork the repo and create a feature branch off `main`
2. ✏️ Make your changes with clear commit messages
3. ✅ Run `npm run build` and `npx tsc --noEmit` before opening a PR
4. 📬 Open a Pull Request describing what changed and why

<div align="center">

---

**🌱 Made for a more sustainable tomorrow.**

</div>
