// src/components/Navbar.tsx
import React, { useState } from 'react';
import {
  Sprout,
  TrendingUp,
  FlaskConical,
  Droplets,
  Bug,
  Sun,
  History,
  Shield,
  LogOut,
  LogIn,
  ChevronDown,
  MapPin,
  Globe,
  FileText,
  Menu,
  X,
  User as UserIcon,
  LayoutDashboard,
} from 'lucide-react';
import { User, Farm } from '../types/index.js';
import { Language, translations } from '../i18n/translations.js';

export type TabType =
  | 'dashboard'
  | 'crop'
  | 'yield'
  | 'fertilizer'
  | 'irrigation'
  | 'disease'
  | 'weather'
  | 'farms'
  | 'history'
  | 'admin';

interface NavbarProps {
  user: User | null;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  lang: Language;
  setLang: (lang: Language) => void;
  farms: Farm[];
  selectedFarmId: string;
  setSelectedFarmId: (id: string) => void;
  onOpenAuth: () => void;
  onLogout: () => void;
  onOpenSoilModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  activeTab,
  setActiveTab,
  lang,
  setLang,
  farms,
  selectedFarmId,
  setSelectedFarmId,
  onOpenAuth,
  onLogout,
  onOpenSoilModal,
}) => {
  const t = translations[lang];
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const navItems = [
    { id: 'dashboard', label: t.nav.dashboard, icon: LayoutDashboard },
    { id: 'crop', label: t.nav.crop, icon: Sprout },
    { id: 'yield', label: t.nav.yield, icon: TrendingUp },
    { id: 'fertilizer', label: t.nav.fertilizer, icon: FlaskConical },
    { id: 'irrigation', label: t.nav.irrigation, icon: Droplets },
    { id: 'disease', label: t.nav.disease, icon: Bug },
    { id: 'weather', label: t.nav.weather, icon: Sun },
    { id: 'history', label: t.nav.history, icon: History },
    { id: 'farms', label: t.nav.farms, icon: UserIcon },
  ];

  return (
    <header className="sticky top-0 z-50 bg-emerald-950 text-white shadow-md border-b border-emerald-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Product Title */}
          <div
            className="flex items-center space-x-3 cursor-pointer shrink-0"
            onClick={() => setActiveTab('dashboard')}
          >
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-md">
              <Sprout className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-black text-xl tracking-tight text-white">{t.appName}</span>
                <span className="text-[10px] font-bold bg-emerald-800 text-emerald-200 px-2 py-0.5 rounded-full border border-emerald-700 uppercase tracking-wider hidden sm:inline-block">
                  DSS
                </span>
              </div>
              <p className="text-[11px] text-emerald-300 hidden lg:block truncate max-w-xs opacity-90">
                {t.tagline}
              </p>
            </div>
          </div>

          {/* Desktop Direct Links for Six Main Tools */}
          <nav className="hidden xl:flex items-center space-x-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-emerald-100 hover:bg-emerald-900/80'
              }`}
            >
              {t.nav.dashboard}
            </button>

            <button
              onClick={() => setActiveTab('crop')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'crop'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-emerald-100 hover:bg-emerald-900/80'
              }`}
            >
              {t.nav.crop}
            </button>

            <button
              onClick={() => setActiveTab('yield')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'yield'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-emerald-100 hover:bg-emerald-900/80'
              }`}
            >
              {t.nav.yield}
            </button>

            <button
              onClick={() => setActiveTab('fertilizer')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'fertilizer'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-emerald-100 hover:bg-emerald-900/80'
              }`}
            >
              {t.nav.fertilizer}
            </button>

            <button
              onClick={() => setActiveTab('irrigation')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'irrigation'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-emerald-100 hover:bg-emerald-900/80'
              }`}
            >
              {t.nav.irrigation}
            </button>

            <button
              onClick={() => setActiveTab('disease')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'disease'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-emerald-100 hover:bg-emerald-900/80'
              }`}
            >
              {t.nav.disease}
            </button>

            <button
              onClick={() => setActiveTab('weather')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'weather'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-emerald-100 hover:bg-emerald-900/80'
              }`}
            >
              {t.nav.weather}
            </button>
          </nav>

          {/* Right Action Bar */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Quick Soil Report Upload Button */}
            <button
              type="button"
              onClick={onOpenSoilModal}
              className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-emerald-950 font-bold rounded-xl text-xs shadow-xs transition-all cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{t.soilReport.uploadBox}</span>
            </button>

            {/* Farm Selector */}
            {user && farms.length > 0 && (
              <div className="relative hidden md:flex items-center bg-emerald-900/90 border border-emerald-700/80 rounded-xl px-2.5 py-1.5 text-xs text-emerald-200">
                <MapPin className="w-3.5 h-3.5 mr-1.5 text-emerald-400 shrink-0" />
                <select
                  value={selectedFarmId}
                  onChange={e => setSelectedFarmId(e.target.value)}
                  className="bg-transparent text-emerald-100 font-bold focus:outline-none cursor-pointer pr-3 max-w-[130px] truncate"
                >
                  {farms.map(f => (
                    <option key={f.id} value={f.id} className="bg-emerald-950 text-white">
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Language Selector (Instant Switch + Persistence) */}
            <div className="flex items-center bg-emerald-900/90 border border-emerald-700/80 rounded-xl px-2 py-1 text-xs">
              <Globe className="w-3.5 h-3.5 mr-1 text-emerald-400 shrink-0" />
              <select
                value={lang}
                onChange={e => setLang(e.target.value as Language)}
                aria-label="Select Language"
                className="bg-transparent text-emerald-100 font-extrabold focus:outline-none cursor-pointer pr-1"
              >
                <option value="en" className="bg-emerald-950 text-white">
                  🇬🇧 English
                </option>
                <option value="te" className="bg-emerald-950 text-white">
                  🇮🇳 తెలుగు
                </option>
              </select>
            </div>

            {/* Auth Action */}
            {user ? (
              <button
                type="button"
                onClick={onLogout}
                className="p-1.5 text-emerald-200 hover:text-white hover:bg-emerald-800 rounded-xl transition-colors cursor-pointer"
                title={t.nav.logout}
              >
                <LogOut className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={onOpenAuth}
                className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                {t.nav.login}
              </button>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-1.5 text-emerald-200 hover:text-white hover:bg-emerald-800 rounded-xl transition-colors cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-emerald-900 border-t border-emerald-800 px-4 pt-3 pb-5 space-y-2 animate-fadeIn">
          {/* Quick upload in mobile drawer */}
          <button
            type="button"
            onClick={() => {
              onOpenSoilModal();
              setMobileMenuOpen(false);
            }}
            className="w-full mb-3 flex items-center justify-center space-x-2 py-2.5 bg-emerald-500 text-emerald-950 rounded-xl text-xs font-extrabold shadow-sm"
          >
            <FileText className="w-4 h-4" />
            <span>{t.soilReport.uploadBox}</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id as TabType);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center space-x-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                    isActive
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'text-emerald-100 hover:bg-emerald-800/80'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0 text-emerald-300" />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Mobile Bottom Quick-Access Dock for the Six Core Tools */}
      <div className="xl:hidden fixed bottom-0 left-0 right-0 z-40 bg-emerald-950/95 backdrop-blur-md border-t border-emerald-800/80 px-2 py-1.5 flex items-center justify-around shadow-2xl">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-bold ${
            activeTab === 'dashboard' ? 'text-emerald-300' : 'text-emerald-200/70'
          }`}
        >
          <LayoutDashboard className="w-4 h-4 mb-0.5" />
          <span>{lang === 'te' ? 'హోమ్' : 'Home'}</span>
        </button>

        <button
          onClick={() => setActiveTab('crop')}
          className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-bold ${
            activeTab === 'crop' ? 'text-emerald-300' : 'text-emerald-200/70'
          }`}
        >
          <Sprout className="w-4 h-4 mb-0.5" />
          <span>{lang === 'te' ? 'పంట' : 'Crop'}</span>
        </button>

        <button
          onClick={() => setActiveTab('yield')}
          className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-bold ${
            activeTab === 'yield' ? 'text-emerald-300' : 'text-emerald-200/70'
          }`}
        >
          <TrendingUp className="w-4 h-4 mb-0.5" />
          <span>{lang === 'te' ? 'దిగుబడి' : 'Yield'}</span>
        </button>

        <button
          onClick={() => setActiveTab('fertilizer')}
          className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-bold ${
            activeTab === 'fertilizer' ? 'text-emerald-300' : 'text-emerald-200/70'
          }`}
        >
          <FlaskConical className="w-4 h-4 mb-0.5" />
          <span>{lang === 'te' ? 'ఎరువులు' : 'Fertilizer'}</span>
        </button>

        <button
          onClick={() => setActiveTab('irrigation')}
          className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-bold ${
            activeTab === 'irrigation' ? 'text-emerald-300' : 'text-emerald-200/70'
          }`}
        >
          <Droplets className="w-4 h-4 mb-0.5" />
          <span>{lang === 'te' ? 'నీరు' : 'Water'}</span>
        </button>

        <button
          onClick={() => setActiveTab('disease')}
          className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-bold ${
            activeTab === 'disease' ? 'text-emerald-300' : 'text-emerald-200/70'
          }`}
        >
          <Bug className="w-4 h-4 mb-0.5" />
          <span>{lang === 'te' ? 'తెగుళ్లు' : 'Disease'}</span>
        </button>

        <button
          onClick={() => setActiveTab('weather')}
          className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-bold ${
            activeTab === 'weather' ? 'text-emerald-300' : 'text-emerald-200/70'
          }`}
        >
          <Sun className="w-4 h-4 mb-0.5" />
          <span>{lang === 'te' ? 'వాతావరణం' : 'Weather'}</span>
        </button>
      </div>
    </header>
  );
};
