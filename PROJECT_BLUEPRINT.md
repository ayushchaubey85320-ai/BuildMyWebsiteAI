# BuildMyWebsiteAI (Prompt2Website) Master System Blueprint

## Overview
**BuildMyWebsiteAI** is an enterprise-grade, AI-driven website generation and conversational editing studio. Powered by **Google Gemini 2.0 AI Engine** and backed by a high-availability **Aiven Cloud MySQL Cluster**, BuildMyWebsiteAI enables users to instantly construct, customize, version-control, preview across multi-device viewports, download standalone production bundles, and publish websites to co-domain networks.

---

## Technical Stack Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   FRONTEND / UI LAYER                   │
│ React 18 | Vite | Tailwind CSS | Framer Motion | Lucide │
└────────────────────────────┬────────────────────────────┘
                             │ Axios REST API
┌────────────────────────────▼────────────────────────────┐
│                  BACKEND / API ENGINE                   │
│ FastAPI | Python 3.13 | Pydantic v2 | SQLAlchemy 2.0    │
└───────┬────────────────────┬────────────────────┬───────┘
        │                    │                    │
┌───────▼────────┐  ┌────────▼────────┐  ┌────────▼────────┐
│   DATABASE     │  │   AI ENGINE     │  │ EXPORT / HOST   │
│  Aiven MySQL   │  │ Gemini 2.0 Flash│  │ Static Server / │
│  (PyMySQL)     │  │ (google-genai)  │  │ ZIP Compiler    │
└────────────────┘  └─────────────────┘  └─────────────────┘
```

### 1. Backend Core (`/backend`)
- **Framework**: FastAPI (Python 3.13)
- **Database ORM**: SQLAlchemy 2.0 with PyMySQL driver + SSL connection tuning for Aiven Cloud.
- **AI Integration**: Gemini 2.0 REST API engine parsing brand metadata (Logo, Email, Phone, Theme) into validated structured JSON page trees.
- **Authentication**: JWT tokens + Bcrypt password hashing + 6-digit Email OTP verification suite.
- **Exporter Engine**: In-memory ZIP buffer compiler generating `index.html`, `styles.css`, assets, and `DEPLOYMENT_GUIDE.md`.

### 2. Frontend Studio (`/frontend`)
- **Core Library**: React 18 + Vite
- **Styling**: Tailwind CSS + Glassmorphism utilities + CSS animations
- **Interactivity**: Framer Motion, HTML5 Particle Canvas Background, Canvas Confetti
- **Components**:
  - `AnimatedBackground`: Dynamic floating particle canvas with glow effects.
  - `CreationWizardModal`: 22 website categories, logo upload preview, embedded contact fields, 6 theme cards, and custom prompt textarea.
  - `CreationLoader`: 4-stage animated progress screen.
  - `AIEditBar`: Conversational AI prompt editor floating bar with version control history timeline.
  - `Preview`: Multi-viewport canvas switcher (Desktop, Tablet, Mobile).

---

## Database Schemas (Aiven MySQL)

1. **`users`**:
   - `id` (INT, PK, Auto-Increment)
   - `email` (VARCHAR(255), Unique)
   - `hashed_password` (VARCHAR(255))
   - `is_verified` (BOOLEAN)
   - `otp_code` (VARCHAR(10))
   - `otp_expires_at` (DATETIME)
   - `created_at` (DATETIME)

2. **`websites`**:
   - `id` (INT, PK, Auto-Increment)
   - `user_id` (INT, FK -> `users.id`)
   - `title` (VARCHAR(255))
   - `category` (VARCHAR(100))
   - `theme` (VARCHAR(100))
   - `logo_url` (TEXT)
   - `contact_email` (VARCHAR(255))
   - `contact_phone` (VARCHAR(100))
   - `prompt` (TEXT)
   - `page_tree` (JSON)
   - `subdomain` (VARCHAR(255), Unique)
   - `is_published` (BOOLEAN)
   - `created_at` (DATETIME)
   - `updated_at` (DATETIME)

3. **`edit_histories`**:
   - `id` (INT, PK, Auto-Increment)
   - `website_id` (INT, FK -> `websites.id`)
   - `prompt_instruction` (TEXT)
   - `page_tree_snapshot` (JSON)
   - `created_at` (DATETIME)

---

## Rapid Setup Instructions

### 1. Backend Launch
```bash
cd backend
pip install -r requirements.txt
python app/main.py
```
*(Runs on `http://localhost:8000` with Swagger UI at `/docs`)*

### 2. Frontend Launch
```bash
cd frontend
npm install
npm run dev
```
*(Runs on `http://localhost:5173` with proxying to backend)*

---
*Developed for BuildMyWebsiteAI Studio*
