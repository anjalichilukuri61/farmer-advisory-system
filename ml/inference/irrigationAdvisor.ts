// ml/inference/irrigationAdvisor.ts
import fs from 'fs';
import path from 'path';

export interface IrrigationInput {
  crop: string;
  soil_moisture_percentage: number;
  temperature: number;
  humidity: number;
  forecast_rainfall_next_48h_mm?: number;
  water_availability?: 'ABUNDANT' | 'ADEQUATE' | 'SCARCE' | 'CRITICAL';
  irrigation_type?: string;
  soil_type?: string;
}

export interface IrrigationAdvisoryResult {
  isIrrigationNeeded: boolean;
  urgency: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  suggestedTiming: string;
  recommendedWaterDepthMm?: number; // FAO-56 estimated water depth replenishment
  reasoning: string;
  weatherConsideration: string;
  waterSavingTips: string[];
  modelVersion: string;
}

const BENCHMARK_PATH = path.resolve(process.cwd(), 'ml/models/crop_dataset_benchmark.json');
let benchmarkData: any = null;

try {
  benchmarkData = JSON.parse(fs.readFileSync(BENCHMARK_PATH, 'utf-8'));
} catch (e) {}

export class IrrigationAdvisoryEngine {
  public static readonly VERSION = '1.3.2';

  public static evaluate(input: IrrigationInput): IrrigationAdvisoryResult {
    const crops = benchmarkData?.crops || {};
    const cropKey = input.crop.toLowerCase().replace(/[^a-z]/g, '');
    const matchedKey = Object.keys(crops).find(k => cropKey.includes(k) || k.includes(cropKey)) || 'rice';
    const cropMeta = crops[matchedKey] || {
      name: input.crop,
      water_demand: 'MEDIUM',
      kc_peak: 1.0,
    };

    const moisture = input.soil_moisture_percentage;
    const forecastRain = input.forecast_rainfall_next_48h_mm || 0;
    const temp = input.temperature;
    const humidity = input.humidity;

    // Atmospheric evaporative demand approximation (Hargreaves-Samani / FAO-56 simplified ET0)
    // High temp + low humidity = very high daily transpiration rate
    const dailyET0 = Math.max(2.0, (0.0023 * (temp + 17.8) * Math.sqrt(Math.max(5, 35 - humidity / 3.0))));
    const cropET = dailyET0 * (cropMeta.kc_peak || 1.0);

    // Soil moisture thresholds:
    // Field Capacity ~ 40-50%
    // Management Allowed Depletion (MAD) trigger point ~ 30-35%
    // Wilting danger point < 20%
    let isIrrigationNeeded = false;
    let urgency: IrrigationAdvisoryResult['urgency'] = 'NONE';
    let suggestedTiming = 'No irrigation required currently.';
    let reasoning = '';
    let weatherConsideration = '';
    let recommendedWaterDepthMm: number | undefined = undefined;

    // Check upcoming weather forecast first
    const significantRainExpected = forecastRain >= 12.0;

    if (moisture > 55) {
      isIrrigationNeeded = false;
      urgency = 'NONE';
      suggestedTiming = 'Monitor soil; avoid excess irrigation.';
      reasoning = `Current soil moisture (${moisture}%) is near or exceeding field capacity. Additional water risks root asphyxiation, nutrient leaching, and fungal proliferation.`;
      weatherConsideration = significantRainExpected
        ? `Upcoming forecast predicts ${forecastRain} mm of rain. Ensure field drainage channels are clear to prevent waterlogging.`
        : 'Weather conditions do not indicate acute moisture stress.';
    } else if (moisture >= 38) {
      if (significantRainExpected) {
        isIrrigationNeeded = false;
        urgency = 'LOW';
        suggestedTiming = 'Hold off on irrigation. Await forecasted precipitation.';
        reasoning = `Soil moisture (${moisture}%) is currently satisfactory. Because ${forecastRain} mm of rainfall is expected in the next 48 hours, supplemental irrigation should be deferred to conserve water and energy.`;
        weatherConsideration = `Forecast: ${forecastRain} mm precipitation expected within 48 hours. Rain will naturally recharge soil moisture.`;
      } else {
        isIrrigationNeeded = false;
        urgency = 'LOW';
        suggestedTiming = 'Plan light watering within next 2-3 days if no rain occurs.';
        reasoning = `Soil moisture (${moisture}%) remains above the management depletion threshold. Daily crop evapotranspiration is approx. ${cropET.toFixed(1)} mm/day.`;
        weatherConsideration = 'No significant rain in immediate forecast. Keep irrigation lines primed.';
      }
    } else if (moisture >= 25) {
      if (significantRainExpected && forecastRain >= 20) {
        isIrrigationNeeded = false;
        urgency = 'MEDIUM';
        suggestedTiming = 'Hold off temporarily for 24 hours to monitor rain arrival.';
        reasoning = `Soil moisture is depleting (${moisture}%), but a substantial storm system (${forecastRain} mm) is imminent. Delaying irrigation prevents unnecessary pumping costs.`;
        weatherConsideration = `Forecast indicates heavy showers (${forecastRain} mm). If rain does not arrive within 24h, irrigate immediately.`;
      } else {
        isIrrigationNeeded = true;
        urgency = 'MEDIUM';
        suggestedTiming = 'Early morning (05:00 - 08:00) or late evening (17:00 - 19:30).';
        recommendedWaterDepthMm = Math.round(Math.max(15, (45 - moisture) * 0.8));
        reasoning = `Soil moisture has dropped to ${moisture}%, entering the allowable depletion zone. Irrigating now prevents moisture stress during critical vegetative and reproductive stages.`;
        weatherConsideration = forecastRain > 0
          ? `Only light drizzle (${forecastRain} mm) predicted, which is insufficient to replenish root-zone depletion.`
          : 'Clear skies and dry air will accelerate evapotranspiration.';
      }
    } else {
      // Acute moisture stress
      isIrrigationNeeded = true;
      urgency = moisture < 18 ? 'CRITICAL' : 'HIGH';
      suggestedTiming = 'Immediate irrigation recommended within 6-12 hours.';
      recommendedWaterDepthMm = Math.round(Math.max(25, (45 - moisture) * 0.9));
      reasoning = `Critical moisture deficit (${moisture}%). Soil is approaching the permanent wilting point. Severe yield penalty and crop stress will occur without immediate replenishment.`;
      weatherConsideration = significantRainExpected
        ? `Although ${forecastRain} mm of rain is forecasted, existing soil dryness requires an immediate buffer irrigation.`
        : 'High temperature and dry winds are aggravating crop stress.';
    }

    const waterSavingTips = [
      'Apply water during early morning or evening hours to minimize evaporative losses by up to 25%.',
      'Use drip or micro-sprinkler systems if available to direct moisture straight to the active root zone.',
      'Maintain organic mulch or crop residue cover to reduce soil surface evaporation.',
    ];

    return {
      isIrrigationNeeded,
      urgency,
      suggestedTiming,
      recommendedWaterDepthMm,
      reasoning,
      weatherConsideration,
      waterSavingTips,
      modelVersion: IrrigationAdvisoryEngine.VERSION,
    };
  }
}
