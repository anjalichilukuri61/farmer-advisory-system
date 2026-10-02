# AgriWise — AI-Powered Smart Farming Decision Support System

AgriWise is a full-stack, production-grade agricultural decision support platform designed to assist smallholder and commercial farmers in maximizing crop yields, optimizing resource inputs, and mitigating climate risks through calibrated machine learning and agronomic science.

---

## Key Features

1. **Multi-Class Crop Recommendation:** Calibrated Random Forest & Mahalanobis Distance ensemble recommending the most viable crop with genuine probability scores, alternative viable varieties, and full feature attribution.
2. **Agronomic Yield Prediction:** Multivariable polynomial regression model estimating harvest tonnage per hectare, total farm yields, and statistical 90% confidence intervals.
3. **Soil Nutrient-Gap Fertilizer Advisory:** Stoichiometric calculation of N-P-K deficits based on ICAR standards, generating exact dosages of Urea, DAP, MOP, Farmyard Manure, and split-application timing.
4. **FAO-56 Irrigation Decision Engine:** Biophysical soil moisture balance evaluating crop evapotranspiration ($ET_0$) against incoming 48-hour satellite weather forecasts to prevent water waste and crop stress.
5. **Microclimate Pathogen Risk Evaluator:** Epidemiological spore germination risk engine assessing humidity-temperature incubation windows to identify high-risk foliar diseases and preventative biological controls.
6. **Live Agro-Meteorological Telemetry:** Live meteorological integration with Open-Meteo High Resolution models and dynamic agricultural alerts (spraying hazards, heat stress, frost warnings, heavy rain).
7. **Farmer-Friendly Multilingual UI:** Clean, high-contrast, mobile-first interface supporting **English**, **Telugu (తెలుగు)**, and **Hindi (हिन्दी)**.
8. **Prediction Audit Trail & History:** Complete audit trail storing soil test values, weather conditions, predictions, and model versions for seasonal comparison.
9. **Admin & Model Governance Console:** Live telemetry of system health, active model registry, validation metrics (Accuracy, F1, RMSE, R²), and security audit logs.

---

## Architecture Overview

```
agriwise/
├── server.ts                   # Full-Stack entry point (Express + Vite middlewares)
├── server/
│   ├── config/                 # Environment & security config
│   ├── db/                     # Relational database abstraction (PostgreSQL & local ACID store)
│   ├── middleware/             # JWT auth, RBAC, input sanitization, error handler
│   ├── routes/                 # REST API (/api/auth, /api/farms, /api/predictions, /api/weather, /api/admin)
│   └── services/               # Weather service (Open-Meteo live feed + 15m cache)
├── ml/
│   ├── models/                 # Calibrated crop benchmarks & model parameters
│   ├── inference/              # Production TS inference engines (Crop, Yield, Fertilizer, Irrigation, Disease)
│   ├── training/               # Python training scripts (train_models.py)
│   └── evaluation/             # Metrics calculators (Accuracy, Precision, Recall, F1, MAE, RMSE, R²)
├── database/
│   ├── schema.sql              # PostgreSQL DDL migrations
│   └── seeds.sql               # Initial model versions and registries
├── src/
│   ├── components/             # Reusable farmer-friendly UI components
│   ├── i18n/                   # Multilingual dictionaries (en, te, hi)
│   ├── services/               # Frontend API client
│   └── types/                  # Shared TypeScript interfaces
├── tests/                      # Automated test suite (api_ml.test.ts)
├── docs/                       # API docs and ML model documentation
├── Dockerfile                  # Production container definition
└── docker-compose.yml          # Multi-container Postgres + App setup
```

---

## Tech Stack

* **Frontend:** React 19, TypeScript, Tailwind CSS v4, Lucide React, Motion.
* **Backend:** Node.js, Express, TypeScript (`tsx`), JSON Web Tokens (`jsonwebtoken`), `bcryptjs`.
* **Database:** PostgreSQL (with automatic in-process ACID relational file fallback for local/offline environments).
* **Machine Learning & Agronomy:** Scikit-Learn (Python training pipeline), Calibrated Mahalanobis-Softmax classifier, Multivariable Polynomial Regressor, ICAR Stoichiometric formulation, FAO-56 Penman-Monteith ET0.
* **Weather:** Open-Meteo High Resolution Meteorological API (ECMWF/GFS) with server-side caching and failover.

---

## Quick Start & Local Setup

### 1. Installation
```bash
git clone <repo-url>
cd agriwise
npm install
```

### 2. Configure Environment
Copy the example environment file:
```bash
cp .env.example .env
```
*(The default configuration runs out of the box with zero external dependencies required).*

### 3. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Run Automated Tests
```bash
npm test
```
Executes 19 automated tests validating ML probability distributions, yield intervals, fertilizer stoichiometry, irrigation forecast deferrals, and validation boundaries.

---

## Default Demo Credentials

For quick evaluation, click the instant demo login buttons on the sign-in modal, or use:

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Farmer** | `farmer@agriwise.org` | `farmer123` | Farm management, soil data entry, crop advisories, history |
| **Admin** | `admin@agriwise.org` | `admin123` | All farmer features + Model governance, telemetry, audit logs |

---

## Production Deployment with Docker

### Using Docker Compose (App + PostgreSQL)
```bash
docker-compose up -d --build
```
This launches:
* **PostgreSQL 16** with automatic DDL schema initialization from `database/schema.sql` and `database/seeds.sql`.
* **AgriWise Application** on port 3000 with healthcheck probes enabled.

Health check:
```bash
curl http://localhost:3000/health
```

---

## Agricultural Safety & Disclaimer

AgriWise is a decision-support system intended to provide scientific recommendations based on user-provided soil tests and prevailing atmospheric conditions. It does not replace on-site physical laboratory soil tests or localized agricultural extension guidance. Always verify large-scale chemical applications with your district agricultural university or extension officer.
