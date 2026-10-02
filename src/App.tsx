// src/App.tsx
import React, { useState, useEffect } from 'react';
import { Navbar, TabType } from './components/Navbar.js';
import { DashboardView } from './components/DashboardView.js';
import { CropRecommendationView } from './components/CropRecommendationView.js';
import { YieldPredictionView } from './components/YieldPredictionView.js';
import { FertilizerRecommendationView } from './components/FertilizerRecommendationView.js';
import { IrrigationRecommendationView } from './components/IrrigationRecommendationView.js';
import { DiseaseRiskView } from './components/DiseaseRiskView.js';
import { WeatherAlertsView } from './components/WeatherAlertsView.js';
import { PredictionHistoryView } from './components/PredictionHistoryView.js';
import { FarmManagementView } from './components/FarmManagementView.js';
import { AdminConsole } from './components/AdminConsole.js';
import { AuthModal } from './components/AuthModal.js';
import { SoilReportModal } from './components/SoilReportModal.js';
import { VoiceSettingsBar } from './components/VoiceSettingsBar.js';
import { TTSProvider, useTTS } from './context/TTSContext.js';
import { api } from './services/api.js';
import { User, Farm, FarmProfile, WeatherData } from './types/index.js';
import { Language, translations } from './i18n/translations.js';
import { CheckCircle2, AlertTriangle, Sprout, VolumeX, X } from 'lucide-react';

function AgriWiseApp() {
  const [lang, setLangState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('agriwise_lang');
      if (saved === 'te' || saved === 'en') return saved;
    }
    return 'en';
  });

  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [user, setUser] = useState<User | null>(null);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [selectedFarmId, setSelectedFarmId] = useState<string>('');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState<boolean>(false);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [soilModalOpen, setSoilModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const { voiceWarning, dismissVoiceWarning } = useTTS();
  const t = translations[lang];

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('agriwise_lang', newLang);
    }
    if (user) {
      api.updateUserLanguage(newLang);
    }
  };

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Initial authentication & farm list hydration
  useEffect(() => {
    const initApp = async () => {
      try {
        let currentUser: User | null = null;
        if (api.getToken()) {
          try {
            currentUser = await api.getMe();
            setUser(currentUser);
            if (currentUser.preferred_language === 'te' || currentUser.preferred_language === 'en') {
              setLangState(currentUser.preferred_language);
            }
          } catch (e) {
            api.clearToken();
          }
        }

        // Automatic demo login for instant access and testing
        if (!currentUser) {
          try {
            const demo = await api.login('farmer@agriwise.org', 'farmer123');
            currentUser = demo.user;
            setUser(currentUser);
          } catch (e) {
            // fallback
          }
        }

        await loadFarms();
      } catch (err) {
        console.error('App init error:', err);
      }
    };

    initApp();
  }, []);

  const loadFarms = async () => {
    try {
      const farmList = await api.getFarms();
      setFarms(farmList);
      if (farmList.length > 0 && !selectedFarmId) {
        setSelectedFarmId(farmList[0].id);
      }
    } catch (e) {
      console.error('Error fetching farms', e);
    }
  };

  const activeFarm = farms.find(f => f.id === selectedFarmId) || farms[0] || null;

  // Refresh weather when active farm changes
  useEffect(() => {
    if (activeFarm) {
      setWeatherLoading(true);
      api
        .getWeather(activeFarm.latitude, activeFarm.longitude, activeFarm.location)
        .then(wx => setWeather(wx))
        .catch(err => console.error('Weather error:', err))
        .finally(() => setWeatherLoading(false));
    }
  }, [selectedFarmId, farms]);

  const handleSoilProfileUpdated = (updatedProfile: FarmProfile) => {
    setFarms(prev =>
      prev.map(f => {
        if (f.id === (activeFarm?.id || updatedProfile.farm_id)) {
          return { ...f, profile: updatedProfile };
        }
        return f;
      })
    );
    showToast(t.soilReport.confirmedSuccess);
  };

  return (
    <div className="min-h-screen bg-stone-100/70 text-stone-900 flex flex-col font-sans selection:bg-emerald-200 pb-16 xl:pb-0">
      {/* Navigation Header */}
      <Navbar
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        lang={lang}
        setLang={setLang}
        farms={farms}
        selectedFarmId={selectedFarmId}
        setSelectedFarmId={setSelectedFarmId}
        onOpenAuth={() => setAuthModalOpen(true)}
        onLogout={() => {
          api.clearToken();
          setUser(null);
          showToast(lang === 'te' ? 'లాగౌట్ అయ్యారు.' : 'Signed out of AgriWise.');
        }}
        onOpenSoilModal={() => setSoilModalOpen(true)}
      />

      {/* Global Voice Assistance Controls & Audio Bar */}
      <VoiceSettingsBar lang={lang} />

      {/* Missing Telugu Voice Warning Toast */}
      {voiceWarning && (
        <div className="bg-amber-100 border-b border-amber-300 text-amber-950 px-4 py-2.5 text-xs flex items-center justify-between shadow-xs">
          <div className="flex items-center space-x-2">
            <VolumeX className="w-4 h-4 text-amber-700 shrink-0" />
            <span className="font-semibold">{voiceWarning}</span>
          </div>
          <button
            type="button"
            onClick={dismissVoiceWarning}
            className="p-1 text-amber-800 hover:text-black cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Global Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 sm:bottom-8 right-4 sm:right-8 z-50 animate-bounce">
          <div
            className={`px-4 py-3 rounded-2xl shadow-xl border flex items-center space-x-2.5 text-xs font-bold ${
              toastMessage.type === 'success'
                ? 'bg-emerald-950 text-emerald-100 border-emerald-700'
                : 'bg-red-950 text-red-100 border-red-700'
            }`}
          >
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-300" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* TAB 0: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <DashboardView
            user={user}
            farm={activeFarm}
            weather={weather}
            lang={lang}
            onNavigate={tab => setActiveTab(tab as TabType)}
            onOpenUpload={() => setSoilModalOpen(true)}
          />
        )}

        {/* TAB 1: 🌱 CROP RECOMMENDATION */}
        {activeTab === 'crop' && (
          <CropRecommendationView
            farm={activeFarm}
            weather={weather}
            lang={lang}
            onOpenUpload={() => setSoilModalOpen(true)}
          />
        )}

        {/* TAB 2: 📈 YIELD PREDICTION */}
        {activeTab === 'yield' && (
          <YieldPredictionView
            farm={activeFarm}
            weather={weather}
            lang={lang}
            onOpenUpload={() => setSoilModalOpen(true)}
          />
        )}

        {/* TAB 3: 🧪 FERTILIZER RECOMMENDATION */}
        {activeTab === 'fertilizer' && (
          <FertilizerRecommendationView
            farm={activeFarm}
            lang={lang}
            onOpenUpload={() => setSoilModalOpen(true)}
          />
        )}

        {/* TAB 4: 💧 IRRIGATION RECOMMENDATION */}
        {activeTab === 'irrigation' && (
          <IrrigationRecommendationView
            farm={activeFarm}
            weather={weather}
            lang={lang}
            onOpenUpload={() => setSoilModalOpen(true)}
          />
        )}

        {/* TAB 5: 🦠 DISEASE RISK */}
        {activeTab === 'disease' && (
          <DiseaseRiskView
            farm={activeFarm}
            weather={weather}
            lang={lang}
          />
        )}

        {/* TAB 6: 🌦️ WEATHER & ALERTS */}
        {activeTab === 'weather' && (
          <WeatherAlertsView
            weather={weather}
            loading={weatherLoading}
            lang={lang}
          />
        )}

        {/* TAB 7: 📜 PREDICTION HISTORY */}
        {activeTab === 'history' && (
          <PredictionHistoryView
            farms={farms}
            lang={lang}
          />
        )}

        {/* TAB 8: 👤 FARMS & PROFILE */}
        {activeTab === 'farms' && (
          <FarmManagementView
            farms={farms}
            onFarmCreated={() => {
              loadFarms();
              showToast(lang === 'te' ? 'పొలం నమోదు చేయబడింది.' : 'Farm parcel registered successfully.');
            }}
            lang={lang}
          />
        )}

        {/* TAB 9: ADMIN & MODEL MANAGEMENT */}
        {activeTab === 'admin' && (
          <AdminConsole lang={lang} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-stone-900 text-stone-400 text-xs py-8 border-t border-stone-800 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center space-x-2">
              <Sprout className="w-4 h-4 text-emerald-500" />
              <span className="font-bold text-stone-200">
                {t.appName} — {t.tagline}
              </span>
            </div>
            <div className="flex items-center space-x-4 text-[11px]">
              <span>{lang === 'te' ? 'వాయిస్ సహాయం సిద్ధంగా ఉంది' : 'Voice Assistance Active'}</span>
              <span>ICAR Benchmark</span>
              <span>FAO-56 Water Balance</span>
              <span>Open-Meteo High Resolution</span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-stone-800 text-[10px] text-stone-400 text-center sm:text-left leading-relaxed">
            {lang === 'te'
              ? 'వ్యవసాయ భద్రతా గమనిక: అగ్రివైజ్ అనేది రైతులకు నిర్ణయ సహాయక వేదిక. రసాయన ఎరువులు లేదా పురుగుమందులు వాడే ముందు స్థానిక వ్యవసాయ అధికారి లేదా కేవీకే శాస్త్రవేత్తలను సంప్రదించండి.'
              : 'Agricultural Decision Notice: AgriWise provides scientific decision support. Always consult local agricultural extension specialists and perform regular laboratory soil testing before major chemical inputs.'}
          </div>
        </div>
      </footer>

      {/* Soil Test Report Upload Modal */}
      <SoilReportModal
        isOpen={soilModalOpen}
        onClose={() => setSoilModalOpen(false)}
        farm={activeFarm}
        lang={lang}
        onConfirmed={handleSoilProfileUpdated}
      />

      {/* User Authentication Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={u => {
          setUser(u);
          loadFarms();
          if (u.preferred_language === 'te' || u.preferred_language === 'en') {
            setLangState(u.preferred_language);
          }
          showToast(`${lang === 'te' ? 'స్వాగతం' : 'Welcome back'}, ${u.name}!`);
        }}
        lang={lang}
      />
    </div>
  );
}

export default function App() {
  return (
    <TTSProvider>
      <AgriWiseApp />
    </TTSProvider>
  );
}
