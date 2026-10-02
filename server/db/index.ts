// server/db/index.ts
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { config } from '../config/index.js';

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: 'FARMER' | 'ADMIN';
  preferred_language: 'en' | 'te' | 'hi';
  created_at: string;
  updated_at: string;
}

export interface FarmRecord {
  id: string;
  user_id: string;
  name: string;
  location: string;
  state: string;
  district: string;
  latitude: number;
  longitude: number;
  area_hectares: number;
  created_at: string;
  updated_at: string;
}

export interface FarmProfileRecord {
  id: string;
  farm_id: string;
  soil_type: string;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  ph: number;
  soil_moisture: number;
  water_source: string;
  irrigation_type: string;
  last_tested_date: string;
  updated_at: string;
}

export interface ModelVersionRecord {
  id: string;
  model_name: string;
  model_type: string;
  version: string;
  algorithm: string;
  training_date: string;
  dataset_name: string;
  metrics_json: any;
  is_active: boolean;
  created_at: string;
}

export interface PredictionRecord {
  id: string;
  user_id: string;
  farm_id: string;
  prediction_type: string;
  model_version_id: string;
  inputs_json: any;
  output_json: any;
  explanation_json: any;
  weather_context_json: any;
  confidence_score: number | null;
  status: string;
  created_at: string;
}

export interface RecommendationRecord {
  id: string;
  prediction_id: string;
  user_id: string;
  farm_id: string;
  title: string;
  category: string;
  action_items_json: string[];
  reasoning: string;
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  created_at: string;
}

export interface WeatherRecordItem {
  id: string;
  farm_id: string;
  temperature: number;
  humidity: number;
  rainfall_mm: number;
  weather_condition: string;
  wind_speed_kmh: number;
  source: string;
  recorded_at: string;
}

export interface AlertRecord {
  id: string;
  farm_id: string;
  alert_type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  title: string;
  message: string;
  is_active: boolean;
  created_at: string;
}

export interface AuditLogRecord {
  id: string;
  user_id: string | null;
  action: string;
  resource: string;
  ip_address: string;
  status: string;
  details_json: any;
  created_at: string;
}

export interface SoilReportRecord {
  id: string;
  farm_id: string;
  user_id: string;
  file_name: string;
  file_type: string;
  file_size?: number;
  upload_date: string;
  extracted_values: {
    nitrogen?: number;
    phosphorus?: number;
    potassium?: number;
    ph?: number;
    soil_moisture?: number;
    organic_carbon?: number;
    electrical_conductivity?: number;
    soil_type?: string;
    [key: string]: any;
  };
  confirmed_values?: {
    nitrogen: number;
    phosphorus: number;
    potassium: number;
    ph: number;
    soil_moisture?: number;
    organic_carbon?: number;
    electrical_conductivity?: number;
    soil_type: string;
    [key: string]: any;
  };
  status: 'PENDING_CONFIRMATION' | 'CONFIRMED';
  source: 'OCR_GEMINI' | 'OCR_PARSER' | 'MANUAL';
  confirmed_at?: string;
  corrections?: Record<string, any>;
}

interface DatabaseState {
  users: UserRecord[];
  farms: FarmRecord[];
  farm_profiles: FarmProfileRecord[];
  model_versions: ModelVersionRecord[];
  predictions: PredictionRecord[];
  recommendations: RecommendationRecord[];
  weather_records: WeatherRecordItem[];
  alerts: AlertRecord[];
  audit_logs: AuditLogRecord[];
  soil_reports: SoilReportRecord[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'agriwise_db.json');

class RelationalDatabase {
  private state: DatabaseState = {
    users: [],
    farms: [],
    farm_profiles: [],
    model_versions: [],
    predictions: [],
    recommendations: [],
    weather_records: [],
    alerts: [],
    audit_logs: [],
    soil_reports: [],
  };

  private initialized = false;

  public async init(): Promise<void> {
    if (this.initialized) return;

    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.state = JSON.parse(raw);
      } catch (err) {
        console.error('Failed to parse existing DB file, reinitializing', err);
        await this.seedDefaults();
      }
    } else {
      await this.seedDefaults();
    }

    // Ensure model versions exist even if previous file lacked them
    if (this.state.model_versions.length === 0) {
      this.seedModelVersions();
    }

    this.initialized = true;
    this.persist();
  }

  private persist(): void {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.state, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error persisting database state', e);
    }
  }

  private async seedDefaults(): Promise<void> {
    const adminPasswordHash = await bcrypt.hash('admin123', 10);
    const farmerPasswordHash = await bcrypt.hash('farmer123', 10);

    const now = new Date().toISOString();

    const adminUser: UserRecord = {
      id: 'usr_admin_001',
      name: 'Dr. Ramesh Kumar (AgriWise Admin)',
      email: 'admin@agriwise.org',
      password_hash: adminPasswordHash,
      role: 'ADMIN',
      preferred_language: 'en',
      created_at: now,
      updated_at: now,
    };

    const demoFarmer: UserRecord = {
      id: 'usr_farmer_001',
      name: 'Venkatesh Rao',
      email: 'farmer@agriwise.org',
      password_hash: farmerPasswordHash,
      role: 'FARMER',
      preferred_language: 'en',
      created_at: now,
      updated_at: now,
    };

    const demoFarm: FarmRecord = {
      id: 'farm_001',
      user_id: demoFarmer.id,
      name: 'Sri Lakshmi Organic Acres',
      location: 'Warangal Rural, Telangana',
      state: 'Telangana',
      district: 'Warangal',
      latitude: 17.9689,
      longitude: 79.5941,
      area_hectares: 2.5,
      created_at: now,
      updated_at: now,
    };

    const demoFarmProfile: FarmProfileRecord = {
      id: 'profile_001',
      farm_id: demoFarm.id,
      soil_type: 'Clay Loam',
      nitrogen: 78.5,
      phosphorus: 42.0,
      potassium: 48.0,
      ph: 6.8,
      soil_moisture: 42.0,
      water_source: 'Borewell & Canal',
      irrigation_type: 'Drip Irrigation',
      last_tested_date: '2026-09-15',
      updated_at: now,
    };

    this.state.users = [adminUser, demoFarmer];
    this.state.farms = [demoFarm];
    this.state.farm_profiles = [demoFarmProfile];
    this.seedModelVersions();

    // Initial alert for the demo farm
    this.state.alerts = [
      {
        id: 'alt_001',
        farm_id: demoFarm.id,
        alert_type: 'WEATHER',
        severity: 'MEDIUM',
        title: 'Moderate Rainfall Forecasted in 48h',
        message: 'Upcoming showers expected (~18mm). Delay scheduled urea top-dressing to prevent leaching.',
        is_active: true,
        created_at: now,
      },
    ];
  }

  private seedModelVersions(): void {
    const now = new Date().toISOString();
    this.state.model_versions = [
      {
        id: 'mod_crop_rf_v2',
        model_name: 'AgriWise Crop Recommendation Classifier',
        model_type: 'CLASSIFIER',
        version: '2.1.0',
        algorithm: 'Calibrated Multi-Output Random Forest Ensemble',
        training_date: '2026-03-15T00:00:00Z',
        dataset_name: 'ICAR-Kaggle Crop Soil-Climate Benchmark (2,200 records, 22 crops)',
        metrics_json: {
          accuracy: 0.9841,
          precision: 0.9825,
          recall: 0.9818,
          f1_score: 0.9821,
          cross_val_folds: 5,
          features: ['N', 'P', 'K', 'pH', 'temperature', 'humidity', 'rainfall'],
        },
        is_active: true,
        created_at: now,
      },
      {
        id: 'mod_yield_reg_v2',
        model_name: 'AgriWise Agronomic Yield Predictor',
        model_type: 'REGRESSOR',
        version: '2.0.4',
        algorithm: 'Gradient-Boosted Multivariable Polynomial Agronomic Regressor',
        training_date: '2026-03-20T00:00:00Z',
        dataset_name: 'Ministry of Agriculture & Farmers Welfare Historical Yields (1997-2025)',
        metrics_json: {
          r2_score: 0.912,
          mae: 0.38,
          rmse: 0.49,
          unit: 'tonnes/hectare',
          features: ['crop', 'soil_type', 'rainfall', 'temperature', 'irrigation_factor', 'nitrogen'],
        },
        is_active: true,
        created_at: now,
      },
      {
        id: 'mod_fert_advisory_v1',
        model_name: 'AgriWise Soil Nutrient-Gap Fertilizer Engine',
        model_type: 'EXPERT_SYSTEM',
        version: '1.4.0',
        algorithm: 'Stoichiometric Soil Nutrient Deficit & Fertilizer Response Function',
        training_date: '2026-02-10T00:00:00Z',
        dataset_name: 'ICAR Soil Health Card Fertilizer Formulation Standards',
        metrics_json: {
          recommendation_fidelity: 0.995,
          supported_nutrients: ['N', 'P', 'K'],
          fertilizers: ['Urea', 'DAP', 'MOP', 'NPK Complex', 'Organic Compost'],
        },
        is_active: true,
        created_at: now,
      },
      {
        id: 'mod_irrig_et0_v1',
        model_name: 'AgriWise FAO-56 Penman-Monteith Irrigation Engine',
        model_type: 'BIOPHYSICAL',
        version: '1.3.2',
        algorithm: 'FAO-56 Dual Crop Evapotranspiration & Soil Moisture Balance',
        training_date: '2026-01-18T00:00:00Z',
        dataset_name: 'FAO Irrigation and Drainage Paper 56 Standards',
        metrics_json: {
          water_balance_accuracy: 0.965,
          factors: ['soil_moisture', 'et0', 'rainfall_forecast', 'crop_kc', 'root_depth'],
        },
        is_active: true,
        created_at: now,
      },
      {
        id: 'mod_disease_micro_v1',
        model_name: 'AgriWise Microclimate Pathogen Risk Evaluator',
        model_type: 'EPIDEMIOLOGICAL',
        version: '1.2.0',
        algorithm: 'Temperature-Relative Humidity Cumulative Infection Index',
        training_date: '2026-02-28T00:00:00Z',
        dataset_name: 'Agricultural Meteorology Fungal & Bacterial Spore Development Database',
        metrics_json: {
          f1_risk_detection: 0.923,
          risk_categories: ['LOW', 'MEDIUM', 'HIGH'],
          pathogen_types: ['Blast', 'Blight', 'Rust', 'Powdery Mildew', 'Root Rot'],
        },
        is_active: true,
        created_at: now,
      },
    ];
  }

  // --- User Repository ---
  public findUserByEmail(email: string): UserRecord | undefined {
    return this.state.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  public findUserById(id: string): UserRecord | undefined {
    return this.state.users.find(u => u.id === id);
  }

  public createUser(user: Omit<UserRecord, 'id' | 'created_at' | 'updated_at'>): UserRecord {
    const now = new Date().toISOString();
    const newUser: UserRecord = {
      ...user,
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      created_at: now,
      updated_at: now,
    };
    this.state.users.push(newUser);
    this.persist();
    return newUser;
  }

  public getAllUsers(): Omit<UserRecord, 'password_hash'>[] {
    return this.state.users.map(({ password_hash, ...rest }) => rest);
  }

  // --- Farm Repository ---
  public getFarmsByUserId(userId: string): (FarmRecord & { profile?: FarmProfileRecord })[] {
    const farms = this.state.farms.filter(f => f.user_id === userId);
    return farms.map(farm => {
      const profile = this.state.farm_profiles.find(p => p.farm_id === farm.id);
      return { ...farm, profile };
    });
  }

  public getFarmById(id: string): (FarmRecord & { profile?: FarmProfileRecord }) | undefined {
    const farm = this.state.farms.find(f => f.id === id);
    if (!farm) return undefined;
    const profile = this.state.farm_profiles.find(p => p.farm_id === farm.id);
    return { ...farm, profile };
  }

  public createFarm(
    farmData: Omit<FarmRecord, 'id' | 'created_at' | 'updated_at'>,
    profileData?: Omit<FarmProfileRecord, 'id' | 'farm_id' | 'updated_at'>
  ): FarmRecord & { profile?: FarmProfileRecord } {
    const now = new Date().toISOString();
    const farmId = `farm_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newFarm: FarmRecord = {
      ...farmData,
      id: farmId,
      created_at: now,
      updated_at: now,
    };
    this.state.farms.push(newFarm);

    let createdProfile: FarmProfileRecord | undefined = undefined;
    if (profileData) {
      createdProfile = {
        ...profileData,
        id: `prof_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        farm_id: farmId,
        updated_at: now,
      };
      this.state.farm_profiles.push(createdProfile);
    }

    this.persist();
    return { ...newFarm, profile: createdProfile };
  }

  public updateFarmProfile(farmId: string, updates: Partial<FarmProfileRecord>): FarmProfileRecord {
    const now = new Date().toISOString();
    let profile = this.state.farm_profiles.find(p => p.farm_id === farmId);
    if (profile) {
      Object.assign(profile, updates, { updated_at: now });
    } else {
      profile = {
        id: `prof_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        farm_id: farmId,
        soil_type: updates.soil_type || 'Loamy',
        nitrogen: updates.nitrogen ?? 50,
        phosphorus: updates.phosphorus ?? 40,
        potassium: updates.potassium ?? 40,
        ph: updates.ph ?? 6.5,
        soil_moisture: updates.soil_moisture ?? 40,
        water_source: updates.water_source || 'Well',
        irrigation_type: updates.irrigation_type || 'Drip',
        last_tested_date: updates.last_tested_date || now.split('T')[0],
        updated_at: now,
      };
      this.state.farm_profiles.push(profile);
    }
    this.persist();
    return profile;
  }

  // --- Prediction & Recommendation Repository ---
  public createPrediction(
    pred: Omit<PredictionRecord, 'id' | 'created_at' | 'status'> & { status?: string }
  ): PredictionRecord {
    const now = new Date().toISOString();
    const newPred: PredictionRecord = {
      ...pred,
      id: `pred_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      status: pred.status || 'COMPLETED',
      created_at: now,
    };
    this.state.predictions.unshift(newPred); // newest first
    this.persist();
    return newPred;
  }

  public createRecommendation(rec: Omit<RecommendationRecord, 'id' | 'created_at'>): RecommendationRecord {
    const now = new Date().toISOString();
    const newRec: RecommendationRecord = {
      ...rec,
      id: `rec_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      created_at: now,
    };
    this.state.recommendations.unshift(newRec);
    this.persist();
    return newRec;
  }

  public getPredictions(filter: { userId?: string; farmId?: string; type?: string; limit?: number }): PredictionRecord[] {
    let list = this.state.predictions;
    if (filter.userId) {
      list = list.filter(p => p.user_id === filter.userId);
    }
    if (filter.farmId) {
      list = list.filter(p => p.farm_id === filter.farmId);
    }
    if (filter.type) {
      list = list.filter(p => p.prediction_type === filter.type);
    }
    if (filter.limit) {
      list = list.slice(0, filter.limit);
    }
    return list;
  }

  public getPredictionById(id: string): PredictionRecord | undefined {
    return this.state.predictions.find(p => p.id === id);
  }

  // --- Weather & Alerts ---
  public addWeatherRecord(weather: Omit<WeatherRecordItem, 'id' | 'recorded_at'>): WeatherRecordItem {
    const record: WeatherRecordItem = {
      ...weather,
      id: `wx_${Date.now()}`,
      recorded_at: new Date().toISOString(),
    };
    this.state.weather_records.unshift(record);
    if (this.state.weather_records.length > 500) {
      this.state.weather_records.pop();
    }
    this.persist();
    return record;
  }

  public getLatestWeather(farmId?: string): WeatherRecordItem | undefined {
    if (farmId) {
      return this.state.weather_records.find(w => w.farm_id === farmId);
    }
    return this.state.weather_records[0];
  }

  public createAlert(alert: Omit<AlertRecord, 'id' | 'created_at'>): AlertRecord {
    const newAlert: AlertRecord = {
      ...alert,
      id: `alt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      created_at: new Date().toISOString(),
    };
    this.state.alerts.unshift(newAlert);
    this.persist();
    return newAlert;
  }

  public getAlerts(farmId?: string): AlertRecord[] {
    if (farmId) {
      return this.state.alerts.filter(a => a.farm_id === farmId && a.is_active);
    }
    return this.state.alerts.filter(a => a.is_active);
  }

  public dismissAlert(alertId: string): boolean {
    const alert = this.state.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.is_active = false;
      this.persist();
      return true;
    }
    return false;
  }

  // --- Model Versions ---
  public getModelVersions(): ModelVersionRecord[] {
    return this.state.model_versions;
  }

  public getModelVersionById(id: string): ModelVersionRecord | undefined {
    return this.state.model_versions.find(m => m.id === id);
  }

  // --- Audit Logs ---
  public logAudit(log: Omit<AuditLogRecord, 'id' | 'created_at'>): void {
    const entry: AuditLogRecord = {
      ...log,
      id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      created_at: new Date().toISOString(),
    };
    this.state.audit_logs.unshift(entry);
    if (this.state.audit_logs.length > 1000) {
      this.state.audit_logs.pop();
    }
    this.persist();
  }

  public getAuditLogs(limit = 100): AuditLogRecord[] {
    return this.state.audit_logs.slice(0, limit);
  }

  // --- User Language ---
  public updateUserLanguage(userId: string, language: 'en' | 'te' | 'hi'): boolean {
    const user = this.state.users.find(u => u.id === userId);
    if (user) {
      user.preferred_language = language;
      user.updated_at = new Date().toISOString();
      this.persist();
      return true;
    }
    return false;
  }

  // --- Soil Reports ---
  public createSoilReport(
    report: Omit<SoilReportRecord, 'id' | 'upload_date' | 'status'> & { status?: 'PENDING_CONFIRMATION' | 'CONFIRMED' }
  ): SoilReportRecord {
    const now = new Date().toISOString();
    const newReport: SoilReportRecord = {
      ...report,
      id: `rep_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      upload_date: now,
      status: report.status || 'PENDING_CONFIRMATION',
    };
    if (!this.state.soil_reports) {
      this.state.soil_reports = [];
    }
    this.state.soil_reports.unshift(newReport);
    this.persist();
    return newReport;
  }

  public getSoilReportById(id: string): SoilReportRecord | undefined {
    return (this.state.soil_reports || []).find(r => r.id === id);
  }

  public getLatestSoilReport(farmId: string): SoilReportRecord | undefined {
    return (this.state.soil_reports || []).find(r => r.farm_id === farmId);
  }

  public getSoilReports(farmId?: string): SoilReportRecord[] {
    const list = this.state.soil_reports || [];
    if (farmId) {
      return list.filter(r => r.farm_id === farmId);
    }
    return list;
  }

  public confirmSoilReport(
    reportId: string,
    confirmedValues: {
      nitrogen: number;
      phosphorus: number;
      potassium: number;
      ph: number;
      soil_moisture?: number;
      organic_carbon?: number;
      electrical_conductivity?: number;
      soil_type: string;
      [key: string]: any;
    },
    corrections?: Record<string, any>
  ): { report: SoilReportRecord; profile: FarmProfileRecord } | null {
    const report = this.getSoilReportById(reportId);
    if (!report) return null;

    const now = new Date().toISOString();
    report.status = 'CONFIRMED';
    report.confirmed_at = now;
    report.confirmed_values = confirmedValues;
    if (corrections) {
      report.corrections = corrections;
    }

    // Automatically update the farm's profile with confirmed soil values
    const profile = this.updateFarmProfile(report.farm_id, {
      nitrogen: confirmedValues.nitrogen,
      phosphorus: confirmedValues.phosphorus,
      potassium: confirmedValues.potassium,
      ph: confirmedValues.ph,
      soil_type: confirmedValues.soil_type || 'Clay Loam',
      soil_moisture: confirmedValues.soil_moisture ?? 40,
      last_tested_date: now.split('T')[0],
    });

    this.persist();
    return { report, profile };
  }

  // --- Admin Analytics ---
  public getSystemAnalytics() {
    return {
      totalUsers: this.state.users.length,
      farmersCount: this.state.users.filter(u => u.role === 'FARMER').length,
      totalFarms: this.state.farms.length,
      totalPredictions: this.state.predictions.length,
      predictionsByType: {
        CROP: this.state.predictions.filter(p => p.prediction_type === 'CROP').length,
        YIELD: this.state.predictions.filter(p => p.prediction_type === 'YIELD').length,
        FERTILIZER: this.state.predictions.filter(p => p.prediction_type === 'FERTILIZER').length,
        IRRIGATION: this.state.predictions.filter(p => p.prediction_type === 'IRRIGATION').length,
        DISEASE: this.state.predictions.filter(p => p.prediction_type === 'DISEASE').length,
        COMPREHENSIVE: this.state.predictions.filter(p => p.prediction_type === 'COMPREHENSIVE').length,
      },
      activeAlertsCount: this.state.alerts.filter(a => a.is_active).length,
      modelsCount: this.state.model_versions.length,
      recentAuditLogs: this.state.audit_logs.slice(0, 10),
    };
  }
}

export const db = new RelationalDatabase();
