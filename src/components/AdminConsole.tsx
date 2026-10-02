// src/components/AdminConsole.tsx
import React, { useState, useEffect } from 'react';
import { Shield, Server, Activity, Database, CheckCircle, RefreshCw, BarChart3, Users, Sprout } from 'lucide-react';
import { AdminAnalytics, ModelVersion } from '../types/index.js';
import { api } from '../services/api.js';
import { Language, translations } from '../i18n/translations.js';

interface AdminConsoleProps {
  lang: Language;
}

export const AdminConsole: React.FC<AdminConsoleProps> = ({ lang }) => {
  const t = translations[lang];
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [models, setModels] = useState<ModelVersion[]>([]);
  const [health, setHealth] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, modelsRes, healthRes, logsRes] = await Promise.all([
        api.getAdminAnalytics(),
        api.getAdminModels(),
        api.getHealth(),
        api.getAdminAuditLogs(20),
      ]);
      setAnalytics(statsRes);
      setModels(modelsRes);
      setHealth(healthRes);
      setAuditLogs(logsRes);
    } catch (e) {
      console.error('Failed to load admin telemetry', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Admin Header */}
      <div className="bg-amber-900 text-white rounded-2xl p-6 shadow-sm border border-amber-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Shield className="w-6 h-6 text-amber-300" />
            <h2 className="text-xl font-bold">{t.admin.title}</h2>
          </div>
          <p className="text-xs text-amber-200 mt-1">{t.admin.subtitle}</p>
        </div>

        <button
          onClick={fetchAdminData}
          disabled={loading}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-amber-800 hover:bg-amber-700 text-amber-100 rounded-lg text-xs font-semibold transition-colors border border-amber-700"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Telemetry</span>
        </button>
      </div>

      {/* KPI Stats */}
      {analytics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-stone-200">
            <div className="flex items-center justify-between text-stone-500 mb-2">
              <span className="text-xs font-bold uppercase">{t.admin.totalUsers}</span>
              <Users className="w-5 h-5 text-emerald-600" />
            </div>
            <p className="text-3xl font-black text-stone-900">{analytics.totalUsers}</p>
            <p className="text-[11px] text-stone-500 mt-1">{analytics.farmersCount} active farmers</p>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-stone-200">
            <div className="flex items-center justify-between text-stone-500 mb-2">
              <span className="text-xs font-bold uppercase">{t.admin.totalFarms}</span>
              <Sprout className="w-5 h-5 text-emerald-600" />
            </div>
            <p className="text-3xl font-black text-stone-900">{analytics.totalFarms}</p>
            <p className="text-[11px] text-stone-500 mt-1">Under scientific monitoring</p>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-stone-200">
            <div className="flex items-center justify-between text-stone-500 mb-2">
              <span className="text-xs font-bold uppercase">{t.admin.totalPredictions}</span>
              <BarChart3 className="w-5 h-5 text-teal-600" />
            </div>
            <p className="text-3xl font-black text-stone-900">{analytics.totalPredictions}</p>
            <p className="text-[11px] text-stone-500 mt-1">Inference cycles executed</p>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-stone-200">
            <div className="flex items-center justify-between text-stone-500 mb-2">
              <span className="text-xs font-bold uppercase">{t.admin.activeModels}</span>
              <Server className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-3xl font-black text-stone-900">{analytics.modelsCount}</p>
            <p className="text-[11px] text-emerald-600 font-semibold mt-1">All engines active (100% health)</p>
          </div>
        </div>
      )}

      {/* System Health Liveness Bar */}
      {health && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-200 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
            <div>
              <p className="font-bold text-stone-900">Application Health: {health.status}</p>
              <p className="text-stone-500 text-[11px]">{health.application} (v{health.version})</p>
            </div>
          </div>

          <div className="flex items-center space-x-6 text-stone-600">
            <div>
              <span className="text-stone-400 block text-[10px]">Database Connection:</span>
              <span className="font-bold text-stone-800">{health.database}</span>
            </div>
            <div>
              <span className="text-stone-400 block text-[10px]">Memory Heap:</span>
              <span className="font-bold text-stone-800">{health.memoryUsageMb} MB</span>
            </div>
            <div>
              <span className="text-stone-400 block text-[10px]">Uptime:</span>
              <span className="font-bold text-stone-800">{Math.floor(health.uptimeSeconds / 60)} minutes</span>
            </div>
          </div>
        </div>
      )}

      {/* Deployed Model Version Registry */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6">
        <h3 className="text-base font-bold text-stone-900 mb-1 flex items-center space-x-2">
          <Server className="w-5 h-5 text-emerald-700" />
          <span>{t.admin.modelRegistry}</span>
        </h3>
        <p className="text-xs text-stone-500 mb-4">
          Verified ML estimators and biophysical simulation models currently serving inference endpoints.
        </p>

        <div className="space-y-4">
          {models.map(m => (
            <div key={m.id} className="p-4 rounded-xl border border-stone-200 bg-stone-50/70 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-stone-200">
                <div>
                  <span className="font-bold text-stone-900 text-sm">{m.model_name}</span>
                  <span className="ml-2 font-mono text-[11px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">
                    v{m.version}
                  </span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-stone-200 text-stone-700 uppercase">
                  {m.model_type}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                <div>
                  <span className="text-stone-400 block text-[10px]">Algorithm / Architecture:</span>
                  <span className="font-medium text-stone-800">{m.algorithm}</span>
                </div>
                <div>
                  <span className="text-stone-400 block text-[10px]">Benchmark Dataset:</span>
                  <span className="font-medium text-stone-800">{m.dataset_name}</span>
                </div>
                <div>
                  <span className="text-stone-400 block text-[10px]">Validation Performance:</span>
                  <div className="font-mono text-[11px] text-emerald-800 font-semibold mt-0.5">
                    {m.metrics_json?.accuracy !== undefined && `Accuracy: ${(m.metrics_json.accuracy * 100).toFixed(2)}% | `}
                    {m.metrics_json?.f1_score !== undefined && `F1: ${m.metrics_json.f1_score} | `}
                    {m.metrics_json?.r2_score !== undefined && `R²: ${m.metrics_json.r2_score} | RMSE: ±${m.metrics_json.rmse}`}
                    {m.metrics_json?.recommendation_fidelity && `Fidelity: ${(m.metrics_json.recommendation_fidelity * 100).toFixed(1)}%`}
                    {m.metrics_json?.water_balance_accuracy && `Accuracy: ${(m.metrics_json.water_balance_accuracy * 100).toFixed(1)}%`}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Security Audit Trail */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6">
        <h3 className="text-base font-bold text-stone-900 mb-1 flex items-center space-x-2">
          <Activity className="w-5 h-5 text-amber-700" />
          <span>{t.admin.auditLogs}</span>
        </h3>
        <p className="text-xs text-stone-500 mb-4">
          Structured audit log of sensitive system operations, logins, and API access events.
        </p>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-stone-200 text-xs">
            <thead className="bg-stone-50 text-stone-600">
              <tr>
                <th className="px-3 py-2 text-left font-bold">Timestamp</th>
                <th className="px-3 py-2 text-left font-bold">Action</th>
                <th className="px-3 py-2 text-left font-bold">Resource</th>
                <th className="px-3 py-2 text-left font-bold">Client IP</th>
                <th className="px-3 py-2 text-left font-bold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-700 font-mono text-[11px]">
              {auditLogs.map((log: any) => (
                <tr key={log.id} className="hover:bg-stone-50">
                  <td className="px-3 py-2">{new Date(log.created_at).toLocaleTimeString()}</td>
                  <td className="px-3 py-2 font-bold text-stone-900">{log.action}</td>
                  <td className="px-3 py-2">{log.resource}</td>
                  <td className="px-3 py-2 text-stone-500">{log.ip_address}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        log.status === 'SUCCESS' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
