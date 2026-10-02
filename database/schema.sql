-- ===================================================
-- AgriWise Database Schema (PostgreSQL DDL)
-- Production Relational Schema with Full Audit Trail
-- ===================================================

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(160) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'FARMER' CHECK (role IN ('FARMER', 'ADMIN')),
    preferred_language VARCHAR(10) NOT NULL DEFAULT 'en',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS farms (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(140) NOT NULL,
    location VARCHAR(160) NOT NULL,
    state VARCHAR(100),
    district VARCHAR(100),
    latitude NUMERIC(9, 6) DEFAULT 20.5937,
    longitude NUMERIC(9, 6) DEFAULT 78.9629,
    area_hectares NUMERIC(8, 2) NOT NULL DEFAULT 1.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS farm_profiles (
    id VARCHAR(64) PRIMARY KEY,
    farm_id VARCHAR(64) UNIQUE NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    soil_type VARCHAR(60) NOT NULL DEFAULT 'Loamy',
    nitrogen NUMERIC(6, 2) NOT NULL DEFAULT 60.0,
    phosphorus NUMERIC(6, 2) NOT NULL DEFAULT 40.0,
    potassium NUMERIC(6, 2) NOT NULL DEFAULT 40.0,
    ph NUMERIC(4, 2) NOT NULL DEFAULT 6.5,
    soil_moisture NUMERIC(5, 2) NOT NULL DEFAULT 45.0,
    water_source VARCHAR(60) DEFAULT 'Borewell',
    irrigation_type VARCHAR(60) DEFAULT 'Drip',
    last_tested_date DATE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS model_versions (
    id VARCHAR(64) PRIMARY KEY,
    model_name VARCHAR(100) NOT NULL,
    model_type VARCHAR(60) NOT NULL,
    version VARCHAR(20) NOT NULL,
    algorithm VARCHAR(100) NOT NULL,
    training_date TIMESTAMP WITH TIME ZONE,
    dataset_name VARCHAR(120),
    metrics_json JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS predictions (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    farm_id VARCHAR(64) NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    prediction_type VARCHAR(40) NOT NULL, -- 'CROP', 'YIELD', 'FERTILIZER', 'IRRIGATION', 'DISEASE', 'COMPREHENSIVE'
    model_version_id VARCHAR(64) REFERENCES model_versions(id),
    inputs_json JSONB NOT NULL,
    output_json JSONB NOT NULL,
    explanation_json JSONB,
    weather_context_json JSONB,
    confidence_score NUMERIC(5, 4),
    status VARCHAR(20) DEFAULT 'COMPLETED',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS recommendations (
    id VARCHAR(64) PRIMARY KEY,
    prediction_id VARCHAR(64) REFERENCES predictions(id) ON DELETE CASCADE,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    farm_id VARCHAR(64) NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    title VARCHAR(180) NOT NULL,
    category VARCHAR(40) NOT NULL, -- 'CROP', 'FERTILIZER', 'WATER', 'DISEASE', 'SAFETY'
    action_items_json JSONB NOT NULL,
    reasoning TEXT,
    urgency VARCHAR(20) DEFAULT 'MEDIUM' CHECK (urgency IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS weather_records (
    id VARCHAR(64) PRIMARY KEY,
    farm_id VARCHAR(64) REFERENCES farms(id) ON DELETE CASCADE,
    temperature NUMERIC(5, 2) NOT NULL,
    humidity NUMERIC(5, 2) NOT NULL,
    rainfall_mm NUMERIC(6, 2) NOT NULL,
    weather_condition VARCHAR(100),
    wind_speed_kmh NUMERIC(5, 2),
    source VARCHAR(60) DEFAULT 'Open-Meteo',
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS alerts (
    id VARCHAR(64) PRIMARY KEY,
    farm_id VARCHAR(64) REFERENCES farms(id) ON DELETE CASCADE,
    alert_type VARCHAR(40) NOT NULL, -- 'WEATHER', 'IRRIGATION', 'DISEASE', 'NUTRIENT'
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    title VARCHAR(160) NOT NULL,
    message TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64),
    action VARCHAR(100) NOT NULL,
    resource VARCHAR(100),
    ip_address VARCHAR(45),
    status VARCHAR(20) NOT NULL,
    details_json JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indices for performance
CREATE INDEX IF NOT EXISTS idx_farms_user_id ON farms(user_id);
CREATE INDEX IF NOT EXISTS idx_predictions_user_id ON predictions(user_id);
CREATE INDEX IF NOT EXISTS idx_predictions_farm_id ON predictions(farm_id);
CREATE INDEX IF NOT EXISTS idx_predictions_type ON predictions(prediction_type);
CREATE INDEX IF NOT EXISTS idx_recommendations_farm_id ON recommendations(farm_id);
CREATE INDEX IF NOT EXISTS idx_alerts_farm_active ON alerts(farm_id, is_active);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at DESC);
