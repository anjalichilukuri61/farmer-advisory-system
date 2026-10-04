// server/routes/api.ts
import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db/index.js';
import { authenticate, requireRole, generateToken, AuthRequest } from '../middleware/auth.js';
import { validateSoilInputs } from '../middleware/error.js';
import { WeatherService } from '../services/weatherService.js';
import { CropRecommendationEngine } from '../../ml/inference/cropRecommender.js';
import { YieldPredictionEngine } from '../../ml/inference/yieldPredictor.js';
import { FertilizerAdvisoryEngine } from '../../ml/inference/fertilizerAdvisor.js';
import { IrrigationAdvisoryEngine } from '../../ml/inference/irrigationAdvisor.js';
import { DiseaseRiskPredictor } from '../../ml/inference/diseaseRiskPredictor.js';
import { ExplainabilityEngine } from '../../ml/inference/explainability.js';
import { DocumentExtractorService } from '../services/documentExtractor.js';
import { ServerTTSService } from '../services/ttsService.js';

export const apiRouter = Router();

// Liveness & System Health (GET /api/health)
apiRouter.get('/health', (req: Request, res: Response) => {
  const models = db.getModelVersions();
  res.json({
    status: 'UP',
    application: 'AgriWise AI-Powered Decision Support System',
    version: '2.1.0',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    database: 'CONNECTED',
    activeModelsCount: models.length,
    environment: process.env.NODE_ENV || 'development',
    memoryUsageMb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
  });
});

// ==========================================
// 0. High-Quality Universal Voice & Audio TTS Route
// Serves native Telugu and English audio streams for any client device
// ==========================================

apiRouter.get('/tts/stream', async (req: Request, res: Response): Promise<void> => {
  try {
    const text = (req.query.text as string) || '';
    const lang = ((req.query.lang as string) === 'en' ? 'en' : 'te') as 'te' | 'en';

    if (!text || text.trim().length === 0) {
      res.status(400).json({ error: 'Text query parameter is required' });
      return;
    }

    const audioBuffer = await ServerTTSService.synthesizeSpeech(text, lang);

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', audioBuffer.length);
    res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
    res.setHeader('Accept-Ranges', 'bytes');
    res.send(audioBuffer);
  } catch (err: any) {
    console.error('Server TTS generation error:', err);
    res.status(500).json({
      error: 'TTS generation failed',
      message: err.message || 'Upstream audio service error',
    });
  }
});

apiRouter.post('/tts/speak', async (req: Request, res: Response): Promise<void> => {
  try {
    const { text, lang = 'te' } = req.body;
    if (!text || !text.trim()) {
      res.status(400).json({ error: 'Text is required' });
      return;
    }

    const targetLang = lang === 'en' ? 'en' : 'te';
    const audioBuffer = await ServerTTSService.synthesizeSpeech(text, targetLang);

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', audioBuffer.length);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(audioBuffer);
  } catch (err: any) {
    console.error('Server TTS generation error:', err);
    res.status(500).json({
      error: 'TTS generation failed',
      message: err.message || 'Upstream audio service error',
    });
  }
});

// ==========================================
// 1. Authentication Routes
// ==========================================

apiRouter.post('/auth/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role = 'FARMER', preferred_language = 'en' } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({
        success: false,
        error: { code: 'INVALID_INPUT', message: 'Name, email, and password are required.' },
      });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({
        success: false,
        error: { code: 'WEAK_PASSWORD', message: 'Password must be at least 6 characters.' },
      });
      return;
    }

    const existing = db.findUserByEmail(email);
    if (existing) {
      res.status(409).json({
        success: false,
        error: { code: 'USER_EXISTS', message: 'An account with this email already exists.' },
      });
      return;
    }

    const password_hash = await bcrypt.hash(password, 10);
    const userRole = role === 'ADMIN' ? 'ADMIN' : 'FARMER';

    const newUser = db.createUser({
      name,
      email,
      password_hash,
      role: userRole,
      preferred_language: preferred_language as any,
    });

    db.logAudit({
      user_id: newUser.id,
      action: 'USER_REGISTER',
      resource: 'User',
      ip_address: req.ip || '127.0.0.1',
      status: 'SUCCESS',
      details_json: { email: newUser.email, role: newUser.role },
    });

    const token = generateToken(newUser);

    res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          preferred_language: newUser.preferred_language,
        },
      },
      message: 'Account registered successfully.',
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: 'REGISTRATION_ERROR', message: err.message } });
  }
});

apiRouter.post('/auth/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        error: { code: 'INVALID_INPUT', message: 'Email and password are required.' },
      });
      return;
    }

    const user = db.findUserByEmail(email);
    if (!user) {
      res.status(401).json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' },
      });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      db.logAudit({
        user_id: user.id,
        action: 'FAILED_LOGIN',
        resource: 'User',
        ip_address: req.ip || '127.0.0.1',
        status: 'FAILED',
        details_json: { email },
      });

      res.status(401).json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' },
      });
      return;
    }

    const token = generateToken(user);

    db.logAudit({
      user_id: user.id,
      action: 'USER_LOGIN',
      resource: 'User',
      ip_address: req.ip || '127.0.0.1',
      status: 'SUCCESS',
      details_json: { email },
    });

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          preferred_language: user.preferred_language,
        },
      },
      message: 'Signed in successfully.',
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: 'LOGIN_ERROR', message: err.message } });
  }
});

apiRouter.get('/auth/me', authenticate, (req: AuthRequest, res: Response): void => {
  const user = db.findUserById(req.user!.id);
  if (!user) {
    res.status(404).json({ success: false, error: { code: 'USER_NOT_FOUND', message: 'User profile not found.' } });
    return;
  }

  res.json({
    success: true,
    data: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      preferred_language: user.preferred_language,
      created_at: user.created_at,
    },
  });
});

apiRouter.put('/users/language', authenticate, (req: AuthRequest, res: Response): void => {
  const { language } = req.body;
  if (!language || !['en', 'te', 'hi'].includes(language)) {
    res.status(400).json({ success: false, error: { code: 'INVALID_LANGUAGE', message: 'Language must be en or te.' } });
    return;
  }
  const updated = db.updateUserLanguage(req.user!.id, language);
  res.json({ success: updated, language });
});

// ==========================================
// 1.5. Soil Test Report Extraction & OCR Routes
// ==========================================

apiRouter.post('/soil-report/extract', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { file_data, file_name, mime_type, farm_id } = req.body;

    if (!file_data && !req.body.sample_preset) {
      res.status(400).json({
        success: false,
        error: { code: 'MISSING_FILE', message: 'Soil test report file or sample card is required.' },
      });
      return;
    }

    const fileName = file_name || (req.body.sample_preset ? `${req.body.sample_preset}_Soil_Health_Card.pdf` : 'soil_health_card.jpg');
    const mimeType = mime_type || (fileName.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg');

    // Run extraction through DocumentExtractorService
    const extractionResult = await DocumentExtractorService.extractFromReport(
      file_data || '',
      mimeType,
      fileName
    );

    // Save initial pending soil report
    const targetFarmId = farm_id || (db.getFarmsByUserId(req.user!.id)[0]?.id || 'farm_default');
    const savedReport = db.createSoilReport({
      farm_id: targetFarmId,
      user_id: req.user!.id,
      file_name: fileName,
      file_type: mimeType,
      extracted_values: {
        nitrogen: extractionResult.nitrogen,
        phosphorus: extractionResult.phosphorus,
        potassium: extractionResult.potassium,
        ph: extractionResult.ph,
        soil_moisture: extractionResult.soil_moisture,
        organic_carbon: extractionResult.organic_carbon,
        electrical_conductivity: extractionResult.electrical_conductivity,
        soil_type: extractionResult.soil_type,
        lab_name: extractionResult.lab_name,
        sample_id: extractionResult.sample_id,
        test_date: extractionResult.test_date,
      },
      status: 'PENDING_CONFIRMATION',
      source: extractionResult.source,
    });

    res.json({
      success: true,
      data: {
        reportId: savedReport.id,
        farmId: targetFarmId,
        fileName,
        extractionResult,
      },
      message: 'Soil report extracted successfully. Please review and confirm parameters.',
    });
  } catch (err: any) {
    console.error('Soil extraction error:', err);
    res.status(500).json({ success: false, error: { code: 'EXTRACTION_ERROR', message: err.message } });
  }
});

apiRouter.post('/soil-report/confirm', authenticate, (req: AuthRequest, res: Response): void => {
  try {
    const { report_id, farm_id, confirmed_values, corrections } = req.body;

    if (!confirmed_values || confirmed_values.nitrogen === undefined || confirmed_values.ph === undefined) {
      res.status(400).json({
        success: false,
        error: { code: 'INVALID_INPUT', message: 'Confirmed nitrogen, phosphorus, potassium, and pH are required.' },
      });
      return;
    }

    let report = report_id ? db.getSoilReportById(report_id) : undefined;
    let targetFarmId = farm_id || report?.farm_id;
    if (!targetFarmId) {
      const userFarms = db.getFarmsByUserId(req.user!.id);
      targetFarmId = userFarms[0]?.id || 'farm_default';
    }

    if (!report) {
      // Create and immediately confirm
      report = db.createSoilReport({
        farm_id: targetFarmId,
        user_id: req.user!.id,
        file_name: 'Confirmed_Soil_Card.pdf',
        file_type: 'application/pdf',
        extracted_values: confirmed_values,
        status: 'PENDING_CONFIRMATION',
        source: 'MANUAL',
      });
    }

    const result = db.confirmSoilReport(report.id, confirmed_values, corrections);
    if (!result) {
      res.status(404).json({ success: false, error: { code: 'REPORT_NOT_FOUND', message: 'Failed to confirm report.' } });
      return;
    }

    db.logAudit({
      user_id: req.user!.id,
      action: 'CONFIRM_SOIL_REPORT',
      resource: 'SoilReport',
      ip_address: req.ip || '127.0.0.1',
      status: 'SUCCESS',
      details_json: { report_id: report.id, farm_id: targetFarmId, confirmed_values },
    });

    res.json({
      success: true,
      data: {
        report: result.report,
        profile: result.profile,
      },
      message: 'Soil profile confirmed and updated across all modules.',
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: 'CONFIRMATION_ERROR', message: err.message } });
  }
});

apiRouter.get('/soil-report/latest/:farmId', authenticate, (req: AuthRequest, res: Response): void => {
  const farmId = req.params.farmId;
  const latestReport = db.getLatestSoilReport(farmId);
  const farm = db.getFarmById(farmId);

  res.json({
    success: true,
    data: {
      hasReport: !!latestReport,
      report: latestReport || null,
      profile: farm?.profile || null,
    },
  });
});

// ==========================================
// 2. Farm Management Routes
// ==========================================

apiRouter.get('/farms', authenticate, (req: AuthRequest, res: Response): void => {
  const farms = db.getFarmsByUserId(req.user!.id);
  res.json({ success: true, data: farms });
});

apiRouter.post('/farms', authenticate, (req: AuthRequest, res: Response): void => {
  try {
    const { name, location, state, district, latitude, longitude, area_hectares, profile } = req.body;

    if (!name || !location) {
      res.status(400).json({
        success: false,
        error: { code: 'INVALID_INPUT', message: 'Farm name and location are required.' },
      });
      return;
    }

    const farm = db.createFarm(
      {
        user_id: req.user!.id,
        name,
        location,
        state: state || 'Telangana',
        district: district || 'Warangal',
        latitude: Number(latitude) || 17.9689,
        longitude: Number(longitude) || 79.5941,
        area_hectares: Number(area_hectares) || 1.0,
      },
      profile
        ? {
            soil_type: profile.soil_type || 'Loamy',
            nitrogen: Number(profile.nitrogen) || 60,
            phosphorus: Number(profile.phosphorus) || 40,
            potassium: Number(profile.potassium) || 40,
            ph: Number(profile.ph) || 6.5,
            soil_moisture: Number(profile.soil_moisture) || 45,
            water_source: profile.water_source || 'Borewell',
            irrigation_type: profile.irrigation_type || 'Drip',
            last_tested_date: profile.last_tested_date || new Date().toISOString().split('T')[0],
          }
        : undefined
    );

    res.status(201).json({ success: true, data: farm, message: 'Farm created successfully.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: 'FARM_CREATE_ERROR', message: err.message } });
  }
});

apiRouter.get('/farms/:id', authenticate, (req: AuthRequest, res: Response): void => {
  const farm = db.getFarmById(req.params.id);
  if (!farm) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Farm not found.' } });
    return;
  }
  if (farm.user_id !== req.user!.id && req.user!.role !== 'ADMIN') {
    res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Unauthorized access to farm.' } });
    return;
  }
  res.json({ success: true, data: farm });
});

apiRouter.put('/farms/:id/profile', authenticate, (req: AuthRequest, res: Response): void => {
  const farm = db.getFarmById(req.params.id);
  if (!farm) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Farm not found.' } });
    return;
  }
  if (farm.user_id !== req.user!.id && req.user!.role !== 'ADMIN') {
    res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Unauthorized access.' } });
    return;
  }

  const validation = validateSoilInputs(req.body);
  if (!validation.isValid) {
    res.status(400).json({ success: false, error: { code: 'VALIDATION_FAILED', message: validation.error } });
    return;
  }

  const updated = db.updateFarmProfile(req.params.id, req.body);
  res.json({ success: true, data: updated, message: 'Farm soil profile updated successfully.' });
});

// ==========================================
// 3. Weather & Alerts Routes
// ==========================================

apiRouter.get('/weather', async (req: Request, res: Response): Promise<void> => {
  const lat = req.query.lat ? parseFloat(req.query.lat as string) : 17.9689;
  const lon = req.query.lon ? parseFloat(req.query.lon as string) : 79.5941;
  const loc = (req.query.location as string) || 'Warangal Region';

  const weather = await WeatherService.getWeatherData(lat, lon, loc);
  res.json({ success: true, data: weather });
});

apiRouter.get('/alerts', authenticate, (req: AuthRequest, res: Response): void => {
  const farmId = req.query.farmId as string;
  const alerts = db.getAlerts(farmId);
  res.json({ success: true, data: alerts });
});

apiRouter.post('/alerts/:id/dismiss', authenticate, (req: AuthRequest, res: Response): void => {
  const dismissed = db.dismissAlert(req.params.id);
  res.json({ success: dismissed });
});

// ==========================================
// 4. ML Prediction & Advisory Endpoints
// ==========================================

// 4.1 Crop Recommendation
apiRouter.post('/predictions/crop', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    console.log('Crop Prediction Request:', req.body);
    const { farm_id, nitrogen, phosphorus, potassium, ph, temperature, humidity, rainfall } = req.body;

    const validation = validateSoilInputs(req.body);
    if (!validation.isValid) {
      console.log('Validation Error:', validation.error);
      res.status(400).json({ success: false, error: { code: 'VALIDATION_FAILED', message: validation.error } });
      return;
    }

    const prediction = CropRecommendationEngine.predict({
      nitrogen: Number(nitrogen),
      phosphorus: Number(phosphorus),
      potassium: Number(potassium),
      ph: Number(ph),
      temperature: Number(temperature),
      humidity: Number(humidity),
      rainfall: Number(rainfall),
    });

    const explanation = ExplainabilityEngine.explainCropDecision(prediction.primaryCrop.cropKey, {
      nitrogen: Number(nitrogen),
      phosphorus: Number(phosphorus),
      potassium: Number(potassium),
      ph: Number(ph),
      temperature: Number(temperature),
      humidity: Number(humidity),
      rainfall: Number(rainfall),
    });

    // Save prediction record to relational DB
    const savedPred = db.createPrediction({
      user_id: req.user!.id,
      farm_id: farm_id || 'farm_default',
      prediction_type: 'CROP',
      model_version_id: 'mod_crop_rf_v2',
      inputs_json: req.body,
      output_json: prediction,
      explanation_json: explanation,
      weather_context_json: { temperature, humidity, rainfall },
      confidence_score: prediction.primaryCrop.probability,
    });

    res.json({
      success: true,
      data: {
        predictionId: savedPred.id,
        result: prediction,
        explanation,
      },
      message: 'Crop recommendation generated successfully.',
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: 'PREDICTION_FAILED', message: err.message } });
  }
});

// 4.2 Crop Yield Prediction
apiRouter.post('/predictions/yield', authenticate, (req: AuthRequest, res: Response): void => {
  try {
    const { farm_id, crop, area_hectares, nitrogen, phosphorus, potassium, ph, temperature, rainfall, soil_type, irrigation_type } = req.body;

    if (!crop) {
      res.status(400).json({ success: false, error: { code: 'MISSING_CROP', message: 'Target crop is required for yield estimation.' } });
      return;
    }

    const yieldResult = YieldPredictionEngine.predict({
      crop,
      area_hectares: Number(area_hectares) || 1.0,
      nitrogen: Number(nitrogen) || 60,
      phosphorus: Number(phosphorus) || 40,
      potassium: Number(potassium) || 40,
      ph: Number(ph) || 6.5,
      temperature: Number(temperature) || 25,
      rainfall: Number(rainfall) || 100,
      soil_type,
      irrigation_type,
    });

    const savedPred = db.createPrediction({
      user_id: req.user!.id,
      farm_id: farm_id || 'farm_default',
      prediction_type: 'YIELD',
      model_version_id: 'mod_yield_reg_v2',
      inputs_json: req.body,
      output_json: yieldResult,
      explanation_json: { importantFactors: yieldResult.importantFactors },
      weather_context_json: { temperature, rainfall },
      confidence_score: 0.912, // R-squared of model
    });

    res.json({
      success: true,
      data: {
        predictionId: savedPred.id,
        result: yieldResult,
      },
      message: 'Yield estimation completed successfully.',
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: 'YIELD_FAILED', message: err.message } });
  }
});

// 4.3 Fertilizer Advisory
apiRouter.post('/predictions/fertilizer', authenticate, (req: AuthRequest, res: Response): void => {
  try {
    const { farm_id, crop, nitrogen, phosphorus, potassium, ph, area_hectares } = req.body;

    if (!crop) {
      res.status(400).json({ success: false, error: { code: 'MISSING_CROP', message: 'Crop is required for fertilizer recommendation.' } });
      return;
    }

    const fertilizerResult = FertilizerAdvisoryEngine.generateAdvisory({
      crop,
      nitrogen: Number(nitrogen) || 60,
      phosphorus: Number(phosphorus) || 40,
      potassium: Number(potassium) || 40,
      ph: Number(ph) || 6.5,
      area_hectares: Number(area_hectares) || 1.0,
    });

    const savedPred = db.createPrediction({
      user_id: req.user!.id,
      farm_id: farm_id || 'farm_default',
      prediction_type: 'FERTILIZER',
      model_version_id: 'mod_fert_advisory_v1',
      inputs_json: req.body,
      output_json: fertilizerResult,
      explanation_json: { reasoning: fertilizerResult.agronomicReasoning },
      weather_context_json: null,
      confidence_score: 0.995,
    });

    // Create formal recommendation record
    db.createRecommendation({
      prediction_id: savedPred.id,
      user_id: req.user!.id,
      farm_id: farm_id || 'farm_default',
      title: `Nutrient Management for ${fertilizerResult.cropName}`,
      category: 'FERTILIZER',
      action_items_json: fertilizerResult.recommendedFertilizers.map(f => `${f.fertilizerName}: ${f.quantityPerHectareKg} kg/ha (${f.applicationTiming})`),
      reasoning: fertilizerResult.agronomicReasoning,
      urgency: 'MEDIUM',
    });

    res.json({
      success: true,
      data: {
        predictionId: savedPred.id,
        result: fertilizerResult,
      },
      message: 'Fertilizer recommendation calculated successfully.',
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: 'FERTILIZER_FAILED', message: err.message } });
  }
});

// 4.4 Irrigation Advisory
apiRouter.post('/predictions/irrigation', authenticate, (req: AuthRequest, res: Response): void => {
  try {
    const { farm_id, crop, soil_moisture_percentage, temperature, humidity, forecast_rainfall_next_48h_mm } = req.body;

    const irrigationResult = IrrigationAdvisoryEngine.evaluate({
      crop: crop || 'General Crop',
      soil_moisture_percentage: Number(soil_moisture_percentage) || 40,
      temperature: Number(temperature) || 28,
      humidity: Number(humidity) || 65,
      forecast_rainfall_next_48h_mm: Number(forecast_rainfall_next_48h_mm) || 0,
    });

    const savedPred = db.createPrediction({
      user_id: req.user!.id,
      farm_id: farm_id || 'farm_default',
      prediction_type: 'IRRIGATION',
      model_version_id: 'mod_irrig_et0_v1',
      inputs_json: req.body,
      output_json: irrigationResult,
      explanation_json: { reasoning: irrigationResult.reasoning, weatherConsideration: irrigationResult.weatherConsideration },
      weather_context_json: { temperature, humidity, forecastRain: forecast_rainfall_next_48h_mm },
      confidence_score: 0.965,
    });

    res.json({
      success: true,
      data: {
        predictionId: savedPred.id,
        result: irrigationResult,
      },
      message: 'Irrigation recommendation evaluated successfully.',
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: 'IRRIGATION_FAILED', message: err.message } });
  }
});

// 4.5 Disease Risk Assessment
apiRouter.post('/predictions/disease', authenticate, (req: AuthRequest, res: Response): void => {
  try {
    const { farm_id, crop, temperature, humidity, rainfall } = req.body;

    const diseaseResult = DiseaseRiskPredictor.evaluate({
      crop: crop || 'Rice',
      temperature: Number(temperature) || 28,
      humidity: Number(humidity) || 75,
      rainfall: Number(rainfall) || 50,
    });

    const savedPred = db.createPrediction({
      user_id: req.user!.id,
      farm_id: farm_id || 'farm_default',
      prediction_type: 'DISEASE',
      model_version_id: 'mod_disease_micro_v1',
      inputs_json: req.body,
      output_json: diseaseResult,
      explanation_json: { contributingFactors: diseaseResult.contributingFactors },
      weather_context_json: { temperature, humidity, rainfall },
      confidence_score: 0.923,
    });

    res.json({
      success: true,
      data: {
        predictionId: savedPred.id,
        result: diseaseResult,
      },
      message: 'Microclimate disease risk evaluated successfully.',
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: 'DISEASE_FAILED', message: err.message } });
  }
});

// 4.6 Unified Full-Farm Comprehensive Assessment
// Executes all 5 scientific models in one coordinated pass for maximum farmer convenience
apiRouter.post('/predictions/comprehensive', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      farm_id,
      nitrogen,
      phosphorus,
      potassium,
      ph,
      soil_moisture,
      soil_type = 'Clay Loam',
      farm_area = 1.0,
      custom_temperature,
      custom_humidity,
      custom_rainfall,
      current_crop,
    } = req.body;

    // 1. Get farm coordinates or default
    const farm = farm_id ? db.getFarmById(farm_id) : undefined;
    const lat = farm ? farm.latitude : 17.9689;
    const lon = farm ? farm.longitude : 79.5941;

    // 2. Fetch real weather
    const weather = await WeatherService.getWeatherData(lat, lon, farm ? farm.location : 'Farm Region');

    const temp = custom_temperature !== undefined ? Number(custom_temperature) : weather.current.temperature;
    const hum = custom_humidity !== undefined ? Number(custom_humidity) : weather.current.humidity;
    const rain = custom_rainfall !== undefined ? Number(custom_rainfall) : weather.current.rainfallMm;
    const upcomingRain48h = weather.forecast.slice(0, 2).reduce((s, d) => s + d.precipitationMm, 0);

    // 3. Crop Recommendation
    const cropRec = CropRecommendationEngine.predict({
      nitrogen: Number(nitrogen),
      phosphorus: Number(phosphorus),
      potassium: Number(potassium),
      ph: Number(ph),
      temperature: temp,
      humidity: hum,
      rainfall: rain > 0 ? rain : 120, // default seasonal reference if daily rain is zero
      soil_type,
    });

    const chosenCrop = current_crop || cropRec.primaryCrop.cropName;

    // 4. Yield Prediction
    const yieldRec = YieldPredictionEngine.predict({
      crop: chosenCrop,
      soil_type,
      area_hectares: Number(farm_area) || 1.0,
      nitrogen: Number(nitrogen),
      phosphorus: Number(phosphorus),
      potassium: Number(potassium),
      ph: Number(ph),
      temperature: temp,
      rainfall: rain > 0 ? rain : 120,
    });

    // 5. Fertilizer Advisory
    const fertRec = FertilizerAdvisoryEngine.generateAdvisory({
      crop: chosenCrop,
      nitrogen: Number(nitrogen),
      phosphorus: Number(phosphorus),
      potassium: Number(potassium),
      ph: Number(ph),
      area_hectares: Number(farm_area) || 1.0,
    });

    // 6. Irrigation Advisory
    const irrigRec = IrrigationAdvisoryEngine.evaluate({
      crop: chosenCrop,
      soil_moisture_percentage: Number(soil_moisture) || 40,
      temperature: temp,
      humidity: hum,
      forecast_rainfall_next_48h_mm: upcomingRain48h,
    });

    // 7. Disease Risk Evaluation
    const diseaseRec = DiseaseRiskPredictor.evaluate({
      crop: chosenCrop,
      temperature: temp,
      humidity: hum,
      rainfall: rain,
    });

    // 8. Explainability
    const explanation = ExplainabilityEngine.explainCropDecision(cropRec.primaryCrop.cropKey, {
      nitrogen: Number(nitrogen),
      phosphorus: Number(phosphorus),
      potassium: Number(potassium),
      ph: Number(ph),
      temperature: temp,
      humidity: hum,
      rainfall: rain > 0 ? rain : 120,
    });

    // Save Comprehensive Prediction Record
    const savedPred = db.createPrediction({
      user_id: req.user!.id,
      farm_id: farm_id || 'farm_default',
      prediction_type: 'COMPREHENSIVE',
      model_version_id: 'mod_crop_rf_v2',
      inputs_json: { ...req.body, resolved_weather: { temp, hum, rain, upcomingRain48h } },
      output_json: {
        cropRecommendation: cropRec,
        yieldPrediction: yieldRec,
        fertilizerAdvisory: fertRec,
        irrigationAdvisory: irrigRec,
        diseaseRisk: diseaseRec,
      },
      explanation_json: explanation,
      weather_context_json: weather.current,
      confidence_score: cropRec.primaryCrop.probability,
    });

    res.json({
      success: true,
      data: {
        predictionId: savedPred.id,
        cropRecommendation: cropRec,
        yieldPrediction: yieldRec,
        fertilizerAdvisory: fertRec,
        irrigationAdvisory: irrigRec,
        diseaseRisk: diseaseRec,
        explanation,
        weather: weather.current,
        weatherAlerts: weather.alerts,
      },
      message: 'Comprehensive agricultural advisory generated successfully.',
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: 'COMPREHENSIVE_FAILED', message: err.message } });
  }
});

// ==========================================
// 5. Prediction History
// ==========================================

apiRouter.get('/predictions', authenticate, (req: AuthRequest, res: Response): void => {
  const filter = {
    userId: req.user!.role === 'ADMIN' ? undefined : req.user!.id,
    farmId: req.query.farmId as string,
    type: req.query.type as string,
    limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 50,
  };
  const list = db.getPredictions(filter);
  res.json({ success: true, data: list });
});

apiRouter.get('/predictions/:id', authenticate, (req: AuthRequest, res: Response): void => {
  const pred = db.getPredictionById(req.params.id);
  if (!pred) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Prediction record not found.' } });
    return;
  }
  if (pred.user_id !== req.user!.id && req.user!.role !== 'ADMIN') {
    res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Unauthorized access.' } });
    return;
  }
  res.json({ success: true, data: pred });
});

// ==========================================
// 6. Admin & Model Management
// ==========================================

apiRouter.get('/admin/analytics', authenticate, requireRole('ADMIN'), (req: AuthRequest, res: Response): void => {
  const stats = db.getSystemAnalytics();
  res.json({ success: true, data: stats });
});

apiRouter.get('/admin/models', authenticate, requireRole('ADMIN'), (req: AuthRequest, res: Response): void => {
  const models = db.getModelVersions();
  res.json({ success: true, data: models });
});

apiRouter.get('/admin/audit-logs', authenticate, requireRole('ADMIN'), (req: AuthRequest, res: Response): void => {
  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 100;
  const logs = db.getAuditLogs(limit);
  res.json({ success: true, data: logs });
});

apiRouter.get('/admin/users', authenticate, requireRole('ADMIN'), (req: AuthRequest, res: Response): void => {
  const users = db.getAllUsers();
  res.json({ success: true, data: users });
});
