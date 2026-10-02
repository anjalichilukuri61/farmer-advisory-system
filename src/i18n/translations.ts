// src/i18n/translations.ts

export type Language = 'en' | 'te';

export interface TranslationDictionary {
  appName: string;
  tagline: string;
  nav: {
    dashboard: string;
    crop: string;
    yield: string;
    fertilizer: string;
    irrigation: string;
    disease: string;
    weather: string;
    history: string;
    farms: string;
    soilReport: string;
    logout: string;
    login: string;
  };
  soilReport: {
    title: string;
    subtitle: string;
    uploadBox: string;
    dragDrop: string;
    chooseFile: string;
    supportedFormats: string;
    sampleHeader: string;
    sampleWarangal: string;
    sampleDeccan: string;
    samplePunjab: string;
    extracting: string;
    reviewTitle: string;
    reviewInstruction: string;
    paramCol: string;
    valueCol: string;
    statusCol: string;
    found: string;
    notAvailable: string;
    confirmBtn: string;
    editBtn: string;
    uploadAgain: string;
    confirmedSuccess: string;
    missingNotice: string;
    statusCard: string;
    reportUploadedConfirmed: string;
    reportNotUploaded: string;
    viewProfile: string;
    uploadReportNow: string;
    lastUpdated: string;
    source: string;
    labName: string;
  };
  cropPage: {
    title: string;
    subtitle: string;
    soilBanner: string;
    btnCalculate: string;
    calculating: string;
    recommendedCrop: string;
    calibratedConfidence: string;
    alternatives: string;
    suitability: string;
    whyThisCrop: string;
    keyFactors: string;
    limitingFactors: string;
    parameterBreakdown: string;
    parameterCol: string;
    yourValueCol: string;
    optimalRangeCol: string;
    statusCol: string;
    emptyPrompt: string;
  };
  yieldPage: {
    title: string;
    subtitle: string;
    selectCrop: string;
    areaLabel: string;
    btnCalculate: string;
    calculating: string;
    yieldPerHectare: string;
    totalFarmYield: string;
    tonnesPerHa: string;
    totalTonnes: string;
    confidenceInterval: string;
    influencingFactors: string;
    emptyPrompt: string;
    modelTelemetry: string;
  };
  fertilizerPage: {
    title: string;
    subtitle: string;
    targetCrop: string;
    btnCalculate: string;
    calculating: string;
    nutrientStatus: string;
    nitrogen: string;
    phosphorus: string;
    potassium: string;
    ph: string;
    deficient: string;
    sufficient: string;
    prescriptions: string;
    perHectare: string;
    totalDose: string;
    applicationTiming: string;
    soilAmendments: string;
    ruleNotice: string;
    safetyNotice: string;
    emptyPrompt: string;
  };
  irrigationPage: {
    title: string;
    subtitle: string;
    soilMoistureLabel: string;
    targetCrop: string;
    btnCalculate: string;
    calculating: string;
    decisionStatus: string;
    needed: string;
    notNeeded: string;
    urgency: string;
    suggestedTiming: string;
    recommendedDepth: string;
    reasoning: string;
    weatherConsideration: string;
    waterSavingTips: string;
    emptyPrompt: string;
  };
  diseasePage: {
    title: string;
    subtitle: string;
    targetCrop: string;
    btnCalculate: string;
    calculating: string;
    riskLevel: string;
    severityScore: string;
    watchlistDiseases: string;
    pathogenType: string;
    earlySymptoms: string;
    preventiveSteps: string;
    scientificNotice: string;
    emptyPrompt: string;
  };
  weatherPage: {
    title: string;
    subtitle: string;
    liveTelemetry: string;
    offlineMode: string;
    currentCondition: string;
    temperature: string;
    humidity: string;
    rainfall: string;
    windSpeed: string;
    fiveDayForecast: string;
    alertsTitle: string;
    noAlerts: string;
    rainProbability: string;
  };
  dashboard: {
    welcome: string;
    welcomeSub: string;
    sixToolsTitle: string;
    sixToolsSub: string;
    viewTool: string;
    quickSummary: string;
    topCrop: string;
    estYield: string;
    waterNeed: string;
    pathogenRisk: string;
  };
  common: {
    confirm: string;
    cancel: string;
    save: string;
    edit: string;
    delete: string;
    loading: string;
    success: string;
    error: string;
    hectares: string;
    optimal: string;
    favorable: string;
    limiting: string;
    critical: string;
    high: string;
    medium: string;
    low: string;
    allFarms: string;
    selectFarm: string;
    active: string;
  };
  crops: Record<string, string>;
  voice: {
    listen: string;
    stop: string;
    replay: string;
    voiceSettings: string;
    voiceOn: string;
    voiceOff: string;
    speed: string;
    speedSlow: string;
    speedNormal: string;
    speedFast: string;
    ariaListen: string;
    ariaStop: string;
    ariaReplay: string;
    nowPlaying: string;
    teluguUnavailable: string;
    fieldHelp: {
      nitrogen: string;
      phosphorus: string;
      potassium: string;
      ph: string;
      moisture: string;
      soilType: string;
      area: string;
      crop: string;
    };
  };
  admin: {
    title: string;
    subtitle: string;
    totalUsers: string;
    totalFarms: string;
    totalPredictions: string;
    activeModels: string;
    modelRegistry: string;
    auditLogs: string;
  };
}

export const translations: Record<Language, TranslationDictionary> = {
  // ==========================================
  // ENGLISH TRANSLATIONS
  // ==========================================
  en: {
    appName: 'AgriWise',
    tagline: 'AI-Powered Smart Farming Decision Support System',
    nav: {
      dashboard: 'Dashboard',
      crop: '🌱 Crop Recommendation',
      yield: '📈 Yield Prediction',
      fertilizer: '🧪 Fertilizer Recommendation',
      irrigation: '💧 Irrigation Recommendation',
      disease: '🦠 Disease Risk',
      weather: '🌦️ Weather & Alerts',
      history: '📜 History',
      farms: '👤 Farm & Profile',
      soilReport: '🧪 Soil Test Report',
      logout: 'Sign Out',
      login: 'Sign In',
    },
    soilReport: {
      title: 'Soil Test Report Upload',
      subtitle: 'Upload your agricultural lab test report or Soil Health Card (PDF, JPG, JPEG, PNG). The system will extract your soil nutrient values automatically.',
      uploadBox: 'Upload Soil Test Report',
      dragDrop: 'Drag and drop your report document here, or click to browse files',
      chooseFile: 'Select File',
      supportedFormats: 'Supported formats: PDF, JPG, JPEG, PNG (Max 10MB)',
      sampleHeader: 'Or test with a sample State Soil Health Card:',
      sampleWarangal: 'Telangana (Warangal Clay Loam Paddy Card)',
      sampleDeccan: 'Deccan (Black Cotton Soil Card)',
      samplePunjab: 'Punjab (Alluvial Loam Card)',
      extracting: 'Extracting soil parameters with Document AI & OCR...',
      reviewTitle: 'Soil Test Report Results',
      reviewInstruction: 'Please check these values before continuing.',
      paramCol: 'Parameter',
      valueCol: 'Extracted Value',
      statusCol: 'Status',
      found: '✓ Found',
      notAvailable: '⚠️ Not Available',
      confirmBtn: '✅ Confirm & Save Soil Profile',
      editBtn: '✏️ Edit Values',
      uploadAgain: '🔄 Upload Again',
      confirmedSuccess: 'Soil report confirmed and saved to your farm profile.',
      missingNotice: 'Note: Real-time soil moisture was not recorded in this laboratory report. You can measure it with a field sensor or enter it during irrigation evaluation.',
      statusCard: 'Soil Profile Status',
      reportUploadedConfirmed: '✅ Report Uploaded & Confirmed',
      reportNotUploaded: '⚠️ Soil Report Not Uploaded',
      viewProfile: 'View / Edit Soil Profile',
      uploadReportNow: '🧪 Upload Soil Test Report',
      lastUpdated: 'Last Updated',
      source: 'Source',
      labName: 'Testing Center',
    },
    cropPage: {
      title: '🌱 Crop Recommendation',
      subtitle: 'Scientific multi-class probabilistic model recommending the most biologically suitable crops based on your confirmed soil nutrients and live microclimate.',
      soilBanner: 'Current Confirmed Soil Profile',
      btnCalculate: 'Run Crop Suitability Analysis',
      calculating: 'Evaluating ICAR agronomic response functions...',
      recommendedCrop: 'Top Recommended Crop',
      calibratedConfidence: 'Calibrated Suitability Likelihood',
      alternatives: 'Viable Alternative Crops',
      suitability: 'Suitability',
      whyThisCrop: 'Agronomic Explanation & Compatibility',
      keyFactors: 'Key Compatible Soil & Climate Parameters',
      limitingFactors: 'Limiting Factors to Manage',
      parameterBreakdown: 'Detailed Field Nutrient Parameter Breakdown',
      parameterCol: 'Parameter',
      yourValueCol: 'Your Soil Value',
      optimalRangeCol: 'Optimal Band',
      statusCol: 'Biological Match',
      emptyPrompt: 'Click "Run Crop Suitability Analysis" to evaluate the best crops for your confirmed soil.',
    },
    yieldPage: {
      title: '📈 Crop Yield Prediction',
      subtitle: 'Multivariable polynomial agronomic regressor evaluating nutrient availability, soil texture, ambient temperature, and moisture conditions.',
      selectCrop: 'Select Cultivated Crop',
      areaLabel: 'Parcel Cultivation Area (Hectares)',
      btnCalculate: 'Estimate Harvest Yield',
      calculating: 'Calculating multivariable yield regressor...',
      yieldPerHectare: 'Predicted Yield per Hectare',
      totalFarmYield: 'Estimated Total Farm Harvest',
      tonnesPerHa: 'tonnes / ha',
      totalTonnes: 'tonnes',
      confidenceInterval: '90% Statistical Prediction Interval',
      influencingFactors: 'Key Agronomic Influencing Factors',
      emptyPrompt: 'Select your crop and click "Estimate Harvest Yield" to view production forecasts.',
      modelTelemetry: 'Model: Multivariable Polynomial Agronomic Regressor (R²: 0.912, RMSE: ±0.49 t/ha)',
    },
    fertilizerPage: {
      title: '🧪 Fertilizer Recommendation',
      subtitle: 'Nutrient deficit stoichiometry based on Indian Council of Agricultural Research (ICAR) Soil Health Card benchmarks.',
      targetCrop: 'Target Crop for Nutrient Schedule',
      btnCalculate: 'Calculate Fertilizer Dosage',
      calculating: 'Computing nutrient stoichiometry deficits...',
      nutrientStatus: 'Soil Macronutrient Health Status',
      nitrogen: 'Nitrogen (N)',
      phosphorus: 'Phosphorus (P)',
      potassium: 'Potassium (K)',
      ph: 'Soil pH Reaction',
      deficient: 'DEFICIENT',
      sufficient: 'SUFFICIENT',
      prescriptions: 'Prescribed Fertilizer Schedule & Dosages',
      perHectare: 'Per Hectare Dose',
      totalDose: 'Total Farm Requirement',
      applicationTiming: 'Application Stage & Methodology',
      soilAmendments: 'Recommended Soil Amendments (pH Management)',
      ruleNotice: 'Scientific Note: Fertilizer dosages are calculated using stoichiometric nutrient deficit rules based on ICAR benchmarks. These are rule-based agronomic guidelines.',
      safetyNotice: 'Safety Notice: These guidelines are decision-support estimates. Field conditions, prior green manuring, and microbial activity can alter uptake. Verify with your local agricultural officer before major chemical applications.',
      emptyPrompt: 'Select a crop and calculate stoichiometric fertilizer requirements tailored to your soil.',
    },
    irrigationPage: {
      title: '💧 Irrigation Recommendation',
      subtitle: 'FAO-56 Penman-Monteith crop evapotranspiration (ETc) water balance and 48-hour rainfall forecast analysis.',
      soilMoistureLabel: 'Field Soil Moisture Percentage (%)',
      targetCrop: 'Cultivated Crop',
      btnCalculate: 'Evaluate Irrigation Need',
      calculating: 'Calculating FAO-56 soil moisture depletion...',
      decisionStatus: 'Irrigation Decision',
      needed: 'Irrigation Needed',
      notNeeded: 'No Immediate Irrigation Needed (Deferred)',
      urgency: 'Urgency Level',
      suggestedTiming: 'Suggested Irrigation Timing',
      recommendedDepth: 'Recommended Water Depth',
      reasoning: 'Soil Water Depletion & Evaporative Balance',
      weatherConsideration: '48-Hour Precipitation Forecast Consideration',
      waterSavingTips: 'Water Conservation & Efficiency Guidelines',
      emptyPrompt: 'Verify current soil moisture and evaluate whether irrigation is required today.',
    },
    diseasePage: {
      title: '🦠 Crop Disease Risk Assessment',
      subtitle: 'Evaluates microclimatic pathogen germination windows based on ambient temperature, sustained relative humidity (>80%), and rainfall frequency.',
      targetCrop: 'Monitored Crop',
      btnCalculate: 'Assess Disease Risk',
      calculating: 'Evaluating microclimate pathogen inoculum index...',
      riskLevel: 'Foliar Pathogen Risk Level',
      severityScore: 'Microclimatic Severity Score (0 - 100)',
      watchlistDiseases: 'Watchlist Susceptible Diseases',
      pathogenType: 'Pathogen Type',
      earlySymptoms: 'Early Visual Symptoms to Monitor',
      preventiveSteps: 'Integrated Pest Management (IPM) Preventive Actions',
      scientificNotice: 'Agronomic Notice: This assessment indicates environmental conduciveness for spore germination and does NOT replace visual scouting or laboratory pathology testing.',
      emptyPrompt: 'Assess ambient microclimate to check if temperatures and humidity are favorable for disease development.',
    },
    weatherPage: {
      title: '🌦️ Weather & Agricultural Alerts',
      subtitle: 'Live satellite and meteorological telemetry synchronized with your farm parcel geographic coordinates.',
      liveTelemetry: 'Live Meteorological Station',
      offlineMode: 'Standard Climatological Benchmark',
      currentCondition: 'Current Weather',
      temperature: 'Ambient Temperature',
      humidity: 'Relative Humidity',
      rainfall: '24h Precipitation',
      windSpeed: 'Wind Velocity',
      fiveDayForecast: '5-Day Agro-Meteorological Forecast',
      alertsTitle: 'Active Agricultural Weather Alerts',
      noAlerts: 'No adverse weather alerts at this time. Weather conditions are within standard operational limits.',
      rainProbability: 'Precipitation',
    },
    dashboard: {
      welcome: 'Welcome back',
      welcomeSub: 'Your farm profile and live meteorological metrics are synchronized. Select any of the six agricultural decision modules below.',
      sixToolsTitle: 'Agricultural Decision Modules',
      sixToolsSub: 'Direct shortcuts to each independent decision tool',
      viewTool: 'Open Feature →',
      quickSummary: 'Latest Farm Telemetry Highlights',
      topCrop: 'Top Recommended Crop',
      estYield: 'Estimated Harvest',
      waterNeed: 'Irrigation Status',
      pathogenRisk: 'Pathogen Risk',
    },
    common: {
      confirm: 'Confirm',
      cancel: 'Cancel',
      save: 'Save',
      edit: 'Edit',
      delete: 'Delete',
      loading: 'Loading...',
      success: 'Success',
      error: 'Error',
      hectares: 'Hectares',
      optimal: 'OPTIMAL',
      favorable: 'FAVORABLE',
      limiting: 'LIMITING',
      critical: 'CRITICAL',
      high: 'HIGH',
      medium: 'MEDIUM',
      low: 'LOW',
      allFarms: 'All Registered Farms',
      selectFarm: 'Select Farm',
      active: 'Active',
    },
    crops: {
      rice: 'Rice (Paddy)',
      maize: 'Maize (Corn)',
      chickpea: 'Chickpea (Gram)',
      kidneybeans: 'Kidney Beans (Rajma)',
      pigeonpeas: 'Pigeonpeas (Arhar / Red Gram)',
      mothbeans: 'Moth Beans',
      mungbean: 'Mung Bean (Green Gram)',
      blackgram: 'Black Gram (Urad)',
      lentil: 'Lentil (Masoor)',
      pomegranate: 'Pomegranate',
      banana: 'Banana',
      mango: 'Mango',
      grapes: 'Grapes',
      watermelon: 'Watermelon',
      muskmelon: 'Muskmelon',
      apple: 'Apple',
      orange: 'Orange',
      papaya: 'Papaya',
      coconut: 'Coconut',
      cotton: 'Cotton',
      jute: 'Jute',
      coffee: 'Coffee',
      wheat: 'Wheat',
      groundnut: 'Groundnut (Peanut)',
      sugarcane: 'Sugarcane',
      soybean: 'Soybean',
    },
    voice: {
      listen: 'Listen',
      stop: 'Stop',
      replay: 'Replay',
      voiceSettings: 'Voice Audio Controls',
      voiceOn: 'Voice Assistance Enabled',
      voiceOff: 'Voice Assistance Muted',
      speed: 'Speech Speed',
      speedSlow: 'Slow',
      speedNormal: 'Normal',
      speedFast: 'Fast',
      ariaListen: 'Listen to this content',
      ariaStop: 'Stop audio playback',
      ariaReplay: 'Replay audio explanation',
      nowPlaying: 'Speaking...',
      teluguUnavailable: 'Telugu speech synthesis voice is not installed on this browser/device. Please enable Telugu TTS in your system speech settings.',
      fieldHelp: {
        nitrogen: 'Available Nitrogen (N) is crucial for leafy vegetative growth and chlorophyll synthesis.',
        phosphorus: 'Phosphorus (P) stimulates early root establishment, tillering, and healthy seed formation.',
        potassium: 'Potassium (K) enhances drought resistance, cellular turgor, disease resilience, and grain quality.',
        ph: 'Soil pH indicates soil acidity or alkalinity. Most field crops thrive between 6.0 and 7.5.',
        moisture: 'Soil moisture is the volumetric water content in the root zone.',
        soilType: 'Soil texture dictates water holding capacity and nutrient retention.',
        area: 'Enter total cultivated parcel area in hectares.',
        crop: 'Select the target crop variety to evaluate.',
      },
    },
    admin: {
      title: 'Model Governance & Telemetry',
      subtitle: 'Production inference monitoring, model versions, and audit logs.',
      totalUsers: 'Total Users',
      totalFarms: 'Monitored Farms',
      totalPredictions: 'Inference Cycles',
      activeModels: 'Deployed Engines',
      modelRegistry: 'Deployed Model Version Registry',
      auditLogs: 'System Security & Audit Trail',
    },
  },

  // ==========================================
  // TELUGU TRANSLATIONS (తెలుగు)
  // ==========================================
  te: {
    appName: 'అగ్రివైజ్ (AgriWise)',
    tagline: 'రైతుల కోసం ఏఐ ఆధారిత స్మార్ట్ వ్యవసాయ నిర్ణయ సహాయక వ్యవస్థ',
    nav: {
      dashboard: 'డ్యాష్‌బోర్డ్',
      crop: '🌱 పంట సిఫార్సు',
      yield: '📈 దిగుబడి అంచనా',
      fertilizer: '🧪 ఎరువుల సిఫార్సు',
      irrigation: '💧 నీటిపారుదల సిఫార్సు',
      disease: '🦠 తెగుళ్ల ప్రమాదం',
      weather: '🌦️ వాతావరణం & హెచ్చరికలు',
      history: '📜 చరిత్ర',
      farms: '👤 పొలాలు & ప్రొఫైల్',
      soilReport: '🧪 నేల పరీక్ష నివేదిక',
      logout: 'లాగౌట్',
      login: 'లాగిన్',
    },
    soilReport: {
      title: 'నేల పరీక్ష నివేదిక అప్‌లోడ్',
      subtitle: 'మీ వ్యవసాయ ల్యాబ్ పరీక్ష నివేదిక లేదా సాయిల్ హెల్త్ కార్డ్‌ను (PDF, JPG, JPEG, PNG) అప్‌లోడ్ చేయండి. వ్యవస్థ మీ నేల పోషక విలువలను స్వయంచాలకంగా సంగ్రహిస్తుంది.',
      uploadBox: 'నేల పరీక్ష నివేదికను అప్‌లోడ్ చేయండి',
      dragDrop: 'మీ నివేదిక పత్రాన్ని ఇక్కడ లాగి వదలండి లేదా ఫైల్ ఎంచుకోవడానికి క్లిక్ చేయండి',
      chooseFile: 'ఫైల్ ఎంచుకోండి',
      supportedFormats: 'అనుకూల ఫైల్ రకాలు: PDF, JPG, JPEG, PNG (గరిష్టంగా 10MB)',
      sampleHeader: 'లేదా నమూనా రాష్ట్ర సాయిల్ హెల్త్ కార్డ్‌తో పరీక్షించండి:',
      sampleWarangal: 'తెలంగాణ (వరంగల్ వరి నేల కార్డ్)',
      sampleDeccan: 'దక్కన్ (నల్లరేగడి నేల కార్డ్)',
      samplePunjab: 'పంజాబ్ (ఒండ్రు నేల కార్డ్)',
      extracting: 'విజన్ ఏఐ మరియు ఓసీఆర్ ద్వారా నేల పోషక వివరాలను సంగ్రహిస్తోంది...',
      reviewTitle: 'నేల పరీక్ష నివేదిక ఫలితాలు',
      reviewInstruction: 'కొనసాగే ముందు దయచేసి ఈ విలువలను సరిచూసుకోండి.',
      paramCol: 'పోషకం / లక్షణం',
      valueCol: 'సంగ్రహించిన విలువ',
      statusCol: 'స్థితి',
      found: '✓ కనుగొనబడింది',
      notAvailable: '⚠️ లభ్యం కాలేదు',
      confirmBtn: '✅ ధృవీకరించి నేల ప్రొఫైల్‌ను భద్రపరచండి',
      editBtn: '✏️ విలువలను సవరించండి',
      uploadAgain: '🔄 మళ్లీ అప్‌లోడ్ చేయండి',
      confirmedSuccess: 'నేల నివేదిక ధృవీకరించబడింది మరియు మీ పొలం ప్రొఫైల్‌కు అనుసంధానించబడింది.',
      missingNotice: 'గమనిక: ఈ ల్యాబ్ నివేదికలో నేల తేమ సమాచారం లేదు. మీరు పొలంలో తేమ మీటర్ ద్వారా కొలిచి నీటిపారుదల విభాగంలో నమోదు చేయవచ్చు.',
      statusCard: 'నేల పరీక్ష స్థితి',
      reportUploadedConfirmed: '✅ నివేదిక అప్‌లోడ్ చేయబడింది & ధృవీకరించబడింది',
      reportNotUploaded: '⚠️ నేల నివేదిక ఇంకా అప్‌లోడ్ కాలేదు',
      viewProfile: 'నేల వివరాలను చూడండి / సవరించండి',
      uploadReportNow: '🧪 నేల పరీక్ష నివేదికను అప్‌లోడ్ చేయండి',
      lastUpdated: 'చివరిగా నవీకరించబడిన తేదీ',
      source: 'మూలం',
      labName: 'పరీక్షించిన ప్రయోగశాల',
    },
    cropPage: {
      title: '🌱 పంట సిఫార్సు',
      subtitle: 'మీ ధృవీకరించబడిన నేల పోషకాలు మరియు స్థానిక వాతావరణం ఆధారంగా అత్యంత అనుకూలమైన పంటలను సిఫార్సు చేసే శాస్త్రీయ పద్ధతి.',
      soilBanner: 'ధృవీకరించబడిన నేల ప్రొఫైల్',
      btnCalculate: 'పంట సిఫార్సును విశ్లేషించండి',
      calculating: 'ICAR పంట ప్రతిస్పందన నియమాల ఆధారంగా లెక్కిస్తోంది...',
      recommendedCrop: 'అత్యంత అనుకూలమైన పంట',
      calibratedConfidence: 'ఖచ్చితత్వ సంభావ్యత శాతం',
      alternatives: 'ఇతర అనుకూలమైన ప్రత్యామ్నాయ పంటలు',
      suitability: 'అనుకూలత',
      whyThisCrop: 'ఈ పంటను ఎందుకు సిఫార్సు చేసాము?',
      keyFactors: 'అనుకూలించే ముఖ్య నేల మరియు వాతావరణ అంశాలు',
      limitingFactors: 'గమనించవలసిన పరిమితులు / లోపాలు',
      parameterBreakdown: 'వివరమైన నేల పోషకాల సరిపోలిక పట్టిక',
      parameterCol: 'పోషకం / అంశం',
      yourValueCol: 'మీ నేలలోని విలువ',
      optimalRangeCol: 'ఆదర్శవంతమైన పరిధి',
      statusCol: 'సరిపోలిక స్థితి',
      emptyPrompt: 'మీ నేలకు ఏ పంట అత్యంత లాభదాయకమో తెలుసుకోవడానికి "పంట సిఫార్సును విశ్లేషించండి" బటన్ నొక్కండి.',
    },
    yieldPage: {
      title: '📈 దిగుబడి అంచనా',
      subtitle: 'నేల పోషకాలు, ఉష్ణోగ్రత, తేమ మరియు నేల రకం ఆధారంగా ఆశించిన పంట దిగుబడిని అంచనా వేసే బహుళ-చరరాశి శాస్త్రీయ పద్ధతి.',
      selectCrop: 'పండించదలచిన పంటను ఎంచుకోండి',
      areaLabel: 'సాగు విస్తీర్ణం (హెక్టార్లు)',
      btnCalculate: 'ఆశించిన దిగుబడిని అంచనా వేయండి',
      calculating: 'దిగుబడి సమీకరణాలను లెక్కిస్తోంది...',
      yieldPerHectare: 'హెక్టారుకు అంచనా వేసిన దిగుబడి',
      totalFarmYield: 'మొత్తం పొలంలో ఆశించిన పంట దిగుబడి',
      tonnesPerHa: 'టన్నులు / హెక్టారుకు',
      totalTonnes: 'టన్నులు',
      confidenceInterval: '90% ఖచ్చితత్వ గణాంక అంచనా పరిధి',
      influencingFactors: 'దిగుబడిని ప్రభావితం చేసే ముఖ్య అంశాలు',
      emptyPrompt: 'పంటను ఎంచుకుని "దిగుబడిని అంచనా వేయండి" బటన్ నొక్కండి.',
      modelTelemetry: 'మోడల్: బహుళ-చరరాశి అగ్రానమిక్ రిగ్రెషన్ (R²: 0.912, RMSE: ±0.49 t/ha)',
    },
    fertilizerPage: {
      title: '🧪 ఎరువుల సిఫార్సు',
      subtitle: 'భారతీయ వ్యవసాయ పరిశోధనా మండలి (ICAR) ప్రమాణాల ప్రకారం మీ నేలలోని నత్రజని, భాస్వరం, పొటాషియం లోటు ఆధారంగా ఖచ్చితమైన ఎరువుల మోతాదులు.',
      targetCrop: 'ఎరువులు వేయవలసిన పంట',
      btnCalculate: 'ఎరువుల మోతాదును లెక్కించండి',
      calculating: 'పోషక లోటు మోతాదులను లెక్కిస్తోంది...',
      nutrientStatus: 'నేలలోని ప్రధాన పోషకాల ప్రస్తుత స్థితి',
      nitrogen: 'నత్రజని (N)',
      phosphorus: 'భాస్వరం (P)',
      potassium: 'పొటాషియం (K)',
      ph: 'నేల పి హెచ్ (pH)',
      deficient: 'లోపం ఉంది (తక్కువ)',
      sufficient: 'సరిపడా ఉంది',
      prescriptions: 'సిఫార్సు చేసిన రసాయన మరియు సేంద్రీయ ఎరువుల వివరాలు',
      perHectare: 'హెక్టారుకు వేయాల్సిన మోతాదు',
      totalDose: 'మొత్తం పొలానికి అవసరమైన ఎరువులు',
      applicationTiming: 'వేసే పద్ధతి & అనువైన సమయం',
      soilAmendments: 'నేల సవరణ సిఫార్సులు (పి హెచ్ యాజమాన్యం)',
      ruleNotice: 'శాస్త్రీయ గమనిక: ఎరువుల మోతాదులు ICAR ప్రమాణాల ఆధారంగా రూపొందించిన శాస్త్రీయ లోటు నివారణ నియమాల ప్రకారం లెక్కించబడ్డాయి.',
      safetyNotice: 'భద్రతా సూచన: ఈ సిఫార్సులు రైతులకు నిర్ణయ సహాయం కొరకు మాత్రమే. రసాయన ఎరువులు వేసే ముందు స్థానిక వ్యవసాయ అధికారి లేదా కేవీకే శాస్త్రవేత్తలను సంప్రదించండి.',
      emptyPrompt: 'పంటను ఎంచుకుని మీ నేలకు సరిపడే ఖచ్చితమైన ఎరువుల మోతాదులను తెలుసుకోండి.',
    },
    irrigationPage: {
      title: '💧 నీటిపారుదల సిఫార్సు',
      subtitle: 'ఎఫ్‌ఏఓ-56 బాష్పీభవన సూత్రం మరియు రాబోయే 48 గంటల వర్ష సూచన ఆధారంగా నీరు పెట్టాలా వద్దా అనే ఖచ్చితమైన నిర్ణయం.',
      soilMoistureLabel: 'నేలలో ప్రస్తుత తేమ శాతం (%)',
      targetCrop: 'పంట రకం',
      btnCalculate: 'నీటి అవసరాన్ని అంచనా వేయండి',
      calculating: 'నేల తేమ క్షీణతను లెక్కిస్తోంది...',
      decisionStatus: 'నీటిపారుదల నిర్ణయం',
      needed: 'నీరు పెట్టడం తక్షణమే అవసరం',
      notNeeded: 'ప్రస్తుతం నీరు పెట్టవలసిన అవసరం లేదు (వాయిదా వేయవచ్చు)',
      urgency: 'తీవ్రత స్థాయి',
      suggestedTiming: 'నీరు పెట్టడానికి అనువైన సమయం',
      recommendedDepth: 'సిఫార్సు చేసిన నీటి లోతు',
      reasoning: 'తేమ నిల్వ మరియు ఆవిరి నష్టాల విశ్లేషణ',
      weatherConsideration: 'రాబోయే 48 గంటల వర్షపాత సూచన ప్రభావం',
      waterSavingTips: 'నీటి సంరక్షణ మరియు పొదుపు సూచనలు',
      emptyPrompt: 'నేల తేమను సరిచూసుకుని పంటకు నీరు పెట్టాలో లేదో తెలుసుకోండి.',
    },
    diseasePage: {
      title: '🦠 పైరు తెగుళ్ల ప్రమాదం',
      subtitle: 'ప్రస్తుత ఉష్ణోగ్రత, గాలిలో తేమ (>80%) మరియు వర్షం ఆధారంగా పంటకు వచ్చే వ్యాధికారక శిలీంధ్ర, బ్యాక్టీరియా తెగుళ్ల ప్రమాద అంచనా.',
      targetCrop: 'పరీక్షించవలసిన పంట',
      btnCalculate: 'తెగుళ్ల ప్రమాదాన్ని అంచనా వేయండి',
      calculating: 'సూక్ష్మ వాతావరణ తెగుళ్ల తీవ్రతను లెక్కిస్తోంది...',
      riskLevel: 'తెగుళ్ల ప్రమాద స్థాయి',
      severityScore: 'వాతావరణ తీవ్రత స్కోరు (0 - 100)',
      watchlistDiseases: 'వచ్చే అవకాశమున్న ముఖ్య తెగుళ్లు',
      pathogenType: 'వ్యాధికారక రకం',
      earlySymptoms: 'మొక్కలపై గమనించవలసిన ప్రారంభ లక్షణాలు',
      preventiveSteps: 'సిఫార్సు చేసిన సమగ్ర సస్యరక్షణ చర్యలు',
      scientificNotice: 'సస్యరక్షణ గమనిక: ఇది వాతావరణం ఆధారంగా తెగుళ్లు వచ్చే అవకాశాన్ని మాత్రమే సూచిస్తుంది; చేనును స్వయంగా పరిశీలించడం తప్పనిసరి.',
      emptyPrompt: 'వాతావరణం తెగుళ్లకు అనుకూలంగా ఉందో లేదో తెలుసుకోవడానికి బటన్ నొక్కండి.',
    },
    weatherPage: {
      title: '🌦️ వాతావరణం & వ్యవసాయ హెచ్చరికలు',
      subtitle: 'మీ పొలం ఉన్న ప్రాంతం ఆధారంగా ప్రత్యక్ష ఉపగ్రహ వాతావరణ సమాచారం మరియు ముందస్తు హెచ్చరికలు.',
      liveTelemetry: 'ప్రత్యక్ష వాతావరణ కేంద్రం',
      offlineMode: 'ప్రామాణిక వాతావరణ అంచనా',
      currentCondition: 'ప్రస్తుత వాతావరణం',
      temperature: 'ఉష్ణోగ్రత',
      humidity: 'గాలిలో తేమ',
      rainfall: '24 గంటల వర్షపాతం',
      windSpeed: 'గాలి వేగం',
      fiveDayForecast: '5 రోజుల వ్యవసాయ వాతావరణ సూచన',
      alertsTitle: 'ప్రస్తుత వ్యవసాయ వాతావరణ హెచ్చరికలు',
      noAlerts: 'ప్రస్తుతానికి ఎటువంటి ప్రతికూల వాతావరణ హెచ్చరికలు లేవు. వాతావరణం అనుకూలంగా ఉంది.',
      rainProbability: 'వర్షపాతం',
    },
    dashboard: {
      welcome: 'నమస్కారం',
      welcomeSub: 'మీ పొలం వివరాలు మరియు తాజా ఉపగ్రహ వాతావరణ సమాచారం సిద్ధంగా ఉన్నాయి. క్రింది ఆరు వ్యవసాయ సాధనాలలో దేనినైనా ఎంచుకోండి.',
      sixToolsTitle: 'ఆరు వ్యవసాయ నిర్ణయ సాధనాలు',
      sixToolsSub: 'ప్రతి వ్యవసాయ విభాగానికి ప్రత్యక్ష మార్గం',
      viewTool: 'విభాగంలోకి వెళ్ళండి →',
      quickSummary: 'తాజా నిర్ణయ ముఖ్యాంశాలు',
      topCrop: 'సిఫార్సు చేసిన పంట',
      estYield: 'అంచనా దిగుబడి',
      waterNeed: 'నీటి అవసరం',
      pathogenRisk: 'తెగుళ్ల ప్రమాదం',
    },
    common: {
      confirm: 'ధృవీకరించండి',
      cancel: 'రద్దు చేయండి',
      save: 'భద్రపరచండి',
      edit: 'సవరించండి',
      delete: 'తొలగించండి',
      loading: 'లోడ్ అవుతోంది...',
      success: 'విజయవంతం',
      error: 'లోపం సంభవించింది',
      hectares: 'హెక్టార్లు',
      optimal: 'ఆదర్శవంతం',
      favorable: 'అనుకూలం',
      limiting: 'పరిమితం / లోపం',
      critical: 'అత్యవసరం',
      high: 'ఎక్కువ',
      medium: 'మధ్యస్థం',
      low: 'తక్కువ',
      allFarms: 'అన్ని నమోదైన పొలాలు',
      selectFarm: 'పొలాన్ని ఎంచుకోండి',
      active: 'చురుకుగా ఉంది',
    },
    crops: {
      rice: 'వరి',
      maize: 'మొక్కజొన్న',
      chickpea: 'శనగలు',
      kidneybeans: 'రాజ్మా',
      pigeonpeas: 'కందులు',
      mothbeans: 'బొబ్బర్లు',
      mungbean: 'పెసలు',
      blackgram: 'మినుములు',
      lentil: 'మసూర్ పప్పు',
      pomegranate: 'దానిమ్మ',
      banana: 'అరటి',
      mango: 'మామిడి',
      grapes: 'ద్రాక్ష',
      watermelon: 'పుచ్చకాయ',
      muskmelon: 'ఖర్బూజ',
      apple: 'యాపిల్',
      orange: 'నారింజ',
      papaya: 'బొప్పాయి',
      coconut: 'కొబ్బరి',
      cotton: 'ప్రత్తి',
      jute: 'జనపనార',
      coffee: 'కాఫీ',
      wheat: 'గోధుమ',
      groundnut: 'వేరుశనగ',
      sugarcane: 'చెరకు',
      soybean: 'సోయాబీన్',
    },
    voice: {
      listen: 'వినండి',
      stop: 'ఆపండి',
      replay: 'మళ్లీ వినండి',
      voiceSettings: 'వాయిస్ సహాయక నియంత్రణలు',
      voiceOn: 'వాయిస్ సహాయం ఆన్‌లో ఉంది',
      voiceOff: 'వాయిస్ సహాయం మ్యూట్ చేయబడింది',
      speed: 'మాట్లాడే వేగం',
      speedSlow: 'నెమ్మదిగా',
      speedNormal: 'సాధారణం',
      speedFast: 'వేగంగా',
      ariaListen: 'ఈ విషయాన్ని వినండి',
      ariaStop: 'వాయిస్‌ను ఆపండి',
      ariaReplay: 'మళ్లీ వినండి',
      nowPlaying: 'మాట్లాడుతోంది...',
      teluguUnavailable: 'తెలుగు వాయిస్ మీ పరికరంలో అందుబాటులో లేదు. దయచేసి మీ సిస్టమ్ లేదా బ్రౌజర్ సెట్టింగ్స్‌లో తెలుగు వాయిస్‌ని ప్రారంభించండి.',
      fieldHelp: {
        nitrogen: 'నత్రజని (N) మొక్క ఏపుగా పెరగడానికి మరియు ఆకులు ఆకుపచ్చగా ఉండటానికి చాలా ముఖ్యం.',
        phosphorus: 'భాస్వరం (P) వేళ్ళు బలంగా పాతుకుపోవడానికి, పిలకలు వేయడానికి మరియు గింజ కట్టడానికి దోహదం చేస్తుంది.',
        potassium: 'పొటాషియం (K) పైరుకు రోగనిరోధక శక్తిని, కరువును తట్టుకునే శక్తిని మరియు గింజ బరువును పెంచుతుంది.',
        ph: 'నేల పి హెచ్ నేల యొక్క ఆమ్ల లేదా క్షార గుణాన్ని సూచిస్తుంది. 6.0 నుండి 7.5 ఉంటే పంటలకు చాలా మంచిది.',
        moisture: 'నేలలోని తేమ వేరు మండలంలో నీటి లభ్యతను తెలుపుతుంది.',
        soilType: 'నేల రకం నీటిని నిలుపుకునే సామర్థ్యాన్ని తెలియజేస్తుంది.',
        area: 'సాగు చేసే మొత్తం పొలం వైశాల్యం హెక్టార్లలో నమోదు చేయండి.',
        crop: 'పరిశీలించవలసిన పంట రకాన్ని ఎంచుకోండి.',
      },
    },
    admin: {
      title: 'మోడల్ నిర్వహణ & టెలిమెట్రీ',
      subtitle: 'వ్యవస్థ పనితీరు, మోడల్ వెర్షన్లు మరియు భద్రతా రికార్డులు.',
      totalUsers: 'మొత్తం వినియోగదారులు',
      totalFarms: 'పర్యవేక్షణలోని పొలాలు',
      totalPredictions: 'నిర్ణయ విశ్లేషణల సంఖ్య',
      activeModels: 'కార్యనిర్వహణలోని ఏఐ ఇంజిన్లు',
      modelRegistry: 'మోడల్ వెర్షన్ల రిజిస్ట్రీ',
      auditLogs: 'భద్రతా లాగ్‌లు',
    },
  },
};

/**
 * Utility helper to get translated crop name
 */
export function getTranslatedCropName(cropKeyOrName: string, lang: Language): string {
  if (!cropKeyOrName) return '';
  const key = cropKeyOrName.toLowerCase().replace(/[^a-z]/g, '');
  const t = translations[lang];

  for (const [k, v] of Object.entries(t.crops)) {
    if (key.includes(k) || k.includes(key)) {
      return v;
    }
  }

  // Fallback map
  if (lang === 'te') {
    if (key.includes('rice') || key.includes('paddy')) return 'వరి';
    if (key.includes('cotton')) return 'ప్రత్తి';
    if (key.includes('maize') || key.includes('corn')) return 'మొక్కజొన్న';
    if (key.includes('coffee')) return 'కాఫీ';
  }
  return cropKeyOrName;
}
