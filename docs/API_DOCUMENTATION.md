# AgriWise REST API Documentation

Base URL: `http://localhost:3000/api`

All authenticated endpoints require the HTTP Header:
`Authorization: Bearer <JWT_TOKEN>`

---

## 1. Authentication
* `POST /auth/register`
  * Body: `{ name, email, password, role?: 'FARMER' | 'ADMIN', preferred_language?: 'en' | 'te' | 'hi' }`
  * Returns: `{ token, user: { id, name, email, role, preferred_language } }`
* `POST /auth/login`
  * Body: `{ email, password }`
  * Returns: `{ token, user }`
* `GET /auth/me`
  * Authenticated user profile.

---

## 2. Farm Management
* `GET /farms`
  * Returns array of farms belonging to the authenticated user with their associated soil profiles.
* `POST /farms`
  * Body: `{ name, location, state, district, latitude, longitude, area_hectares, profile: { soil_type, nitrogen, phosphorus, potassium, ph, soil_moisture, water_source, irrigation_type } }`
* `GET /farms/:id`
  * Returns specific farm details.
* `PUT /farms/:id/profile`
  * Updates soil and moisture characteristics.

---

## 3. Agricultural Weather & Alerts
* `GET /weather?lat=17.9689&lon=79.5941&location=Warangal`
  * Queries live Open-Meteo High Resolution meteorological models.
  * Returns: Current metrics (temperature, humidity, rainfall, wind speed), 5-day forecast, and agronomic weather alerts (heat stress, frost hazard, spraying warning, heavy rain).
* `GET /alerts?farmId=farm_001`
  * Fetches active weather and pest alerts for the farm.
* `POST /alerts/:id/dismiss`
  * Dismisses an active alert.

---

## 4. ML Predictive Models & Advisories
* `POST /predictions/crop`
  * Body: `{ nitrogen, phosphorus, potassium, ph, temperature, humidity, rainfall, soil_type }`
  * Returns: Top recommended crop, calibrated probability %, alternatives with probabilities, and parameter attribution.
* `POST /predictions/yield`
  * Body: `{ crop, area_hectares, nitrogen, phosphorus, potassium, ph, temperature, rainfall, soil_type }`
  * Returns: Predicted tonnes/ha, total farm yield, 90% confidence interval, and influencing factors.
* `POST /predictions/fertilizer`
  * Body: `{ crop, nitrogen, phosphorus, potassium, ph, area_hectares }`
  * Returns: Deficit assessment, stoichiometric dosages of Urea, DAP, MOP, FYM, split schedule, and safety notes.
* `POST /predictions/irrigation`
  * Body: `{ crop, soil_moisture_percentage, temperature, humidity, forecast_rainfall_next_48h_mm }`
  * Returns: Water application need (Needed / Deferred), suggested timing, depth in mm, and weather considerations.
* `POST /predictions/disease`
  * Body: `{ crop, temperature, humidity, rainfall }`
  * Returns: Risk level (LOW/MEDIUM/HIGH), susceptible diseases, early leaf symptoms, and preventive cultural actions.
* `POST /predictions/comprehensive`
  * Evaluates all 5 models simultaneously, incorporates live weather telemetry, records the audit trail, and returns complete farm advisory.

---

## 5. Prediction History
* `GET /predictions?farmId=...&type=...&limit=...`
  * Retrieves past prediction records.
* `GET /predictions/:id`
  * Detailed prediction record with input and output JSON.

---

## 6. Admin & Governance
* `GET /admin/analytics` (ADMIN only)
  * Returns user count, farms, prediction breakdowns, and alerts.
* `GET /admin/models` (ADMIN only)
  * Deployed model registry with version, algorithm, training date, and accuracy metrics.
* `GET /admin/audit-logs` (ADMIN only)
  * Security and access log stream.
* `GET /health` (Public)
  * Liveness probe returning status, database connectivity, and uptime.
