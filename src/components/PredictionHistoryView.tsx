// src/components/PredictionHistoryView.tsx
import React, { useState, useEffect } from 'react';
import { History, Search, Filter, Calendar, Sprout, ArrowRight, Eye, RefreshCw } from 'lucide-react';
import { PredictionRecord, Farm } from '../types/index.js';
import { api } from '../services/api.js';
import { Language, translations } from '../i18n/translations.js';
import { VoiceButton } from './VoiceButton.js';

interface PredictionHistoryViewProps {
  farms: Farm[];
  lang: Language;
}

export const PredictionHistoryView: React.FC<PredictionHistoryViewProps> = ({ farms, lang }) => {
  const t = translations[lang];
  const [predictions, setPredictions] = useState<PredictionRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedFarm, setSelectedFarm] = useState<string>('');
  const [detailModal, setDetailModal] = useState<PredictionRecord | null>(null);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const records = await api.getPredictions({
        farmId: selectedFarm || undefined,
        type: selectedType || undefined,
        limit: 50,
      });
      setPredictions(records);
    } catch (e) {
      console.error('Failed to load prediction history', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [selectedType, selectedFarm]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 mb-8">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-stone-100 gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <History className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-bold text-stone-900">{t.nav.history}</h2>
            <VoiceButton
              id="history_header_voice"
              textToSpeak={lang === 'te' ? 'గత వ్యవసాయ సిఫార్సుల రికార్డులు. ఇక్కడ మీరు మీ మునుపటి పంట, ఎరువులు మరియు దిగుబడి అంచనాలను పరిశీలించవచ్చు.' : 'Prediction history audit trail. Review previous recommendations, soil test inputs, and historical meteorological context.'}
              lang={lang}
              variant="compact"
            />
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Audit trail of verified recommendations, soil test inputs, and historical meteorological context.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Farm filter */}
          <select
            value={selectedFarm}
            onChange={e => setSelectedFarm(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
          >
            <option value="">All Monitored Farms</option>
            {farms.map(f => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>

          {/* Type filter */}
          <select
            value={selectedType}
            onChange={e => setSelectedType(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
          >
            <option value="">All Categories</option>
            <option value="COMPREHENSIVE">Comprehensive Advisory</option>
            <option value="CROP">Crop Recommendation</option>
            <option value="YIELD">Yield Prediction</option>
            <option value="FERTILIZER">Fertilizer Advisory</option>
            <option value="IRRIGATION">Irrigation Schedule</option>
            <option value="DISEASE">Disease Risk</option>
          </select>

          <button
            onClick={fetchHistory}
            className="p-1.5 text-stone-500 hover:text-stone-800 rounded-lg hover:bg-stone-100 transition-colors"
            title="Refresh records"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Table or Empty State */}
      {loading ? (
        <div className="py-16 text-center text-xs text-stone-500">
          <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <span>Loading historical prediction records...</span>
        </div>
      ) : predictions.length === 0 ? (
        <div className="py-16 text-center text-stone-500">
          <History className="w-10 h-10 text-stone-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-stone-700">No prediction records found.</p>
          <p className="text-xs text-stone-400 mt-1">Run an analysis in the Crop Advisory tab to generate records.</p>
        </div>
      ) : (
        <div className="overflow-x-auto mt-4">
          <table className="min-w-full divide-y divide-stone-200 text-xs">
            <thead className="bg-stone-50 text-stone-600">
              <tr>
                <th className="px-4 py-3 text-left font-bold">Date & Time</th>
                <th className="px-4 py-3 text-left font-bold">Category</th>
                <th className="px-4 py-3 text-left font-bold">Model Version</th>
                <th className="px-4 py-3 text-left font-bold">Key Recommendation</th>
                <th className="px-4 py-3 text-left font-bold">Confidence / Likelihood</th>
                <th className="px-4 py-3 text-right font-bold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-800">
              {predictions.map(record => {
                const dateStr = new Date(record.created_at).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });

                let summary = 'Advisory record';
                if (record.prediction_type === 'COMPREHENSIVE' && record.output_json?.cropRecommendation) {
                  summary = `${record.output_json.cropRecommendation.primaryCrop.cropName} (${record.output_json.yieldPrediction.yieldPerHectare} t/ha)`;
                } else if (record.prediction_type === 'CROP' && record.output_json?.primaryCrop) {
                  summary = record.output_json.primaryCrop.cropName;
                } else if (record.prediction_type === 'YIELD' && record.output_json?.yieldPerHectare) {
                  summary = `${record.output_json.cropName}: ${record.output_json.yieldPerHectare} ${record.output_json.unit}`;
                } else if (record.prediction_type === 'FERTILIZER') {
                  summary = `Nutrient Balance (${record.output_json.cropName})`;
                } else if (record.prediction_type === 'IRRIGATION') {
                  summary = record.output_json.isIrrigationNeeded ? 'Irrigation Needed' : 'Deferred';
                }

                return (
                  <tr key={record.id} className="hover:bg-stone-50/70 transition-colors">
                    <td className="px-4 py-3 text-stone-600 whitespace-nowrap">{dateStr}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-emerald-100 text-emerald-800">
                        {record.prediction_type}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-stone-500 whitespace-nowrap">
                      {record.model_version_id || 'mod_v2'}
                    </td>
                    <td className="px-4 py-3 font-medium text-stone-900">{summary}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {record.confidence_score !== null ? (
                        <span className="font-semibold text-emerald-700">
                          {(record.confidence_score * 100).toFixed(1)}%
                        </span>
                      ) : (
                        <span className="text-stone-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end space-x-2">
                        <VoiceButton
                          id={`hist_row_${record.id}`}
                          textToSpeak={
                            lang === 'te'
                              ? `తేదీ ${dateStr}. విభాగం: ${record.prediction_type}. సిఫార్సు: ${summary}.`
                              : `Record on ${dateStr}. Category: ${record.prediction_type}. Summary: ${summary}.`
                          }
                          lang={lang}
                          variant="compact"
                          ariaLabel={lang === 'te' ? 'ఈ రికార్డును వినండి' : 'Listen to record'}
                        />
                        <button
                          onClick={() => setDetailModal(record)}
                          className="p-1 rounded text-stone-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                          title="View Record JSON & Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Details Modal */}
      {detailModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl border border-stone-200 max-h-[85vh] flex flex-col">
            <div className="flex justify-between items-center pb-4 border-b border-stone-100">
              <h3 className="font-bold text-base text-stone-900">
                Prediction Record #{detailModal.id} ({detailModal.prediction_type})
              </h3>
              <button
                onClick={() => setDetailModal(null)}
                className="text-stone-400 hover:text-stone-700 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto py-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 bg-stone-50 rounded-xl">
                <div>
                  <span className="text-stone-500 block">Created At:</span>
                  <span className="font-bold text-stone-800">{detailModal.created_at}</span>
                </div>
                <div>
                  <span className="text-stone-500 block">Farm ID:</span>
                  <span className="font-mono text-stone-800">{detailModal.farm_id}</span>
                </div>
              </div>

              <div>
                <p className="font-bold text-stone-700 mb-1">Inputs Recorded:</p>
                <pre className="p-3 bg-stone-900 text-emerald-400 rounded-lg text-[11px] overflow-x-auto font-mono">
                  {JSON.stringify(detailModal.inputs_json, null, 2)}
                </pre>
              </div>

              <div>
                <p className="font-bold text-stone-700 mb-1">Outputs Generated:</p>
                <pre className="p-3 bg-stone-900 text-teal-300 rounded-lg text-[11px] overflow-x-auto font-mono">
                  {JSON.stringify(detailModal.output_json, null, 2)}
                </pre>
              </div>
            </div>

            <div className="pt-3 border-t border-stone-100 text-right">
              <button
                onClick={() => setDetailModal(null)}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-bold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
