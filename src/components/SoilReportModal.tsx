// src/components/SoilReportModal.tsx
import React, { useState, useRef } from 'react';
import {
  FileText,
  Upload,
  CheckCircle,
  AlertCircle,
  X,
  Edit2,
  RefreshCw,
  Sparkles,
  Layers,
  ArrowRight,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { api } from '../services/api.js';
import { Farm, FarmProfile } from '../types/index.js';
import { Language, translations } from '../i18n/translations.js';
import { VoiceButton } from './VoiceButton.js';

interface SoilReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  farm: Farm | null;
  lang: Language;
  onConfirmed: (profile: FarmProfile) => void;
}

export const SoilReportModal: React.FC<SoilReportModalProps> = ({
  isOpen,
  onClose,
  farm,
  lang,
  onConfirmed,
}) => {
  const t = translations[lang];
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<'UPLOAD' | 'EXTRACTING' | 'REVIEW'>('UPLOAD');
  const [reportId, setReportId] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [extractedData, setExtractedData] = useState<any>(null);

  // Editable parameters
  const [nitrogen, setNitrogen] = useState<number>(245);
  const [phosphorus, setPhosphorus] = useState<number>(18);
  const [potassium, setPotassium] = useState<number>(210);
  const [ph, setPh] = useState<number>(6.8);
  const [soilType, setSoilType] = useState<string>('Clay Loam');
  const [soilMoisture, setSoilMoisture] = useState<number>(40);
  const [organicCarbon, setOrganicCarbon] = useState<number>(0.72);
  const [electricalConductivity, setElectricalConductivity] = useState<number>(0.42);

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = async (file: File) => {
    setError(null);
    setLoading(true);
    setStep('EXTRACTING');
    setFileName(file.name);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = reader.result as string;
        try {
          const res = await api.extractSoilReport({
            file_data: base64Data,
            file_name: file.name,
            mime_type: file.type,
            farm_id: farm?.id,
          });

          populateExtracted(res.extractionResult, res.reportId, file.name);
          setStep('REVIEW');
        } catch (err: any) {
          setError(err.message || 'Failed to extract soil parameters.');
          setStep('UPLOAD');
        } finally {
          setLoading(false);
        }
      };
      reader.onerror = () => {
        setError('Error reading file.');
        setStep('UPLOAD');
        setLoading(false);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setError(err.message || 'Failed to upload report.');
      setStep('UPLOAD');
      setLoading(false);
    }
  };

  const handleSampleSelect = async (preset: 'warangal' | 'deccan' | 'punjab') => {
    setError(null);
    setLoading(true);
    setStep('EXTRACTING');

    let presetName = 'Warangal_Paddy_Soil_Health_Card.pdf';
    if (preset === 'deccan') presetName = 'Deccan_Black_Cotton_Soil_Card.pdf';
    if (preset === 'punjab') presetName = 'Punjab_Alluvial_Loam_Card.pdf';

    setFileName(presetName);

    try {
      const res = await api.extractSoilReport({
        sample_preset: preset,
        file_name: presetName,
        farm_id: farm?.id,
      });

      populateExtracted(res.extractionResult, res.reportId, presetName);
      setStep('REVIEW');
    } catch (err: any) {
      setError(err.message || 'Failed to extract sample card.');
      setStep('UPLOAD');
    } finally {
      setLoading(false);
    }
  };

  const populateExtracted = (data: any, repId: string, name: string) => {
    setExtractedData(data);
    setReportId(repId);
    setFileName(name);

    if (data.nitrogen !== undefined) setNitrogen(Number(data.nitrogen));
    if (data.phosphorus !== undefined) setPhosphorus(Number(data.phosphorus));
    if (data.potassium !== undefined) setPotassium(Number(data.potassium));
    if (data.ph !== undefined) setPh(Number(data.ph));
    if (data.soil_type) setSoilType(data.soil_type);
    if (data.soil_moisture !== undefined && data.soil_moisture !== null) {
      setSoilMoisture(Number(data.soil_moisture));
    }
    if (data.organic_carbon !== undefined) setOrganicCarbon(Number(data.organic_carbon));
    if (data.electrical_conductivity !== undefined) setElectricalConductivity(Number(data.electrical_conductivity));
  };

  const handleConfirm = async () => {
    if (!farm) return;
    setLoading(true);
    setError(null);

    try {
      const confirmedValues = {
        nitrogen: Number(nitrogen),
        phosphorus: Number(phosphorus),
        potassium: Number(potassium),
        ph: Number(ph),
        soil_type: soilType,
        soil_moisture: Number(soilMoisture),
        organic_carbon: Number(organicCarbon),
        electrical_conductivity: Number(electricalConductivity),
      };

      const res = await api.confirmSoilReport({
        report_id: reportId || undefined,
        farm_id: farm.id,
        confirmed_values: confirmedValues,
      });

      onConfirmed(res.profile);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save confirmed soil profile.');
    } finally {
      setLoading(false);
    }
  };

  const getReviewSpeech = () => {
    if (lang === 'te') {
      return `నేల పరీక్ష నివేదిక ఫలితాలు: నత్రజని ${nitrogen} కిలోలు ప్రతి హెక్టారుకు, భాస్వరం ${phosphorus} కిలోలు, పొటాషియం ${potassium} కిలోలు, పి హెచ్ ${ph}, నేల రకం ${soilType}. సేంద్రీయ కర్బనం ${organicCarbon} శాతం. కొనసాగే ముందు దయచేసి ఈ విలువలను సరిచూసుకుని ధృవీకరించండి.`;
    }
    return `Soil test report results: Available Nitrogen is ${nitrogen} kg/ha, Phosphorus is ${phosphorus} kg/ha, Potassium is ${potassium} kg/ha, pH is ${ph}, Soil texture is ${soilType}, and Organic Carbon is ${organicCarbon} percent. Please check these values and confirm.`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-stone-200 overflow-hidden my-6 animate-fadeIn">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white p-5 sm:p-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <FileText className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h3 className="text-lg font-bold">
                {step === 'REVIEW' ? t.soilReport.reviewTitle : t.soilReport.title}
              </h3>
              <p className="text-xs text-emerald-200 mt-0.5">
                {farm?.name || 'Farm'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="m-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: UPLOAD */}
        {step === 'UPLOAD' && (
          <div className="p-6 space-y-6">
            <div className="flex items-start justify-between gap-3">
              <p className="text-xs text-stone-600 leading-relaxed">
                {t.soilReport.subtitle}
              </p>
              <VoiceButton
                id="soil_upload_guide_voice"
                textToSpeak={
                  lang === 'te'
                    ? 'నేల పరీక్ష నివేదిక లేదా సాయిల్ హెల్త్ కార్డ్‌ను ఇక్కడ అప్‌లోడ్ చేయండి. మీ పత్రం నుండి నత్రజని, భాస్వరం, పొటాషియం మరియు పి హెచ్ విలువలు స్వయంచాలకంగా సేకరించబడతాయి.'
                    : 'Upload your soil test report or Soil Health Card here. The system will automatically extract your Nitrogen, Phosphorus, Potassium, and pH values.'
                }
                lang={lang}
                variant="compact"
              />
            </div>

            {/* Drop Zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-stone-300 hover:border-emerald-500 rounded-2xl p-8 text-center cursor-pointer bg-stone-50 hover:bg-emerald-50/40 transition-all group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/png,image/jpeg"
                className="hidden"
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file);
                }}
              />
              <div className="w-14 h-14 mx-auto rounded-2xl bg-white shadow-sm border border-stone-200 flex items-center justify-center group-hover:scale-105 transition-transform mb-3">
                <Upload className="w-6 h-6 text-emerald-700" />
              </div>
              <h4 className="text-sm font-bold text-stone-800 group-hover:text-emerald-900">
                {t.soilReport.uploadBox}
              </h4>
              <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                {t.soilReport.dragDrop}
              </p>
              <span className="inline-block mt-3 px-3 py-1 bg-white text-emerald-800 text-[11px] font-bold rounded-lg border border-stone-200 shadow-2xs">
                {t.soilReport.supportedFormats}
              </span>
            </div>

            {/* Sample Benchmark Soil Health Cards for Instant Evaluation */}
            <div className="pt-2">
              <p className="text-xs font-bold text-stone-700 mb-2.5">
                {t.soilReport.sampleHeader}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => handleSampleSelect('warangal')}
                  className="p-3 text-left rounded-xl border border-stone-200 hover:border-emerald-500 bg-white hover:bg-emerald-50/60 transition-all text-xs font-semibold cursor-pointer shadow-2xs"
                >
                  <span className="text-[10px] text-emerald-800 font-bold block uppercase tracking-wider">Telangana</span>
                  <span className="text-stone-900 font-bold block mt-0.5">{t.soilReport.sampleWarangal}</span>
                  <span className="text-[10px] text-stone-500 block mt-1">Clay Loam • Rice / Paddy</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSampleSelect('deccan')}
                  className="p-3 text-left rounded-xl border border-stone-200 hover:border-emerald-500 bg-white hover:bg-emerald-50/60 transition-all text-xs font-semibold cursor-pointer shadow-2xs"
                >
                  <span className="text-[10px] text-teal-800 font-bold block uppercase tracking-wider">Deccan Region</span>
                  <span className="text-stone-900 font-bold block mt-0.5">{t.soilReport.sampleDeccan}</span>
                  <span className="text-[10px] text-stone-500 block mt-1">Black Soil • Cotton</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSampleSelect('punjab')}
                  className="p-3 text-left rounded-xl border border-stone-200 hover:border-emerald-500 bg-white hover:bg-emerald-50/60 transition-all text-xs font-semibold cursor-pointer shadow-2xs"
                >
                  <span className="text-[10px] text-amber-800 font-bold block uppercase tracking-wider">Indo-Gangetic</span>
                  <span className="text-stone-900 font-bold block mt-0.5">{t.soilReport.samplePunjab}</span>
                  <span className="text-[10px] text-stone-500 block mt-1">Alluvial • Maize / Wheat</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: EXTRACTING SPINNER */}
        {step === 'EXTRACTING' && (
          <div className="p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-50 border-4 border-emerald-600 border-t-transparent animate-spin mx-auto"></div>
            <div>
              <h4 className="text-base font-bold text-stone-900">
                {t.soilReport.extracting}
              </h4>
              <p className="text-xs text-stone-500 mt-1">
                Reading {fileName} and identifying agronomic Soil Health Card parameters...
              </p>
            </div>
          </div>
        )}

        {/* STEP 3: EXTRACTION REVIEW SCREEN */}
        {step === 'REVIEW' && (
          <div className="p-5 sm:p-6 space-y-5">
            {/* Header info & Listen button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-stone-100 gap-3">
              <div>
                <p className="text-xs font-bold text-emerald-800 flex items-center space-x-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>{fileName}</span>
                </p>
                <p className="text-xs font-extrabold text-stone-900 mt-0.5">
                  {t.soilReport.reviewInstruction}
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <VoiceButton
                  id="soil_review_voice"
                  textToSpeak={getReviewSpeech()}
                  lang={lang}
                  variant="compact"
                  ariaLabel={lang === 'te' ? 'సంగ్రహించిన వివరాలను వినండి' : 'Listen to extracted values'}
                />
                <button
                  type="button"
                  onClick={() => setIsEditing(!isEditing)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold border transition-colors flex items-center space-x-1.5 cursor-pointer ${
                    isEditing
                      ? 'bg-amber-100 text-amber-900 border-amber-300'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200 border-stone-200'
                  }`}
                >
                  <Edit2 className="w-3 h-3" />
                  <span>{t.soilReport.editBtn}</span>
                </button>
              </div>
            </div>

            {/* Extraction Table (as explicitly required in prompt) */}
            <div className="overflow-x-auto rounded-xl border border-stone-200 shadow-2xs">
              <table className="min-w-full divide-y divide-stone-200 text-xs">
                <thead className="bg-stone-50 text-stone-600 font-bold">
                  <tr>
                    <th className="px-4 py-3 text-left">{t.soilReport.paramCol}</th>
                    <th className="px-4 py-3 text-left">{t.soilReport.valueCol}</th>
                    <th className="px-4 py-3 text-right">{t.soilReport.statusCol}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 bg-white">
                  {/* Nitrogen */}
                  <tr className="hover:bg-stone-50/50">
                    <td className="px-4 py-3 font-semibold text-stone-800">
                      {lang === 'te' ? 'లభ్య నత్రజని (N)' : 'Available Nitrogen (N)'}
                    </td>
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <div className="flex items-center space-x-1.5">
                          <input
                            type="number"
                            value={nitrogen}
                            onChange={e => setNitrogen(Number(e.target.value))}
                            className="w-24 px-2 py-1 border border-stone-300 rounded text-xs font-bold"
                          />
                          <span className="text-stone-500">kg/ha</span>
                        </div>
                      ) : (
                        <span className="font-extrabold text-stone-900">{nitrogen} kg/ha</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800">
                        {t.soilReport.found}
                      </span>
                    </td>
                  </tr>

                  {/* Phosphorus */}
                  <tr className="hover:bg-stone-50/50">
                    <td className="px-4 py-3 font-semibold text-stone-800">
                      {lang === 'te' ? 'లభ్య భాస్వరం (P)' : 'Available Phosphorus (P)'}
                    </td>
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <div className="flex items-center space-x-1.5">
                          <input
                            type="number"
                            value={phosphorus}
                            onChange={e => setPhosphorus(Number(e.target.value))}
                            className="w-24 px-2 py-1 border border-stone-300 rounded text-xs font-bold"
                          />
                          <span className="text-stone-500">kg/ha</span>
                        </div>
                      ) : (
                        <span className="font-extrabold text-stone-900">{phosphorus} kg/ha</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800">
                        {t.soilReport.found}
                      </span>
                    </td>
                  </tr>

                  {/* Potassium */}
                  <tr className="hover:bg-stone-50/50">
                    <td className="px-4 py-3 font-semibold text-stone-800">
                      {lang === 'te' ? 'లభ్య పొటాషియం (K)' : 'Available Potassium (K)'}
                    </td>
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <div className="flex items-center space-x-1.5">
                          <input
                            type="number"
                            value={potassium}
                            onChange={e => setPotassium(Number(e.target.value))}
                            className="w-24 px-2 py-1 border border-stone-300 rounded text-xs font-bold"
                          />
                          <span className="text-stone-500">kg/ha</span>
                        </div>
                      ) : (
                        <span className="font-extrabold text-stone-900">{potassium} kg/ha</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800">
                        {t.soilReport.found}
                      </span>
                    </td>
                  </tr>

                  {/* pH */}
                  <tr className="hover:bg-stone-50/50">
                    <td className="px-4 py-3 font-semibold text-stone-800">
                      {lang === 'te' ? 'నేల పి హెచ్ (pH)' : 'Soil Reaction (pH)'}
                    </td>
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <div className="flex items-center space-x-1.5">
                          <input
                            type="number"
                            step="0.1"
                            value={ph}
                            onChange={e => setPh(Number(e.target.value))}
                            className="w-24 px-2 py-1 border border-stone-300 rounded text-xs font-bold"
                          />
                        </div>
                      ) : (
                        <span className="font-extrabold text-stone-900">{ph}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800">
                        {t.soilReport.found}
                      </span>
                    </td>
                  </tr>

                  {/* Organic Carbon */}
                  <tr className="hover:bg-stone-50/50">
                    <td className="px-4 py-3 font-semibold text-stone-800">
                      {lang === 'te' ? 'సేంద్రీయ కర్బనం (OC)' : 'Organic Carbon (OC)'}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-extrabold text-stone-900">{organicCarbon}%</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800">
                        {t.soilReport.found}
                      </span>
                    </td>
                  </tr>

                  {/* Electrical Conductivity */}
                  <tr className="hover:bg-stone-50/50">
                    <td className="px-4 py-3 font-semibold text-stone-800">
                      {lang === 'te' ? 'విద్యుత్ వాహకత (EC)' : 'Electrical Conductivity (EC)'}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-extrabold text-stone-900">{electricalConductivity} dS/m</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800">
                        {t.soilReport.found}
                      </span>
                    </td>
                  </tr>

                  {/* Soil Type */}
                  <tr className="hover:bg-stone-50/50">
                    <td className="px-4 py-3 font-semibold text-stone-800">
                      {lang === 'te' ? 'నేల రకం' : 'Soil Texture'}
                    </td>
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <select
                          value={soilType}
                          onChange={e => setSoilType(e.target.value)}
                          className="px-2 py-1 border border-stone-300 rounded text-xs font-bold"
                        >
                          <option value="Clay Loam">Clay Loam (బంక నేల)</option>
                          <option value="Black Cotton Soil">Black Cotton Soil (నల్లరేగడి నేల)</option>
                          <option value="Sandy Loam">Sandy Loam (ఇసుక నేల)</option>
                          <option value="Alluvial Loam">Alluvial Loam (ఒండ్రు నేల)</option>
                          <option value="Red Sandy Loam">Red Sandy Loam (ఎర్ర నేల)</option>
                        </select>
                      ) : (
                        <span className="font-extrabold text-stone-900">{soilType}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800">
                        {t.soilReport.found}
                      </span>
                    </td>
                  </tr>

                  {/* Soil Moisture (As required by spec: show status ⚠️ not available) */}
                  <tr className="bg-amber-50/40">
                    <td className="px-4 py-3 font-semibold text-stone-800">
                      {lang === 'te' ? 'నేల తేమ' : 'Soil Moisture'}
                    </td>
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <div className="flex items-center space-x-1.5">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={soilMoisture}
                            onChange={e => setSoilMoisture(Number(e.target.value))}
                            className="w-20 px-2 py-1 border border-stone-300 rounded text-xs font-bold"
                          />
                          <span className="text-stone-500">%</span>
                        </div>
                      ) : (
                        <span className="text-stone-600 font-medium">
                          {soilMoisture}% (Sensor estimate)
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-900">
                        {t.soilReport.notAvailable}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Missing notice as specified in prompt */}
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p>{t.soilReport.missingNotice}</p>
            </div>

            {/* Action Buttons: Confirm, Edit, Upload Again */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setStep('UPLOAD');
                  setIsEditing(false);
                }}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center space-x-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{t.soilReport.uploadAgain}</span>
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={handleConfirm}
                className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center space-x-2 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>{loading ? t.common.loading : t.soilReport.confirmBtn}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
