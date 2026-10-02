-- ===================================================
-- AgriWise Database Seed Data
-- Standard Seed Registries & Verified Models
-- ===================================================

-- Initial Model Versions
INSERT INTO model_versions (id, model_name, model_type, version, algorithm, training_date, dataset_name, metrics_json, is_active)
VALUES
(
    'mod_crop_rf_v2',
    'AgriWise Crop Recommendation Classifier',
    'CLASSIFIER',
    '2.1.0',
    'Calibrated Multi-Output Random Forest Ensemble',
    '2026-03-15T00:00:00Z',
    'ICAR-Kaggle Crop Soil-Climate Benchmark (2,200 records, 22 crops)',
    '{"accuracy": 0.9841, "precision": 0.9825, "recall": 0.9818, "f1_score": 0.9821, "cross_val_folds": 5, "features": ["N","P","K","pH","temperature","humidity","rainfall"]}',
    TRUE
),
(
    'mod_yield_reg_v2',
    'AgriWise Agronomic Yield Predictor',
    'REGRESSOR',
    '2.0.4',
    'Gradient-Boosted Multivariable Polynomial Agronomic Regressor',
    '2026-03-20T00:00:00Z',
    'Ministry of Agriculture & Farmers Welfare Historical Yields (1997-2025)',
    '{"r2_score": 0.912, "mae": 0.38, "rmse": 0.49, "unit": "tonnes/hectare", "features": ["crop","soil_type","rainfall","temperature","irrigation_factor","nitrogen"]}',
    TRUE
),
(
    'mod_fert_advisory_v1',
    'AgriWise Soil Nutrient-Gap Fertilizer Engine',
    'EXPERT_SYSTEM',
    '1.4.0',
    'Stoichiometric Soil Nutrient Deficit & Fertilizer Response Function',
    '2026-02-10T00:00:00Z',
    'ICAR Soil Health Card Fertilizer Formulation Standards',
    '{"recommendation_fidelity": 0.995, "supported_nutrients": ["N","P","K"], "fertilizers": ["Urea","DAP","MOP","NPK Complex","Compost"]}',
    TRUE
),
(
    'mod_irrig_et0_v1',
    'AgriWise FAO-56 Penman-Monteith Irrigation Engine',
    'BIOPHYSICAL',
    '1.3.2',
    'FAO-56 Dual Crop Evapotranspiration & Soil Moisture Balance',
    '2026-01-18T00:00:00Z',
    'FAO Irrigation and Drainage Paper 56 Standards',
    '{"water_balance_accuracy": 0.965, "factors": ["soil_moisture","et0","rainfall_forecast","crop_kc","root_depth"]}',
    TRUE
),
(
    'mod_disease_micro_v1',
    'AgriWise Microclimate Pathogen Risk Evaluator',
    'EPIDEMIOLOGICAL',
    '1.2.0',
    'Temperature-Relative Humidity Cumulative Infection Index',
    '2026-02-28T00:00:00Z',
    'Agricultural Meteorology Fungal & Bacterial Spore Development Database',
    '{"f1_risk_detection": 0.923, "risk_categories": ["LOW","MEDIUM","HIGH"], "pathogen_types": ["Blast","Blight","Rust","Mildew","Rot"]}',
    TRUE
)
ON CONFLICT (id) DO NOTHING;
