# 🚀 BuildMyWebsiteAI - AI-Powered Website Generator & Multi-Tenant Platform

**BuildMyWebsiteAI** is a full-stack, AI-powered web platform built with **React, Vite, Tailwind CSS, FastAPI, and MySQL/SQLite**. It enables users to generate, customize, preview, and export responsive websites in seconds using AI prompt instructions.

---

## 🌟 Key Features

- **🤖 AI Web Generation Engine**: Generate full-featured single-page or multi-page websites using Gemini AI.
- **🎨 Luminous Light Mode & Custom Gradients**: Vibrant Cyan, Sky Blue, and Light Pink design tokens.
- **✨ Live Particle Canvas Background**: Interactive floating particle background across all web application views.
- **👑 Super Admin Control Center (`/admin`)**: Manage all registered users, project metrics, and launch direct 1-click user sessions.
- **🔒 Multi-Tenant Data Isolation**: 100% isolated user workspace per user account.
- **🔄 Cross-Tab Session Synchronization**: Instant real-time logout and account switch detection across browser tabs.
- **🖼️ Custom Brand Logo Support**: Upload local PNG/JPEG logo files placed on the left side of header navigation.
- **📦 1-Click ZIP Export & Deployment**: Download complete HTML/CSS static bundles or publish to co-domains.
- **🛡️ Resilient Dual-Database Engine**: Auto-fallback to local SQLite if cloud database is unreachable.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite 5, Tailwind CSS 4, Framer Motion, Lucide React, Axios.
- **Backend**: Python 3.11+, FastAPI, SQLAlchemy, PyMySQL, Gunicorn, Uvicorn, Pydantic v2.
- **Database**: Aiven Cloud MySQL / Local SQLite Fallback.
- **Containerization**: Docker, Docker Compose, Nginx.

---

## 🚀 Quick Start (Local Development)

### 1. Backend Setup
```bash
cd backend
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
python app/main.py
```
Backend server will run at `http://localhost:8000`.

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend application will run at `http://localhost:5173`.

---

## 🐳 Production Docker Deployment

```bash
docker-compose up -d --build
```

---

## 📝 License
Built with ❤️ by BuildMyWebsiteAI Team.
