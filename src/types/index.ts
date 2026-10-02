// src/types/index.ts

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'FARMER' | 'ADMIN';
  preferred_language: 'en' | 'te' | 'hi';
}

export interface FarmProfile {
  id?: string;
  farm_id?: string;
  soil_type: string;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  ph: number;
  soil_moisture: number;
  water_source: string;
  irrigation_type: string;
  last_tested_date: string;
}

export interface Farm {
  id: string;
  user_id: string;
  name: string;
  location: string;
  state: string;
  district: string;
  latitude: number;
  longitude: number;
  area_hectares: number;
  profile?: FarmProfile;
  created_at: string;
}

export interface CurrentWeather {
  temperature: number;
  humidity: number;
  rainfallMm: number;
  weatherCondition: string;
  windSpeedKmh: number;
  recordedAt: string;
  source: string;
  locationName?: string;
}

export interface WeatherForecastDay {
  date: string;
  maxTemp: number;
  minTemp: number;
  precipitationMm: number;
  condition: string;
}

export interface WeatherAlert {
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  title: string;
  message: string;
  category: 'WEATHER_ALERT' | 'SPRAYING_ADVISORY' | 'FROST_WARNING' | 'HEAT_STRESS';
}

export interface WeatherData {
  current: CurrentWeather;
  forecast: WeatherForecastDay[];
  alerts: WeatherAlert[];
  isLive: boolean;
  cached: boolean;
}

export interface CropCandidate {
  cropKey: string;
  cropName: string;
  probability: number;
  percentageString: string;
  suitability: 'EXCELLENT' | 'GOOD' | 'MODERATE' | 'POOR';
  keyFactors: string[];
}

export interface CropRecommendationResult {
  primaryCrop: CropCandidate;
  alternativeCrops: CropCandidate[];
  modelVersion: string;
  explanation: string;
  technicalDetails: {
    featureScores: Record<string, { actual: number; ideal: number; unit: string; status: string }>;
    temperatureScalingTau: number;
  };
}

export interface YieldPredictionResult {
  cropName: string;
  yieldPerHectare: number;
  unit: string;
  totalEstimatedYield: number;
  totalUnit: string;
  confidenceInterval90: {
    minPerHectare: number;
    maxPerHectare: number;
    minTotal: number;
    maxTotal: number;
    unit: string;
  };
  importantFactors: {
    factor: string;
    impact: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
    description: string;
  }[];
  modelVersion: string;
}

export interface FertilizerPrescription {
  fertilizerName: string;
  nutrientSupplied: string;
  quantityPerHectareKg: number;
  totalQuantityKg: number;
  applicationTiming: string;
  reason: string;
}

export interface FertilizerAdvisoryResult {
  cropName: string;
  soilHealthStatus: {
    nitrogenStatus: 'DEFICIENT' | 'SUFFICIENT' | 'EXCESS';
    phosphorusStatus: 'DEFICIENT' | 'SUFFICIENT' | 'EXCESS';
    potassiumStatus: 'DEFICIENT' | 'SUFFICIENT' | 'EXCESS';
    phAssessment: string;
  };
  recommendedFertilizers: FertilizerPrescription[];
  soilAmendments: string[];
  agronomicReasoning: string;
  safetyWarning: string;
  modelVersion: string;
}

export interface IrrigationAdvisoryResult {
  isIrrigationNeeded: boolean;
  urgency: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  suggestedTiming: string;
  recommendedWaterDepthMm?: number;
  reasoning: string;
  weatherConsideration: string;
  waterSavingTips: string[];
  modelVersion: string;
}

export interface DiseaseRiskResult {
  cropName: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  severityScore: number;
  potentialDiseases: {
    diseaseName: string;
    pathogenType: 'FUNGAL' | 'BACTERIAL' | 'VIRAL';
    favorableConditions: string;
    earlySymptomsToMonitor: string;
  }[];
  contributingFactors: string[];
  recommendedPreventiveActions: string[];
  scientificDisclaimer: string;
  modelVersion: string;
}

export interface ExplanationFactor {
  factor: string;
  importanceWeight: number;
  status: 'OPTIMAL' | 'FAVORABLE' | 'LIMITING' | 'CRITICAL';
  summary: string;
  actualValue: string;
  idealRange: string;
}

export interface PredictionExplanation {
  headline: string;
  primaryReasons: string[];
  limitingFactors: string[];
  factorBreakdown: ExplanationFactor[];
  methodologyNote: string;
}

export interface ComprehensiveAdvisoryData {
  predictionId: string;
  cropRecommendation: CropRecommendationResult;
  yieldPrediction: YieldPredictionResult;
  fertilizerAdvisory: FertilizerAdvisoryResult;
  irrigationAdvisory: IrrigationAdvisoryResult;
  diseaseRisk: DiseaseRiskResult;
  explanation: PredictionExplanation;
  weather: CurrentWeather;
  weatherAlerts: WeatherAlert[];
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

export interface ModelVersion {
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

export interface AdminAnalytics {
  totalUsers: number;
  farmersCount: number;
  totalFarms: number;
  totalPredictions: number;
  predictionsByType: Record<string, number>;
  activeAlertsCount: number;
  modelsCount: number;
  recentAuditLogs: {
    id: string;
    action: string;
    resource: string;
    ip_address: string;
    status: string;
    created_at: string;
    details_json: any;
  }[];
}
