// ml/inference/fertilizerAdvisor.ts
import fs from 'fs';
import path from 'path';

export interface FertilizerInput {
  crop: string;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  ph: number;
  area_hectares?: number;
  soil_type?: string;
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

const BENCHMARK_PATH = path.resolve(process.cwd(), 'ml/models/crop_dataset_benchmark.json');
let benchmarkData: any = null;

try {
  benchmarkData = JSON.parse(fs.readFileSync(BENCHMARK_PATH, 'utf-8'));
} catch (e) {}

export class FertilizerAdvisoryEngine {
  public static readonly VERSION = '1.4.0';

  public static generateAdvisory(input: FertilizerInput): FertilizerAdvisoryResult {
    const crops = benchmarkData?.crops || {};
    const cropKey = input.crop.toLowerCase().replace(/[^a-z]/g, '');
    const matchedKey = Object.keys(crops).find(k => cropKey.includes(k) || k.includes(cropKey)) || 'rice';
    const cropMeta = crops[matchedKey] || {
      name: input.crop,
      ideal: { N: 80, P: 40, K: 40, ph: 6.5 },
      ranges: { N: [60, 100], P: [30, 60], K: [30, 50], ph: [5.5, 7.5] }
    };

    const area = Math.max(0.1, input.area_hectares || 1.0);
    const targetN = cropMeta.ideal.N;
    const targetP = cropMeta.ideal.P;
    const targetK = cropMeta.ideal.K;

    // Stoichiometric deficit calculation (kg/ha)
    const defN = Math.max(0, targetN - input.nitrogen);
    const defP = Math.max(0, targetP - input.phosphorus);
    const defK = Math.max(0, targetK - input.potassium);

    const prescriptions: FertilizerPrescription[] = [];

    // 1. Phosphorus using DAP (Diammonium Phosphate: 46% P2O5, 18% N)
    let suppliedNFromDap = 0;
    if (defP > 5) {
      const dapKgHa = Math.round(defP / 0.46);
      suppliedNFromDap = Math.round(dapKgHa * 0.18);
      prescriptions.push({
        fertilizerName: 'DAP (Di-Ammonium Phosphate 18:46:0)',
        nutrientSupplied: 'Phosphorus (P) and Starter Nitrogen (N)',
        quantityPerHectareKg: dapKgHa,
        totalQuantityKg: Math.round(dapKgHa * area),
        applicationTiming: 'Basal application at the time of sowing / final land preparation.',
        reason: `Supplies required ${Math.round(defP)} kg/ha phosphorus for root development and vigor.`,
      });
    }

    // 2. Remaining Nitrogen using Urea (46% N)
    const remainingDefN = Math.max(0, defN - suppliedNFromDap);
    if (remainingDefN > 5) {
      const ureaKgHa = Math.round(remainingDefN / 0.46);
      prescriptions.push({
        fertilizerName: 'Urea (46% Nitrogen)',
        nutrientSupplied: 'Nitrogen (N)',
        quantityPerHectareKg: ureaKgHa,
        totalQuantityKg: Math.round(ureaKgHa * area),
        applicationTiming: 'Split dose: 50% at 25-30 days after sowing, 50% at active tillering/pre-flowering.',
        reason: `Offsets nitrogen deficit of ${Math.round(remainingDefN)} kg/ha to support vegetative canopy growth.`,
      });
    }

    // 3. Potassium using MOP (Muriate of Potash: 60% K2O)
    if (defK > 5) {
      const mopKgHa = Math.round(defK / 0.60);
      prescriptions.push({
        fertilizerName: 'MOP (Muriate of Potash 0:0:60)',
        nutrientSupplied: 'Potassium (K)',
        quantityPerHectareKg: mopKgHa,
        totalQuantityKg: Math.round(mopKgHa * area),
        applicationTiming: 'Basal dose or split along with first top-dressing.',
        reason: `Improves drought tolerance, grain filling, and stem lodging resistance (${Math.round(defK)} kg/ha deficit).`,
      });
    }

    // Organic base
    prescriptions.push({
      fertilizerName: 'Well-Rotted Farmyard Manure (FYM) or Vermicompost',
      nutrientSupplied: 'Organic Carbon, Micronutrients & Beneficial Microbes',
      quantityPerHectareKg: 2000,
      totalQuantityKg: Math.round(2000 * area),
      applicationTiming: 'Apply 2-3 weeks before sowing during ploughing.',
      reason: 'Enhances soil organic carbon (SOC), cation exchange capacity, and microbial flora.',
    });

    // Soil amendments for pH
    const soilAmendments: string[] = [];
    let phAssessment = 'Normal neutral range (6.0 - 7.5)';

    if (input.ph < 5.5) {
      phAssessment = `Acidic (pH ${input.ph})`;
      soilAmendments.push('Agricultural Lime (CaCO3) @ 500-1000 kg/ha to neutralize soil acidity.');
    } else if (input.ph > 8.0) {
      phAssessment = `Alkaline/Sodic (pH ${input.ph})`;
      soilAmendments.push('Agricultural Gypsum (CaSO4·2H2O) @ 1000-1500 kg/ha with adequate leaching irrigation.');
    }

    const reasoning = `Recommendations are tailored to ${cropMeta.name} nutritional benchmarks (target N:${targetN}, P:${targetP}, K:${targetK} kg/ha). Calculated fertilizer dosages account for the stoichiometric nutrient concentrations in standard grades.`;

    const safetyWarning =
      'Agricultural Safety Notice: These fertilizer dosage guidelines are based on standard agronomic nutrient response functions. Field soil conditions, microbial activity, and prior season green manuring can alter nutrient uptake. Always verify with your local Krishi Vigyan Kendra (KVK) or district agricultural extension officer before heavy chemical applications.';

    return {
      cropName: cropMeta.name,
      soilHealthStatus: {
        nitrogenStatus: input.nitrogen < cropMeta.ranges.N[0] ? 'DEFICIENT' : input.nitrogen > cropMeta.ranges.N[1] ? 'EXCESS' : 'SUFFICIENT',
        phosphorusStatus: input.phosphorus < cropMeta.ranges.P[0] ? 'DEFICIENT' : input.phosphorus > cropMeta.ranges.P[1] ? 'EXCESS' : 'SUFFICIENT',
        potassiumStatus: input.potassium < cropMeta.ranges.K[0] ? 'DEFICIENT' : input.potassium > cropMeta.ranges.K[1] ? 'EXCESS' : 'SUFFICIENT',
        phAssessment,
      },
      recommendedFertilizers: prescriptions,
      soilAmendments,
      agronomicReasoning: reasoning,
      safetyWarning,
      modelVersion: FertilizerAdvisoryEngine.VERSION,
    };
  }
}
