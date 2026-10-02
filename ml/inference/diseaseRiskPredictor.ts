// ml/inference/diseaseRiskPredictor.ts
import fs from 'fs';
import path from 'path';

export interface DiseaseRiskInput {
  crop: string;
  temperature: number;
  humidity: number;
  rainfall: number;
  soil_moisture?: number;
  canopy_wetness_hours?: number;
}

export interface DiseaseRiskResult {
  cropName: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  severityScore: number; // 0 - 100
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

const BENCHMARK_PATH = path.resolve(process.cwd(), 'ml/models/crop_dataset_benchmark.json');
let benchmarkData: any = null;

try {
  benchmarkData = JSON.parse(fs.readFileSync(BENCHMARK_PATH, 'utf-8'));
} catch (e) {}

export class DiseaseRiskPredictor {
  public static readonly VERSION = '1.2.0';

  public static evaluate(input: DiseaseRiskInput): DiseaseRiskResult {
    const crops = benchmarkData?.crops || {};
    const cropKey = input.crop.toLowerCase().replace(/[^a-z]/g, '');
    const matchedKey = Object.keys(crops).find(k => cropKey.includes(k) || k.includes(cropKey)) || 'rice';
    const cropMeta = crops[matchedKey] || {
      name: input.crop,
      susceptible_diseases: ['Leaf Blight', 'Root Rot', 'Powdery Mildew'],
    };

    const temp = input.temperature;
    const hum = input.humidity;
    const rain = input.rainfall;

    let score = 15; // baseline environmental risk
    const contributingFactors: string[] = [];

    // Fungal spore germination index (optimum 20°C - 30°C + relative humidity > 80%)
    if (hum >= 85) {
      score += 35;
      contributingFactors.push(`High relative humidity (${hum}%) creates continuous leaf surface moisture conducive to fungal spore germination.`);
    } else if (hum >= 75) {
      score += 20;
      contributingFactors.push(`Moderate-to-high humidity (${hum}%) sustains microclimate moisture pockets within crop canopy.`);
    }

    if (temp >= 20 && temp <= 30) {
      score += 25;
      contributingFactors.push(`Canopy temperature (${temp}°C) aligns directly with the optimal metabolic incubation window for foliar pathogens.`);
    } else if (temp > 35) {
      score -= 10;
      contributingFactors.push('Extreme high temperature (>35°C) inhibits many common fungal spore germination cycles.');
    }

    if (rain > 120) {
      score += 20;
      contributingFactors.push(`Prolonged or heavy rainfall (${rain} mm) increases soil splash dispersal and leaves stagnant water films on foliage.`);
    } else if (rain > 60) {
      score += 10;
      contributingFactors.push(`Recent precipitation (${rain} mm) keeps lower leaves wet.`);
    }

    const severityScore = Math.min(100, Math.max(5, score));
    let riskLevel: DiseaseRiskResult['riskLevel'] = 'LOW';
    if (severityScore >= 65) riskLevel = 'HIGH';
    else if (severityScore >= 40) riskLevel = 'MEDIUM';

    // Populate disease profiles for this specific crop
    const potentialDiseases = (cropMeta.susceptible_diseases || []).map((name: string) => {
      let pathogenType: 'FUNGAL' | 'BACTERIAL' | 'VIRAL' = 'FUNGAL';
      let favorable = 'High humidity (>80%) and temperatures between 22°C - 28°C.';
      let symptoms = 'Small water-soaked or necrotic spots on lower leaves and stems.';

      if (name.toLowerCase().includes('bacterial') || name.toLowerCase().includes('canker') || name.toLowerCase().includes('xanthomonas')) {
        pathogenType = 'BACTERIAL';
        favorable = 'Warm, wet weather with wind-driven rain creating leaf abrasions.';
        symptoms = 'Translucent water-soaked streaks with bacterial ooze under humid mornings.';
      } else if (name.toLowerCase().includes('virus') || name.toLowerCase().includes('mosaic')) {
        pathogenType = 'VIRAL';
        favorable = 'High whitefly or aphid vector activity during dry, warm spells.';
        symptoms = 'Mottled chlorotic patches, leaf curling, and stunted apical shoots.';
      } else if (name.toLowerCase().includes('rust')) {
        pathogenType = 'FUNGAL';
        favorable = 'Cool nights with heavy dew followed by mild warm days (18-24°C).';
        symptoms = 'Pustules of reddish-brown or powdery spores on leaf surfaces.';
      } else if (name.toLowerCase().includes('mildew')) {
        pathogenType = 'FUNGAL';
        favorable = 'High relative humidity at night coupled with dry warm day canopy.';
        symptoms = 'White or grey powdery patches on upper leaf surfaces.';
      }

      return {
        diseaseName: name,
        pathogenType,
        favorableConditions: favorable,
        earlySymptomsToMonitor: symptoms,
      };
    });

    const recommendedPreventiveActions: string[] = [];

    if (riskLevel === 'HIGH') {
      recommendedPreventiveActions.push('Scout the lower canopy daily for early lesion development and water-soaked lesions.');
      recommendedPreventiveActions.push('Avoid excess nitrogen fertilizer top-dressing, as succulent new growth is highly susceptible to penetration.');
      recommendedPreventiveActions.push('Improve air circulation by pruning dense foliage or weeding canopy borders.');
      recommendedPreventiveActions.push('Consider prophylactic application of bio-fungicide (Trichoderma viride @ 5g/L or Pseudomonas fluorescens @ 10g/L).');
    } else if (riskLevel === 'MEDIUM') {
      recommendedPreventiveActions.push('Inspect field borders and low-lying waterlogged patches twice weekly.');
      recommendedPreventiveActions.push('Ensure field drainage is operative so excess water quickly exits the root zone.');
      recommendedPreventiveActions.push('Irrigate early in the morning so the sun rapidly dries standing water on the crop leaves.');
    } else {
      recommendedPreventiveActions.push('Maintain regular scouting routine during routine field operations.');
      recommendedPreventiveActions.push('Continue balanced nutrient management to support natural plant systemic immunity.');
    }

    const scientificDisclaimer =
      'Preventive Agronomic Advisory: This assessment evaluates microclimatic risk factors based on ambient temperature, humidity, and rainfall patterns. It indicates environmental conduciveness for pathogen development and does NOT replace visual scouting or laboratory pathology testing. Consult your local agricultural university or extension officer before spraying chemical crop protection products.';

    return {
      cropName: cropMeta.name,
      riskLevel,
      severityScore,
      potentialDiseases,
      contributingFactors,
      recommendedPreventiveActions,
      scientificDisclaimer,
      modelVersion: DiseaseRiskPredictor.VERSION,
    };
  }
}
