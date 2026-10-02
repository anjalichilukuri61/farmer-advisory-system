// src/components/FarmManagementView.tsx
import React, { useState } from 'react';
import { Sprout, Plus, MapPin, Layers, Calendar, Check, AlertCircle } from 'lucide-react';
import { Farm } from '../types/index.js';
import { api } from '../services/api.js';
import { Language, translations } from '../i18n/translations.js';
import { VoiceButton } from './VoiceButton.js';

interface FarmManagementViewProps {
  farms: Farm[];
  onFarmCreated: () => void;
  lang: Language;
}

export const FarmManagementView: React.FC<FarmManagementViewProps> = ({ farms, onFarmCreated, lang }) => {
  const t = translations[lang];
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [state, setState] = useState<string>('Telangana');
  const [district, setDistrict] = useState<string>('Warangal');
  const [areaHectares, setAreaHectares] = useState<number>(2.0);
  const [soilType, setSoilType] = useState<string>('Clay Loam');
  const [nitrogen, setNitrogen] = useState<number>(75);
  const [phosphorus, setPhosphorus] = useState<number>(45);
  const [potassium, setPotassium] = useState<number>(40);
  const [ph, setPh] = useState<number>(6.5);
  const [soilMoisture, setSoilMoisture] = useState<number>(40);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateFarm = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await api.createFarm({
        name,
        location,
        state,
        district,
        area_hectares: Number(areaHectares),
        profile: {
          soil_type: soilType,
          nitrogen: Number(nitrogen),
          phosphorus: Number(phosphorus),
          potassium: Number(potassium),
          ph: Number(ph),
          soil_moisture: Number(soilMoisture),
          water_source: 'Borewell & Canal',
          irrigation_type: 'Drip Irrigation',
          last_tested_date: new Date().toISOString().split('T')[0],
        },
      });

      setShowAddModal(false);
      setName('');
      setLocation('');
      onFarmCreated();
    } catch (err: any) {
      setError(err.message || 'Failed to create farm.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-bold text-stone-900 flex items-center space-x-2">
              <Sprout className="w-5 h-5 text-emerald-600" />
              <span>{t.nav.farms}</span>
            </h2>
            <VoiceButton
              id="farms_header_voice"
              textToSpeak={
                lang === 'te'
                  ? 'మీ నమోదు చేయబడిన వ్యవసాయ పొలాలు మరియు నేల వివరాలు. ఇక్కడ కొత్త పొలాన్ని నమోదు చేయవచ్చు లేదా ఉన్న పొలాల వివరాలను చూడవచ్చు.'
                  : 'Registered agricultural parcels and baseline soil profiles. You can add new farm plots or inspect monitored plots.'
              }
              lang={lang}
              variant="compact"
            />
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Registered agricultural parcels, baseline soil health cards, and GPS geographic coordinates.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Farm Parcel</span>
        </button>
      </div>

      {/* Farms List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {farms.map(farm => (
          <div key={farm.id} className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200">
            <div className="flex justify-between items-start pb-3 border-b border-stone-100">
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-base font-bold text-stone-900">{farm.name}</h3>
                  <VoiceButton
                    id={`farm_card_${farm.id}`}
                    textToSpeak={
                      lang === 'te'
                        ? `పొలం పేరు: ${farm.name}. ప్రాంతం: ${farm.location}. వైశాల్యం: ${farm.area_hectares} హెక్టార్లు. నేల రకం: ${farm.profile?.soil_type || 'సాధారణ నేల'}, పి హెచ్: ${farm.profile?.ph || 7}.`
                        : `Farm parcel: ${farm.name}, located in ${farm.location}. Area: ${farm.area_hectares} hectares. Soil type: ${farm.profile?.soil_type || 'Loam'}, pH: ${farm.profile?.ph || 7}.`
                    }
                    lang={lang}
                    variant="compact"
                    ariaLabel={lang === 'te' ? `${farm.name} వివరాలను వినండి` : `Listen to ${farm.name} details`}
                  />
                </div>
                <p className="text-xs text-stone-500 flex items-center space-x-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{farm.location}</span>
                </p>
              </div>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full">
                {farm.area_hectares} Hectares
              </span>
            </div>

            {farm.profile && (
              <div className="mt-4 space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-200">
                    <span className="text-stone-500 block text-[10px]">Soil Type:</span>
                    <span className="font-bold text-stone-800">{farm.profile.soil_type}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-200">
                    <span className="text-stone-500 block text-[10px]">Soil pH:</span>
                    <span className="font-bold text-stone-800">{farm.profile.ph}</span>
                  </div>
                </div>

                <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100">
                  <span className="text-[10px] font-bold text-stone-600 uppercase tracking-wider block mb-1">
                    Baseline Macronutrients (kg/ha):
                  </span>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <span className="text-[10px] text-stone-500 block">N</span>
                      <span className="font-bold text-stone-800">{farm.profile.nitrogen}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-500 block">P</span>
                      <span className="font-bold text-stone-800">{farm.profile.phosphorus}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-500 block">K</span>
                      <span className="font-bold text-stone-800">{farm.profile.potassium}</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between text-[11px] text-stone-500 pt-1">
                  <span>Last Soil Test: {farm.profile.last_tested_date}</span>
                  <span>Water: {farm.profile.water_source}</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Farm Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-4 border-b border-stone-100">
              <h3 className="text-base font-bold text-stone-900">Register New Farm Parcel</h3>
              <button onClick={() => setShowAddModal(false)} className="text-stone-400 hover:text-stone-700 font-bold">
                ✕
              </button>
            </div>

            {error && (
              <div className="my-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-2 text-xs text-red-700">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleCreateFarm} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Farm Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Green Valley Farm"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Location / Village</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Warangal Rural"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Area (Hectares)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    required
                    value={areaHectares}
                    onChange={e => setAreaHectares(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Soil Type</label>
                <select
                  value={soilType}
                  onChange={e => setSoilType(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value="Clay Loam">Clay Loam</option>
                  <option value="Loamy">Loamy Soil</option>
                  <option value="Black Cotton Soil">Black Cotton Soil</option>
                  <option value="Sandy Loam">Sandy Loam</option>
                  <option value="Alluvial Loam">Alluvial Loam</option>
                </select>
              </div>

              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
                <span className="font-bold text-stone-700 block">Baseline Soil Test Values:</span>
                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <label className="block text-[10px] text-stone-500 font-bold mb-1">N (kg/ha)</label>
                    <input
                      type="number"
                      value={nitrogen}
                      onChange={e => setNitrogen(Number(e.target.value))}
                      className="w-full px-2 py-1.5 rounded border border-stone-300"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-stone-500 font-bold mb-1">P (kg/ha)</label>
                    <input
                      type="number"
                      value={phosphorus}
                      onChange={e => setPhosphorus(Number(e.target.value))}
                      className="w-full px-2 py-1.5 rounded border border-stone-300"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-stone-500 font-bold mb-1">K (kg/ha)</label>
                    <input
                      type="number"
                      value={potassium}
                      onChange={e => setPotassium(Number(e.target.value))}
                      className="w-full px-2 py-1.5 rounded border border-stone-300"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-stone-500 font-bold mb-1">pH</label>
                    <input
                      type="number"
                      step="0.1"
                      value={ph}
                      onChange={e => setPh(Number(e.target.value))}
                      className="w-full px-2 py-1.5 rounded border border-stone-300"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold disabled:opacity-60"
                >
                  {loading ? 'Saving Farm...' : 'Save Farm Parcel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
