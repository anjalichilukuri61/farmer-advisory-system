// tests/api_ml.test.ts
import { CropRecommendationEngine } from '../ml/inference/cropRecommender.js';
import { YieldPredictionEngine } from '../ml/inference/yieldPredictor.js';
import { FertilizerAdvisoryEngine } from '../ml/inference/fertilizerAdvisor.js';
import { IrrigationAdvisoryEngine } from '../ml/inference/irrigationAdvisor.js';
import { DiseaseRiskPredictor } from '../ml/inference/diseaseRiskPredictor.js';
import { ExplainabilityEngine } from '../ml/inference/explainability.js';
import { validateSoilInputs } from '../server/middleware/error.js';
import { DocumentExtractorService } from '../server/services/documentExtractor.js';
import { db } from '../server/db/index.js';
import { translations } from '../src/i18n/translations.js';

async function runTests() {
  console.log('--- Starting AgriWise Scientific & ML Automated Tests ---');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`✓ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`✗ FAIL: ${testName}`);
      failed++;
    }
  }

  // Initialize in-memory DB
  await db.init();

  // Test 1: Crop Recommendation Probability and Sum of Multi-Class Likelihood
  try {
    const res = CropRecommendationEngine.predict({
      nitrogen: 82,
      phosphorus: 46,
      potassium: 39,
      ph: 6.4,
      temperature: 24.5,
      humidity: 81,
      rainfall: 230,
    });
    assert(res.primaryCrop.cropKey === 'rice', 'Crop Recommendation identifies Rice for high water and high humidity profile');
    assert(res.primaryCrop.probability > 0.15, 'Calibrated probability is meaningful and non-zero');
    assert(res.alternativeCrops.length > 0, 'Generates valid alternative crops');
    assert(res.technicalDetails.temperatureScalingTau === 4.2, 'Temperature scaling parameter is applied');
  } catch (e) {
    assert(false, `Crop Recommendation Test failed: ${e}`);
  }

  // Test 2: Crop Yield Prediction & 90% Statistical Prediction Interval
  try {
    const res = YieldPredictionEngine.predict({
      crop: 'rice',
      area_hectares: 2.5,
      nitrogen: 80,
      phosphorus: 48,
      potassium: 40,
      ph: 6.5,
      temperature: 24,
      rainfall: 220,
    });
    assert(res.yieldPerHectare > 2.0 && res.yieldPerHectare < 6.0, 'Yield per hectare falls within realistic agronomic bounds');
    assert(res.totalEstimatedYield > res.yieldPerHectare, 'Total yield scales with farm area');
    assert(res.confidenceInterval90.minPerHectare < res.yieldPerHectare, 'Lower confidence bound is mathematically below estimate');
    assert(res.confidenceInterval90.maxPerHectare > res.yieldPerHectare, 'Upper confidence bound is mathematically above estimate');
  } catch (e) {
    assert(false, `Yield Prediction Test failed: ${e}`);
  }

  // Test 3: Fertilizer Stoichiometric Nutrient Deficit Calculation
  try {
    const res = FertilizerAdvisoryEngine.generateAdvisory({
      crop: 'rice',
      nitrogen: 30, // severe deficit compared to target ~80
      phosphorus: 20, // deficit compared to ~48
      potassium: 20,
      ph: 6.5,
      area_hectares: 1.0,
    });
    const hasUrea = res.recommendedFertilizers.some(f => f.fertilizerName.includes('Urea'));
    const hasDap = res.recommendedFertilizers.some(f => f.fertilizerName.includes('DAP'));
    assert(hasUrea && hasDap, 'Prescribes both DAP and Urea to satisfy P and N deficits');
    assert(res.soilHealthStatus.nitrogenStatus === 'DEFICIENT', 'Accurately diagnoses Nitrogen deficiency');
  } catch (e) {
    assert(false, `Fertilizer Advisory Test failed: ${e}`);
  }

  // Test 4: Irrigation Recommendation Weather Forecast Integration
  try {
    const resWithoutRain = IrrigationAdvisoryEngine.evaluate({
      crop: 'rice',
      soil_moisture_percentage: 28,
      temperature: 32,
      humidity: 45,
      forecast_rainfall_next_48h_mm: 0,
    });
    assert(resWithoutRain.isIrrigationNeeded === true, 'Triggers irrigation when soil moisture is 28% and zero rain is forecast');

    const resWithHeavyRain = IrrigationAdvisoryEngine.evaluate({
      crop: 'rice',
      soil_moisture_percentage: 28,
      temperature: 32,
      humidity: 45,
      forecast_rainfall_next_48h_mm: 35,
    });
    assert(resWithHeavyRain.isIrrigationNeeded === false, 'Defers irrigation when heavy rain (35mm) is forecasted within 48 hours');
  } catch (e) {
    assert(false, `Irrigation Advisor Test failed: ${e}`);
  }

  // Test 5: Disease Risk Predictor Microclimate Inoculum Assessment
  try {
    const highRisk = DiseaseRiskPredictor.evaluate({
      crop: 'rice',
      temperature: 25,
      humidity: 92,
      rainfall: 140,
    });
    assert(highRisk.riskLevel === 'HIGH', 'Flags HIGH pathogen risk under warm, humid (>90%) wet microclimate');
    assert(highRisk.potentialDiseases.length > 0, 'Identifies specific susceptible crop diseases');
  } catch (e) {
    assert(false, `Disease Risk Test failed: ${e}`);
  }

  // Test 6: Explainability Engine
  try {
    const exp = ExplainabilityEngine.explainCropDecision('rice', {
      nitrogen: 80,
      phosphorus: 48,
      potassium: 40,
      ph: 6.5,
      temperature: 24,
      humidity: 82,
      rainfall: 236,
    });
    assert(exp.factorBreakdown.length === 7, 'Decomposes all 7 agronomic and climate parameters');
    assert(exp.primaryReasons.length > 0, 'Provides human-readable reasons for farmers');
  } catch (e) {
    assert(false, `Explainability Test failed: ${e}`);
  }

  // Test 7: Input Validation Boundaries
  try {
    const valid = validateSoilInputs({ nitrogen: 80, ph: 6.5, rainfall: 100 });
    const invalidPh = validateSoilInputs({ ph: 14.5 });
    const invalidN = validateSoilInputs({ nitrogen: -10 });
    assert(valid.isValid === true, 'Accepts valid soil parameters');
    assert(invalidPh.isValid === false, 'Rejects pH > 10.0');
    assert(invalidN.isValid === false, 'Rejects negative nitrogen values');
  } catch (e) {
    assert(false, `Validation Test failed: ${e}`);
  }

  // Test 8: Document Extraction & Soil Report Pipeline
  try {
    const extraction = await DocumentExtractorService.extractFromReport(
      'dGVzdF9zb2lsX2hlYWx0aF9jYXJkX2RhdGE=',
      'application/pdf',
      'Warangal_Soil_Health_Card.pdf'
    );
    assert(extraction.nitrogen !== undefined && extraction.nitrogen > 0, 'Extracts Nitrogen from soil report');
    assert(extraction.phosphorus !== undefined && extraction.phosphorus > 0, 'Extracts Phosphorus from soil report');
    assert(extraction.potassium !== undefined && extraction.potassium > 0, 'Extracts Potassium from soil report');
    assert(extraction.ph !== undefined && extraction.ph >= 4 && extraction.ph <= 9, 'Extracts valid pH from soil report');
    assert(extraction.extractedParameters.length >= 7, 'Decomposes full soil health card parameters');
  } catch (e) {
    assert(false, `Document Extraction Test failed: ${e}`);
  }

  // Test 9: Soil Report Confirmation & Reusable Profile Update
  try {
    const testReport = db.createSoilReport({
      farm_id: 'farm_001',
      user_id: 'usr_farmer_001',
      file_name: 'Lab_Report_2026.pdf',
      file_type: 'application/pdf',
      extracted_values: { nitrogen: 245, phosphorus: 18, potassium: 210, ph: 6.8 },
      status: 'PENDING_CONFIRMATION',
      source: 'OCR_PARSER',
    });

    const confirmed = db.confirmSoilReport(testReport.id, {
      nitrogen: 245,
      phosphorus: 18,
      potassium: 210,
      ph: 6.8,
      soil_type: 'Clay Loam',
      soil_moisture: 42,
    });

    assert(confirmed !== null, 'Successfully confirms soil report in database');
    assert(confirmed?.profile.nitrogen === 245, 'Automatically populates farm profile with confirmed Nitrogen');
    assert(confirmed?.profile.ph === 6.8, 'Automatically populates farm profile with confirmed pH');
    assert(testReport.status === 'CONFIRMED', 'Report status transitions to CONFIRMED');
  } catch (e) {
    assert(false, `Soil Report Confirmation Test failed: ${e}`);
  }

  // Test 10: Complete Language Switching & Telugu Translation Coverage
  try {
    const en = translations.en;
    const te = translations.te;

    assert(!!te.nav.crop && te.nav.crop.includes('పంట సిఫార్సు'), 'Telugu navigation contains complete crop recommendation label');
    assert(!!te.nav.yield && te.nav.yield.includes('దిగుబడి అంచనా'), 'Telugu navigation contains complete yield prediction label');
    assert(!!te.nav.fertilizer && te.nav.fertilizer.includes('ఎరువుల సిఫార్సు'), 'Telugu navigation contains complete fertilizer recommendation label');
    assert(!!te.nav.irrigation && te.nav.irrigation.includes('నీటిపారుదల సిఫార్సు'), 'Telugu navigation contains complete irrigation recommendation label');
    assert(!!te.nav.disease && te.nav.disease.includes('తెగుళ్ల ప్రమాదం'), 'Telugu navigation contains complete disease risk label');
    assert(!!te.nav.weather && te.nav.weather.includes('వాతావరణం'), 'Telugu navigation contains complete weather label');
    assert(!!te.soilReport.confirmBtn && te.soilReport.confirmBtn.includes('ధృవీకరించి'), 'Telugu soil report confirmation button is translated');
    assert(!!te.voice.teluguUnavailable && te.voice.teluguUnavailable.includes('తెలుగు వాయిస్'), 'Telugu missing voice message is present in dictionary');
  } catch (e) {
    assert(false, `Translation Coverage Test failed: ${e}`);
  }

  // Test 11: Server-Side Universal Telugu TTS Generation
  try {
    const { ServerTTSService } = await import('../server/services/ttsService.js');
    const chunks = ServerTTSService.splitIntoSpeechChunks('వరి పంటను మీ నేలలోని నత్రజని ఆధారంగా సిఫార్సు చేస్తున్నాము. నీటిపారుదల సకాలంలో అందించండి.', 60);
    assert(chunks.length >= 2, 'TTS service properly chunks long Telugu text for smooth audio synthesis');

    const audioBuffer = await ServerTTSService.synthesizeSpeech('నమస్కారం రైతు సోదరులారా', 'te');
    assert(audioBuffer.length > 1000, 'Universal Telugu TTS synthesizes valid non-empty MP3 audio buffer');
  } catch (e) {
    assert(false, `Server TTS Test failed: ${e}`);
  }

  console.log(`\nTests Completed: ${passed} passed, ${failed} failed.`);
  if (failed > 0) process.exit(1);
}

runTests();
