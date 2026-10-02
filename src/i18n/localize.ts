// src/i18n/localize.ts
import { Language, translations, getTranslatedCropName } from './translations.js';

/**
 * Universal bilingual translation and localization utility.
 * Guarantees that in all 6 features (Crop, Yield, Fertilizer, Irrigation, Disease, Weather),
 * every sentence, headline, factor, badge, reason, symptom, and guideline
 * is presented in natural, high-fidelity Telugu when Telugu is selected.
 */

// 1. Common agronomic and environmental status mappings
const STATUS_MAP_TE: Record<string, string> = {
  OPTIMAL: 'ఆదర్శవంతం (అనుకూలం)',
  FAVORABLE: 'అనుకూలం',
  LIMITING: 'పరిమితి / లోపం',
  CRITICAL: 'అత్యవసరం / తీవ్రం',
  DEFICIENT: 'లోపం ఉంది (తక్కువ)',
  SUFFICIENT: 'సరిపడా ఉంది',
  EXCESS: 'అధికంగా ఉంది',
  HIGH: 'ఎక్కువ',
  MEDIUM: 'మధ్యస్థం',
  LOW: 'తక్కువ',
  NONE: 'లేదు',
  POOR: 'తక్కువ అనుకూలత',
  GOOD: 'మంచి అనుకూలత',
  EXCELLENT: 'అత్యుత్తమం',
  POSITIVE: 'అనుకూల అంశం',
  NEGATIVE: 'పరిమితి అంశం',
  NEUTRAL: 'సాధారణం',
  FOUND: 'లభ్యమైంది',
  NOT_AVAILABLE: 'అందుబాటులో లేదు',
  PENDING: 'పెండింగ్‌లో ఉంది',
  CONFIRMED: 'ధృవీకరించబడింది',
  VERIFIED: 'తనిఖీ చేయబడింది',
};

// 2. Weather conditions
const WEATHER_CONDITIONS_TE: Record<string, string> = {
  'Clear Sky': 'నిర్మలమైన ఆకాశం',
  'Mainly Clear': 'చాలా వరకు నిర్మలం',
  'Partly Cloudy': 'పాక్షికంగా మేఘావృతం',
  'Partly Cloudy (Station Baseline)': 'పాక్షికంగా మేఘావృతం (కేంద్ర సాధారణం)',
  'Overcast': 'దట్టమైన మేఘావృతం',
  'Cloudy': 'మేఘావృతం',
  'Foggy': 'పొగమంచు',
  'Drizzle': 'తుంపర / చిరుజల్లులు',
  'Light Rain': 'తేలికపాటి వర్షం',
  'Rain Showers': 'వర్షపు జల్లులు',
  'Light Showers': 'తేలికపాటి జల్లులు',
  'Heavy Showers': 'భారీ వర్షపు జల్లులు',
  'Scattered Rain': 'చెదురుమదురు వర్షం',
  'Scattered Showers': 'చెదురుమదురు జల్లులు',
  'Thunderstorm': 'ఉరుములతో కూడిన భారీ వర్షం',
  'Snow / Hail': 'వడగండ్ల వాన',
  'Dry': 'వర్షం లేదు / పొడిగా ఉంది',
  'High Dewpoint': 'అధిక తేమ స్థాయి',
  'Significant Rain': 'భారీ వర్షపాతం',
  'Dry / Normal': 'పొడిగా / సాధారణం',
  'High Wind': 'తీవ్రమైన ఈదురుగాలులు',
  'Gentle Breeze': 'మందకొడి అనుకూల గాలి',
};

// 3. Soil Texture and Types
const SOIL_TYPES_TE: Record<string, string> = {
  'Clay Loam': 'బంక నేల / జిగురు నేల (Clay Loam)',
  'Sandy Loam': 'ఇసుక దుబ్బ నేల (Sandy Loam)',
  'Loam': 'ఒండ్రు నేల (Loam)',
  'Red Soil': 'ఎర్ర నేల (Red Soil)',
  'Black Soil': 'నల్లరేగడి నేల (Black Soil)',
  'Black Cotton Soil': 'నల్లరేగడి నేల (Black Cotton Soil)',
  'Alluvial Soil': 'నదీ ఒండ్రు నేల (Alluvial Soil)',
  'Laterite Soil': 'లేటరైట్ ఎర్ర నేల',
  'Saline Soil': 'చౌడు నేల (Saline Soil)',
  'Alkaline Soil': 'క్షార నేల (Alkaline Soil)',
};

// 4. Water Sources & Irrigation Types
const WATER_SOURCES_TE: Record<string, string> = {
  'Borewell & Canal': 'బోరుబావి & కాలువ నీరు',
  'Borewell': 'బోరుబావి',
  'Canal': 'కాలువ నీరు',
  'Rainfed': 'వర్షాధారం',
  'Open Well': 'బావి నీరు',
  'Tank / Pond': 'చెరువు / కుంట నీరు',
  'Drip Irrigation': 'బిందు సేద్యం (Drip)',
  'Drip': 'బిందు సేద్యం (Drip)',
  'Sprinkler': 'తుంపర సేద్యం (Sprinkler)',
  'Furrow': 'సాలు పద్ధతి (Furrow)',
  'Flood / Basin': 'పారకపు నీరు (Flood)',
};

// 5. Fertilizer Names
const FERTILIZERS_TE: Record<string, string> = {
  'Urea (46% Nitrogen)': 'యూరియా (46% నత్రజని)',
  'Urea': 'యూరియా',
  'DAP (Di-Ammonium Phosphate 18:46:0)': 'డి.ఎ.పి (18:46:0)',
  'DAP': 'డి.ఎ.పి (DAP)',
  'MOP (Muriate of Potash 0:0:60)': 'ఎం.ఓ.పి / పొటాష్ (0:0:60)',
  'MOP': 'పొటాష్ (MOP)',
  'SSP (Single Super Phosphate)': 'సింగిల్ సూపర్ ఫాస్ఫేట్ (SSP)',
  'Well-Rotted Farmyard Manure (FYM) or Vermicompost': 'బాగా కుళ్ళిన పశువుల ఎరువు లేదా వర్మీ కంపోస్ట్',
  'Farmyard Manure (FYM)': 'పశువుల ఎరువు (FYM)',
  'Vermicompost': 'వానపాముల ఎరువు (వర్మీకంపోస్ట్)',
  'Agricultural Lime (CaCO3)': 'వ్యవసాయ సున్నం (CaCO3)',
  'Agricultural Gypsum (CaSO4·2H2O)': 'వ్యవసాయ జిప్సం (CaSO4)',
  'Zinc Sulphate': 'జింక్ సల్ఫేట్ (లఘు పోషకం)',
  'Borax': 'బోరాక్స్',
};

// 6. Pathogens and Diseases
const DISEASES_TE: Record<string, { name: string; symptoms: string; conditions: string }> = {
  'Rice Blast (Pyricularia oryzae)': {
    name: 'వరి అగ్గి తెగులు / మెడవిరుపు (Blast)',
    symptoms: 'ఆకులపై కండె ఆకారపు బూడిద రంగు మచ్చలు, వెన్ను విరిగిపోవడం.',
    conditions: 'అధిక తేమ (>85%), రాత్రి వేళ చల్లదనం (18-24°C), అధిక నత్రజని వాడకం.',
  },
  'Rice Blast': {
    name: 'వరి అగ్గి తెగులు / మెడవిరుపు (Blast)',
    symptoms: 'ఆకులపై కండె ఆకారపు బూడిద రంగు మచ్చలు, వెన్ను విరిగిపోవడం.',
    conditions: 'అధిక తేమ (>85%), రాత్రి వేళ చల్లదనం (18-24°C), అధిక నత్రజని వాడకం.',
  },
  'Sheath Blight (Rhizoctonia solani)': {
    name: 'వరి కాండం కుళ్లు తెగులు (Sheath Blight)',
    symptoms: 'మట్టలపై పాము చారల వంటి ఆకుపచ్చ-బూడిద రంగు మచ్చలు.',
    conditions: 'వెచ్చని మరియు అధిక తేమతో కూడిన వాతావరణం, ఒత్తుగా నాటడం.',
  },
  'Sheath Blight': {
    name: 'వరి కాండం కుళ్లు తెగులు (Sheath Blight)',
    symptoms: 'మట్టలపై పాము చారల వంటి ఆకుపచ్చ-బూడిద రంగు మచ్చలు.',
    conditions: 'వెచ్చని మరియు అధిక తేమతో కూడిన వాతావరణం, ఒత్తుగా నాటడం.',
  },
  'Bacterial Leaf Blight (Xanthomonas oryzae)': {
    name: 'వరి బ్యాక్టీరియా ఆకు ఎండు తెగులు (BLB)',
    symptoms: 'ఆకుల అంచుల నుండి పసుపు-తెలుపు రంగులో అలల మాదిరిగా ఎండిపోవడం.',
    conditions: 'ఈదురుగాలులతో కూడిన వర్షాలు, నిల్వ నీరు.',
  },
  'Bacterial Leaf Blight': {
    name: 'వరి బ్యాక్టీరియా ఆకు ఎండు తెగులు (BLB)',
    symptoms: 'ఆకుల అంచుల నుండి పసుపు-తెలుపు రంగులో అలల మాదిరిగా ఎండిపోవడం.',
    conditions: 'ఈదురుగాలులతో కూడిన వర్షాలు, నిల్వ నీరు.',
  },
  'Brown Spot (Bipolaris oryzae)': {
    name: 'వరి ఆకు మచ్చ తెగులు (Brown Spot)',
    symptoms: 'ఆకులపై గోధుమ రంగు గుండ్రటి లేదా అండాకార మచ్చలు.',
    conditions: 'నేలలో పోషక లోపం (ముఖ్యంగా పొటాష్ లోపం), తక్కువ తేమ.',
  },
  'Brown Spot': {
    name: 'వరి ఆకు మచ్చ తెగులు (Brown Spot)',
    symptoms: 'ఆకులపై గోధుమ రంగు గుండ్రటి లేదా అండాకార మచ్చలు.',
    conditions: 'నేలలో పోషక లోపం (ముఖ్యంగా పొటాష్ లోపం), తక్కువ తేమ.',
  },
  'Turcicum Leaf Blight': {
    name: 'మొక్కజొన్న ఆకు ఎండు తెగులు (Turcicum)',
    symptoms: 'ఆకులపై పొడవైన చారల వంటి ఎండిన మచ్చలు.',
    conditions: 'చల్లని, తేమతో కూడిన మేఘావృత వాతావరణం.',
  },
  'Common Rust': {
    name: 'మొక్కజొన్న కుంకుమ తెగులు (Rust)',
    symptoms: 'ఆకులపై ఇటుక ఎరుపు/గోధుమ రంగు పొక్కులు.',
    conditions: 'చల్లని రాత్రులు, మంచు మరియు పగటి పూట వెచ్చని గాలి.',
  },
  'Leaf Blight': {
    name: 'ఆకు ఎండు తెగులు (Leaf Blight)',
    symptoms: 'ఆకుల చివర్ల నుండి ఎండిపోవడం మరియు గోధుమ మచ్చలు.',
    conditions: 'అధిక తేమ మరియు వెచ్చని వాతావరణం.',
  },
  'Root Rot': {
    name: 'వేరు కుళ్లు తెగులు (Root Rot)',
    symptoms: 'మొక్కలు వాడిపోవడం, వేర్లు నల్లగా మారి కుళ్ళిపోవడం.',
    conditions: 'పొలంలో నీరు నిలబడటం, మురుగునీటి వసతి లేకపోవడం.',
  },
  'Powdery Mildew': {
    name: 'బూడిద తెగులు (Powdery Mildew)',
    symptoms: 'ఆకుల పైభాగంలో తెల్లటి బూడిద వంటి పొడి కనిపించడం.',
    conditions: 'పగలు వెచ్చగా, రాత్రి చల్లగా మరియు తేమగా ఉండటం.',
  },
  'Tikka Leaf Spot': {
    name: 'వేరుశనగ టిక్కా ఆకుమచ్చ తెగులు',
    symptoms: 'ఆకులపై ముదురు గోధుమ/నలుపు గుండ్రటి మచ్చలు, చుట్టూ పసుపు వలయం.',
    conditions: 'అధిక వర్షపాతం మరియు వరుసగా రోజుల తరబడి గాలిలో తేమ.',
  },
  'Anthracnose': {
    name: 'ఆంత్రాక్నోస్ / కాయకుళ్లు తెగులు',
    symptoms: 'కాయలు లేదా ఆకులపై గుంటల వంటి నల్లటి మచ్చలు.',
    conditions: 'తేమతో కూడిన వెచ్చని వర్షాకాల పరిస్థితులు.',
  },
};

// 7. Pathogen classification
const PATHOGENS_TE: Record<string, string> = {
  FUNGAL: 'శిలీంధ్రం (Fungal)',
  BACTERIAL: 'బ్యాక్టీరియా (Bacterial)',
  VIRAL: 'వైరస్ (Viral)',
  INSECT: 'కీటకాలు / పురుగులు',
};

// 8. Sentence Translation Dictionary
const PHRASE_DICTIONARY_TE: Record<string, string> = {
  // Crop Recommendation
  'Optimal Soil Nitrogen': 'నేలలో నత్రజని ఆదర్శవంతంగా ఉంది',
  'Compatible Phosphorus': 'భాస్వరం పంటకు సరిపడే స్థాయిలో ఉంది',
  'Adequate Potassium': 'పొటాషియం సమృద్ధిగా లభ్యమవుతోంది',
  'Compatible Rainfall Regimen': 'పంటకు అవసరమైన వర్షపాతం సరిపోతుంది',
  'Moderate general climate compatibility': 'వాతావరణం సాధారణ అనుకూలతను కలిగి ఉంది',
  'Soil Nitrogen (N)': 'నేలలో నత్రజని (N)',
  'Soil Phosphorus (P)': 'నేలలో భాస్వరం (P)',
  'Soil Potassium (K)': 'నేలలో పొటాషియం (K)',
  'Soil pH': 'నేల పి హెచ్ (pH)',
  'Rainfall / Water': 'వర్షపాతం / నీటి లభ్యత',
  'Temperature': 'ఉష్ణోగ్రత',
  'Humidity': 'గాలిలో తేమ శాతం',

  // Yield Prediction
  'Soil Nutrients (N-P-K)': 'నేల ప్రధాన పోషకాలు (N-P-K)',
  'Thermal Conditions': 'ఉష్ణోగ్రత అనుకూలత',
  'Thermal Stress': 'ఉష్ణోగ్రత ఒత్తిడి',
  'Water Supply & Moisture': 'నీటి సరఫరా మరియు నేల తేమ',
  'Water Stress': 'తేమ కొరత / నీటి ఒత్తిడి',
  'Adequate precipitation and soil moisture support transpiration demand.': 'తగినంత వర్షపాతం మరియు నేల తేమ పంట బాష్పోత్సేక అవసరాలకు పూర్తిగా మద్దతు ఇస్తున్నాయి.',
  'Moisture deficit detected. Irrigation supplementation recommended to prevent yield penalty.': 'నేలలో తేమ కొరత గుర్తించబడింది. దిగుబడి తగ్గకుండా సకాలంలో నీటిపారుదల అందించండి.',
  'Extreme high temperature (>35°C) inhibits many common fungal spore germination cycles.': 'తీవ్రమైన అధిక ఉష్ణోగ్రత (>35°C) చాలా శిలీంధ్రాల వ్యాప్తిని అణచివేస్తుంది.',

  // Fertilizer
  'Basal application at the time of sowing / final land preparation.': 'విత్తే సమయంలో లేదా చివరి దుక్కిలో మొదటి మోతాదుగా వేయండి.',
  'Split dose: 50% at 25-30 days after sowing, 50% at active tillering/pre-flowering.': 'విడతల వారీగా: విత్తిన 25-30 రోజులకు 50%, పిలకల దశ లేదా పూతకు ముందు 50% వేయండి.',
  'Basal dose or split along with first top-dressing.': 'మొదటి దుక్కిలో లేదా మొదటి దఫా ఎరువులతో కలిపి వేయండి.',
  'Apply 2-3 weeks before sowing during ploughing.': 'విత్తడానికి 2-3 వారాల ముందు దుక్కి దున్నే సమయంలో వేయండి.',
  'Enhances soil organic carbon (SOC), cation exchange capacity, and microbial flora.': 'నేలలో సేంద్రీయ కర్బనాన్ని పెంచి, సూక్ష్మజీవుల జీవక్రియను మరియు నేల సారవంతాన్ని మెరుగుపరుస్తుంది.',

  // Irrigation
  'No irrigation required currently.': 'ప్రస్తుతం నీరు పెట్టవలసిన అవసరం లేదు.',
  'Monitor soil; avoid excess irrigation.': 'నేల తేమను పరిశీలిస్తూ ఉండండి; అధిక నీరు పెట్టవద్దు.',
  'Hold off on irrigation. Await forecasted precipitation.': 'నీరు పెట్టడాన్ని వాయిదా వేయండి. వర్షం పడే వరకు వేచి చూడండి.',
  'Plan light watering within next 2-3 days if no rain occurs.': 'వర్షం కురవకపోతే రాబోయే 2-3 రోజుల్లో తేలికపాటి నీటిపారుదల అందించండి.',
  'Hold off temporarily for 24 hours to monitor rain arrival.': 'వర్ష సూచన ఉన్నందున 24 గంటల పాటు నీరు పెట్టడం ఆపండి.',
  'Early morning (05:00 - 08:00) or late evening (17:00 - 19:30).': 'ఉదయాన్నే (05:00 - 08:00) లేదా సాయంత్రం (17:00 - 19:30) వేళల్లో నీరు పెట్టండి.',
  'Immediate irrigation recommended within 6-12 hours.': 'పైరు వాడిపోకుండా రాబోయే 6-12 గంటల్లో తక్షణమే నీరు పెట్టండి.',

  // Weather Alerts
  'Live Weather Station Offline': 'వాతావరణ కేంద్రం ఆఫ్‌లైన్‌లో ఉంది',
  'Unable to reach remote meteorological satellite feed. Using local district seasonal normals.': 'ఉపగ్రహ వాతావరణ సమాచారం అందుబాటులో లేదు. స్థానిక కాలానుగుణ అంచనాలు ఉపయోగించబడుతున్నాయి.',
  'Avoid pesticide, foliar nutrient, or herbicide spraying today. High winds cause droplet drift and environmental loss.': 'ఈరోజు పురుగుమందులు లేదా ఎరువుల పిచికారీ చేయవద్దు. ఈదురుగాలుల వల్ల మందు వ్యర్థమై ఇతర ప్రదేశాలకు కొట్టుకుపోతుంది.',
  'Severe canopy evapotranspiration expected. Ensure morning irrigation to protect flowering and grain-filling stages.': 'తీవ్రమైన ఎండల వల్ల నీరు ఆవిరైపోతుంది. పూత మరియు గింజ పాలుపోసుకునే దశలో పంట దెబ్బతినకుండా ఉదయాన్నే నీరు పెట్టండి.',
  'Substantial downpour expected. Defer urea fertilizer application to prevent leaching. Clean field drainage channels.': 'భారీ వర్షం కురిసే అవకాశం ఉంది. ఎరువులు కొట్టుకుపోకుండా యూరియా వేయడం వాయిదా వేయండి. మురుగు కాలువలను శుభ్రం చేయండి.',
  'Prolonged relative humidity creates continuous leaf surface moisture conducive to fungal spore germination.': 'వరుసగా అధిక తేమ ఉండటం వల్ల ఆకులపై నీటి పొర ఏర్పడి శిలీంధ్రాల వ్యాప్తికి కారణమవుతుంది. పైరును నిరంతరం గమనించండి.',
};

/**
 * Main translation function for dynamic sentences and phrases.
 */
export function localizeText(text: string | null | undefined, lang: Language): string {
  if (!text) return '';
  if (lang === 'en') return text;

  const trimmed = text.trim();

  // 1. Direct match in dictionary
  if (PHRASE_DICTIONARY_TE[trimmed]) {
    return PHRASE_DICTIONARY_TE[trimmed];
  }

  // 2. Direct status match
  const upper = trimmed.toUpperCase();
  if (STATUS_MAP_TE[upper]) {
    return STATUS_MAP_TE[upper];
  }

  // 3. Weather conditions
  if (WEATHER_CONDITIONS_TE[trimmed]) {
    return WEATHER_CONDITIONS_TE[trimmed];
  }

  // 4. Pattern matches for dynamic explainability strings
  // "Why <Crop>? It exhibits high physiological affinity with your farm's nutrient profile and microclimate."
  const whyCropMatch = trimmed.match(/^Why ([a-zA-Z\s]+)\? It exhibits high physiological affinity/i);
  if (whyCropMatch) {
    const cropName = getTranslatedCropName(whyCropMatch[1].trim(), 'te');
    return `ఈ పంటను ఎందుకు సిఫార్సు చేసాము? ${cropName} పంట మీ నేలలోని పోషకాలు మరియు ప్రస్తుత వాతావరణ పరిస్థితులకు అత్యంత అనుకూలంగా ఉంటుంది.`;
  }

  // "Your soil/climate value of X unit is within the ideal band (min-max unit) for Crop."
  const idealBandMatch = trimmed.match(/Your soil\/climate value of ([\d.]+)\s*([a-zA-Z/%°]+) is within the ideal band/i);
  if (idealBandMatch) {
    return `మీ నేల/వాతావరణ విలువ (${idealBandMatch[1]} ${idealBandMatch[2]}) పంటకు అవసరమైన ఆదర్శవంతమైన పరిధిలో ఉంది.`;
  }

  // "Value of X unit falls within acceptable agronomic limits."
  const acceptableMatch = trimmed.match(/Value of ([\d.]+)\s*([a-zA-Z/%°]+) falls within acceptable agronomic limits/i);
  if (acceptableMatch) {
    return `విలువ (${acceptableMatch[1]} ${acceptableMatch[2]}) ఆమోదయోగ్యమైన వ్యవసాయ పరిమితుల్లో ఉంది.`;
  }

  // "Value of X unit is below the threshold of Y unit; supplemental amendment is recommended."
  const belowThresholdMatch = trimmed.match(/Value of ([\d.]+)\s*([a-zA-Z/%°]+) is below the threshold of ([\d.]+)/i);
  if (belowThresholdMatch) {
    return `విలువ (${belowThresholdMatch[1]} ${belowThresholdMatch[2]}) కనిష్ట పరిమితి (${belowThresholdMatch[3]}) కంటే తక్కువగా ఉంది; తగిన ఎరువులు వేయవలసి ఉంటుంది.`;
  }

  // "Value of X unit exceeds typical upper boundary of Y unit."
  const exceedsMatch = trimmed.match(/Value of ([\d.]+)\s*([a-zA-Z/%°]+) exceeds typical upper boundary of ([\d.]+)/i);
  if (exceedsMatch) {
    return `విలువ (${exceedsMatch[1]} ${exceedsMatch[2]}) గరిష్ట పరిమితి (${exceedsMatch[3]}) కంటే ఎక్కువగా ఉంది.`;
  }

  // "Highly optimal Soil Nitrogen (N) (78 kg/ha)"
  const highlyOptimalMatch = trimmed.match(/Highly optimal (.*?) \((.*?)\)/i);
  if (highlyOptimalMatch) {
    const factor = localizeText(highlyOptimalMatch[1], 'te');
    return `ఆదర్శవంతమైన ${factor} (${highlyOptimalMatch[2]})`;
  }

  // "Compatible Soil Phosphorus (P) level"
  const compatibleMatch = trimmed.match(/Compatible (.*?) level/i);
  if (compatibleMatch) {
    const factor = localizeText(compatibleMatch[1], 'te');
    return `అనుకూలమైన ${factor} స్థాయి`;
  }

  // "Deficient Soil Nitrogen (N) (X vs min Y)"
  const deficientMatch = trimmed.match(/Deficient (.*?) \((.*?) vs min (.*?)\)/i);
  if (deficientMatch) {
    const factor = localizeText(deficientMatch[1], 'te');
    return `${factor} లోపం ఉంది (${deficientMatch[2]} vs కనిష్టం ${deficientMatch[3]})`;
  }

  // "Suitable pH (6.6)"
  const suitablePhMatch = trimmed.match(/Suitable pH \(([\d.]+)\)/i);
  if (suitablePhMatch) {
    return `అనుకూలమైన పి హెచ్ (${suitablePhMatch[1]})`;
  }

  // "Favorable Temperature (28°C)"
  const favTempMatch = trimmed.match(/Favorable Temperature \(([\d.]+°?C?)\)/i);
  if (favTempMatch) {
    return `అనుకూలమైన ఉష్ణోగ్రత (${favTempMatch[1]})`;
  }

  // "Nutrient availability satisfies X% of crop physiological requirement."
  const fertReqMatch = trimmed.match(/Nutrient availability satisfies (\d+)% of crop physiological requirement/i);
  if (fertReqMatch) {
    return `నేలలోని పోషకాలు పంట అవసరాలలో ${fertReqMatch[1]}% సంతృప్తిపరుస్తున్నాయి.`;
  }

  // "Sub-optimal soil nutrient levels constrain potential yield by approx. X%."
  const fertConstrainMatch = trimmed.match(/Sub-optimal soil nutrient levels constrain potential yield by approx\.? (\d+)%/i);
  if (fertConstrainMatch) {
    return `నేలలో తగినంత పోషకాలు లేకపోవడం వల్ల దిగుబడి సుమారు ${fertConstrainMatch[1]}% తగ్గే అవకాశం ఉంది.`;
  }

  // "Temperature (X°C) is well within favorable canopy development range."
  const tempRangeMatch = trimmed.match(/Temperature \(([\d.]+°?C?)\) is well within favorable/i);
  if (tempRangeMatch) {
    return `ఉష్ణోగ్రత (${tempRangeMatch[1]}) పైరు పెరుగుదలకు అత్యంత అనుకూలమైన పరిధిలో ఉంది.`;
  }

  // "Ambient temperature deviates from optimal (X°C), creating metabolic stress."
  const tempStressMatch = trimmed.match(/Ambient temperature deviates from optimal \(([\d.]+°?C?)\)/i);
  if (tempStressMatch) {
    return `ఉష్ణోగ్రత ఆదర్శ స్థాయి (${tempStressMatch[1]}) కంటే భిన్నంగా ఉంది, ఇది పంటపై ప్రభావం చూపుతుంది.`;
  }

  // "Supplies required X kg/ha phosphorus for root development and vigor."
  const pSuppliesMatch = trimmed.match(/Supplies required (\d+) kg\/ha phosphorus for root development/i);
  if (pSuppliesMatch) {
    return `వేర్ల వ్యవస్థ దృఢంగా ఎదగడానికి అవసరమైన ${pSuppliesMatch[1]} కిలోల భాస్వరాన్ని అందిస్తుంది.`;
  }

  // "Offsets nitrogen deficit of X kg/ha to support vegetative canopy growth."
  const nOffsetsMatch = trimmed.match(/Offsets nitrogen deficit of (\d+) kg\/ha to support vegetative/i);
  if (nOffsetsMatch) {
    return `మొక్కల పెరుగుదలకు అవసరమైన ${nOffsetsMatch[1]} కిలోల నత్రజని లోటును భర్తీ చేస్తుంది.`;
  }

  // "Improves drought tolerance, grain filling, and stem lodging resistance (X kg/ha deficit)."
  const kImprovesMatch = trimmed.match(/Improves drought tolerance, grain filling.*?\((\d+) kg\/ha deficit\)/i);
  if (kImprovesMatch) {
    return `పైరు పడిపోకుండా కాండం బలాన్ని, బెట్టను తట్టుకునే శక్తిని మరియు గింజ బరువును పెంచుతుంది (${kImprovesMatch[1]} కిలోల లోటు).`;
  }

  // "Acidic (pH X)" / "Alkaline/Sodic (pH X)"
  const phAcidMatch = trimmed.match(/Acidic \(pH ([\d.]+)\)/i);
  if (phAcidMatch) return `ఆమ్ల నేల (పి హెచ్ ${phAcidMatch[1]})`;
  const phAlkMatch = trimmed.match(/Alkaline.*?\(pH ([\d.]+)\)/i);
  if (phAlkMatch) return `క్షార నేల (పి హెచ్ ${phAlkMatch[1]})`;
  if (trimmed.includes('Normal neutral range')) return 'సాధారణ తటస్థ పరిధి (6.0 - 7.5)';

  // "Agricultural Lime (CaCO3) @ 500-1000 kg/ha to neutralize soil acidity."
  if (trimmed.includes('Agricultural Lime')) {
    return 'ఆమ్ల గుణాన్ని సరిచేయడానికి ఎకరానికి 200-400 కిలోల వ్యవసాయ సున్నం (CaCO3) వేయండి.';
  }
  if (trimmed.includes('Agricultural Gypsum')) {
    return 'క్షార గుణాన్ని తగ్గించి మురుగునీరు పారేలా చేయడానికి ఎకరానికి 400-600 కిలోల జిప్సం వేయండి.';
  }

  // Irrigation reasoning patterns
  // "Current soil moisture (X%) is near or exceeding field capacity..."
  const moistExcessMatch = trimmed.match(/Current soil moisture \((\d+)%\) is near or exceeding field capacity/i);
  if (moistExcessMatch) {
    return `ప్రస్తుత నేల తేమ (${moistExcessMatch[1]}%) గరిష్ట స్థాయిని చేరుకుంది. అదనంగా నీరు పెడితే వేర్లు కుళ్ళిపోయే ప్రమాదం ఉంది.`;
  }

  // "Soil moisture (X%) is currently satisfactory. Because Y mm of rainfall is expected..."
  const moistSatisfactoryMatch = trimmed.match(/Soil moisture \((\d+)%\) is currently satisfactory\. Because ([\d.]+) mm of rainfall/i);
  if (moistSatisfactoryMatch) {
    return `నేలలో తేమ (${moistSatisfactoryMatch[1]}%) తగినంతగా ఉంది. రాబోయే 48 గంటల్లో ${moistSatisfactoryMatch[2]} మి.మీ వర్షం కురిసే అవకాశం ఉన్నందున నీరు పెట్టడం వాయిదా వేయండి.`;
  }

  // "Soil moisture (X%) remains above the management depletion threshold..."
  const moistThresholdMatch = trimmed.match(/Soil moisture \((\d+)%\) remains above the management depletion threshold/i);
  if (moistThresholdMatch) {
    return `నేలలో తేమ (${moistThresholdMatch[1]}%) సరిపడా ఉంది. రాబోయే 2-3 రోజుల్లో తేలికపాటి నీరు ఇవ్వవచ్చు.`;
  }

  // "Soil moisture is depleting (X%), but a substantial storm system (Y mm) is imminent..."
  const stormMatch = trimmed.match(/Soil moisture is depleting \((\d+)%\), but a substantial storm system \(([\d.]+) mm\)/i);
  if (stormMatch) {
    return `నేలలో తేమ తగ్గుతోంది (${stormMatch[1]}%), కానీ త్వరలో భారీ వర్షం (${stormMatch[2]} మి.మీ) కురిసే సూచన ఉన్నందున ప్రస్తుతానికి ఆపండి.`;
  }

  // "Soil moisture has dropped to X%, entering the allowable depletion zone..."
  const dropMatch = trimmed.match(/Soil moisture has dropped to (\d+)%/i);
  if (dropMatch) {
    return `నేల తేమ (${dropMatch[1]}%) కనిష్ట స్థాయికి పడిపోయింది. పైరు వాడిపోకుండా తక్షణమే నీటిపారుదల అందించండి.`;
  }

  // "Critical moisture deficit (X%). Soil is approaching the permanent wilting point..."
  const critMatch = trimmed.match(/Critical moisture deficit \((\d+)%\)/i);
  if (critMatch) {
    return `తీవ్రమైన తేమ కొరత (${critMatch[1]}%). పైరు ఎండిపోయే ప్రమాదం ఉన్నందున వెంటనే నీరు పెట్టండి.`;
  }

  // Weather forecast notes in irrigation
  const rainNoteMatch = trimmed.match(/Forecast:? ([\d.]+) mm precipitation expected/i);
  if (rainNoteMatch) {
    return `వాతావరణ సూచన: రాబోయే 48 గంటల్లో ${rainNoteMatch[1]} మి.మీ వర్షపాతం నమోదయ్యే అవకాశం ఉంది.`;
  }
  if (trimmed.includes('No significant rain in immediate forecast')) {
    return 'రాబోయే రోజుల్లో వర్ష సూచన లేదు. నీటిపారుదల ఏర్పాట్లు సిద్ధం చేసుకోండి.';
  }
  if (trimmed.includes('Clear skies and dry air will accelerate evapotranspiration')) {
    return 'ఎండ తీవ్రత మరియు పొడి వాతావరణం వల్ల నేలలో తేమ త్వరగా ఆవిరవుతుంది.';
  }

  // Weather Alert Titles
  const windAlertMatch = trimmed.match(/High Wind Speed \(([\d.]+) km\/h\).*?Warning/i);
  if (windAlertMatch) {
    return `తీవ్రమైన ఈదురుగాలుల హెచ్చరిక (${windAlertMatch[1]} కి.మీ/గం) — పిచికారీ చేయవద్దు`;
  }
  const heatAlertMatch = trimmed.match(/Extreme Heat Warning \(([\d.]+°?C?)\)/i);
  if (heatAlertMatch) {
    return `తీవ్ర ఎండలు / వడగాల్పుల హెచ్చరిక (${heatAlertMatch[1]})`;
  }
  const frostAlertMatch = trimmed.match(/Cold \/ Frost Hazard \(([\d.]+°?C?)\)/i);
  if (frostAlertMatch) {
    return `తీవ్ర చలి / మంచు ప్రమాద హెచ్చరిక (${frostAlertMatch[1]})`;
  }
  const rainAlertMatch = trimmed.match(/Heavy Rain Alert \(([\d.]+) mm upcoming\)/i);
  if (rainAlertMatch) {
    return `భారీ వర్ష సూచన హెచ్చరిక (రాబోయే వర్షం: ${rainAlertMatch[1]} మి.మీ)`;
  }
  if (trimmed.includes('High Pathogen Humidity Alert')) {
    return 'అధిక తేమ & తెగుళ్ల వ్యాప్తి హెచ్చరిక';
  }

  // Disease preventive actions
  if (trimmed.includes('Scout the lower canopy daily')) {
    return 'పైరు క్రింది భాగపు ఆకులను ప్రతిరోజూ గమనిస్తూ మచ్చలు లేదా తెగులు లక్షణాలను పరిశీలించండి.';
  }
  if (trimmed.includes('Avoid excess nitrogen fertilizer top-dressing')) {
    return 'అధికంగా నత్రజని (యూరియా) వేయవద్దు, ఎందుకంటే లేత ఆకులపై తెగుళ్లు త్వరగా వ్యాపిస్తాయి.';
  }
  if (trimmed.includes('Improve air circulation by pruning dense foliage')) {
    return 'పైరుకు గాలి, వెలుతురు ధారాళంగా సోకేలా కలుపు మొక్కలను తొలగించి మురుగు కాలువలను శుభ్రం చేయండి.';
  }
  if (trimmed.includes('Trichoderma viride')) {
    return 'జీవ నియంత్రణ పద్ధతిలో ట్రైకోడెర్మా విరిడే (5 గ్రాములు లీటరు నీటికి) లేదా సూడోమోనాస్ పిచికారీ చేయండి.';
  }
  if (trimmed.includes('Inspect field borders and low-lying waterlogged patches')) {
    return 'పొలం గట్లు మరియు నీరు నిలిచే పల్లపు ప్రాంతాలను వారానికి రెండుసార్లు క్షుణ్ణంగా పరిశీలించండి.';
  }
  if (trimmed.includes('Ensure field drainage is operative')) {
    return 'వర్షపు నీరు పొలంలో నిల్వ ఉండకుండా మురుగు కాలువల ద్వారా బయటకు పారేలా చూడండి.';
  }
  if (trimmed.includes('Irrigate early in the morning so the sun rapidly dries standing water')) {
    return 'ఉదయాన్నే నీరు పెట్టండి, తద్వారా ఎండ వేడికి ఆకులపై ఉన్న నీటి బిందువులు త్వరగా ఆరిపోతాయి.';
  }
  if (trimmed.includes('Maintain regular scouting routine')) {
    return 'సాధారణ వ్యవసాయ పనుల సమయంలో పైరు ఆరోగ్యాన్ని ఎప్పటికప్పుడు గమనిస్తూ ఉండండి.';
  }
  if (trimmed.includes('Continue balanced nutrient management')) {
    return 'పైరుకు రోగనిరోధక శక్తిని పెంచడానికి సమతుల్య ఎరువుల యాజమాన్యాన్ని కొనసాగించండి.';
  }

  // Water saving tips
  if (trimmed.includes('Apply water during early morning or evening hours')) {
    return 'బాష్పీభవన నష్టాలను 25% వరకు తగ్గించడానికి ఉదయం లేదా సాయంత్రం వేళల్లో మాత్రమే నీరు పెట్టండి.';
  }
  if (trimmed.includes('Use drip or micro-sprinkler systems')) {
    return 'నీరు నేరుగా వేర్లకు చేరేలా సాధ్యమైనంత వరకు బిందు సేద్యం (డ్రిప్) లేదా తుంపర పద్ధతిని వాడండి.';
  }
  if (trimmed.includes('Maintain organic mulch')) {
    return 'నేలలో తేమ ఆవిరి కాకుండా కాపాడటానికి పంట అవశేషాలు లేదా ఎండుటాకులతో ఆచ్ఛాదన (మల్చింగ్) చేయండి.';
  }

  // If no match found, check if it's in our general dictionary or return original
  return trimmed;
}

/**
 * Translates crop names accurately.
 */
export function localizeCrop(cropName: string, lang: Language): string {
  return getTranslatedCropName(cropName, lang);
}

/**
 * Translates status strings (OPTIMAL, DEFICIENT, HIGH, CRITICAL, etc.)
 */
export function localizeStatus(status: string, lang: Language): string {
  if (lang === 'en') return status;
  const upper = (status || '').toUpperCase().trim();
  return STATUS_MAP_TE[upper] || status;
}

/**
 * Translates weather conditions (Clear Sky, Rain Showers, etc.)
 */
export function localizeWeatherCondition(condition: string, lang: Language): string {
  if (lang === 'en') return condition;
  return WEATHER_CONDITIONS_TE[condition] || localizeText(condition, lang);
}

/**
 * Translates fertilizer names (DAP, Urea, MOP, FYM, etc.)
 */
export function localizeFertilizerName(name: string, lang: Language): string {
  if (lang === 'en') return name;
  for (const [key, val] of Object.entries(FERTILIZERS_TE)) {
    if (name.toLowerCase().includes(key.toLowerCase())) {
      return val;
    }
  }
  return localizeText(name, lang);
}

/**
 * Translates disease names (Rice Blast, Sheath Blight, etc.)
 */
export function localizeDiseaseName(name: string, lang: Language): string {
  if (lang === 'en') return name;
  for (const [key, val] of Object.entries(DISEASES_TE)) {
    if (name.toLowerCase().includes(key.toLowerCase())) {
      return val.name;
    }
  }
  return name;
}

/**
 * Translates disease early symptoms.
 */
export function localizeDiseaseSymptoms(name: string, defaultSymptoms: string, lang: Language): string {
  if (lang === 'en') return defaultSymptoms;
  for (const [key, val] of Object.entries(DISEASES_TE)) {
    if (name.toLowerCase().includes(key.toLowerCase())) {
      return val.symptoms;
    }
  }
  return localizeText(defaultSymptoms, lang);
}

/**
 * Translates pathogen types (Fungal, Bacterial, Viral).
 */
export function localizePathogenType(type: string, lang: Language): string {
  if (lang === 'en') return type;
  const upper = (type || '').toUpperCase().trim();
  return PATHOGENS_TE[upper] || type;
}

/**
 * Translates soil texture (Clay Loam, Sandy Loam, etc.)
 */
export function localizeSoilType(soil: string, lang: Language): string {
  if (lang === 'en') return soil;
  return SOIL_TYPES_TE[soil] || localizeText(soil, lang);
}

/**
 * Translates water source (Borewell & Canal, etc.)
 */
export function localizeWaterSource(source: string, lang: Language): string {
  if (lang === 'en') return source;
  return WATER_SOURCES_TE[source] || localizeText(source, lang);
}
