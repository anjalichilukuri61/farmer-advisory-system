// src/components/AuthModal.tsx
import React, { useState } from 'react';
import { User, Lock, Mail, Shield, AlertCircle } from 'lucide-react';
import { api } from '../services/api.js';
import { User as UserType } from '../types/index.js';
import { Language } from '../i18n/translations.js';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserType) => void;
  lang: Language;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess, lang }) => {
  const [isRegister, setIsRegister] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [role, setRole] = useState<'FARMER' | 'ADMIN'>('FARMER');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const isTe = lang === 'te';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegister) {
        const res = await api.register({
          name,
          email,
          password,
          role,
          preferred_language: lang,
        });
        onSuccess(res.user);
      } else {
        const res = await api.login(email, password);
        onSuccess(res.user);
      }
      onClose();
    } catch (err: any) {
      setError(
        err.message ||
          (isTe
            ? 'ప్రవేశించడం విఫలమైంది. దయచేసి వివరాలను సరిచూసుకోండి.'
            : 'Authentication failed. Please verify credentials.')
      );
    } finally {
      setLoading(false);
    }
  };

  const loginDemo = async (demoRole: 'FARMER' | 'ADMIN') => {
    setError(null);
    setLoading(true);
    try {
      const emailToUse = demoRole === 'ADMIN' ? 'admin@agriwise.org' : 'farmer@agriwise.org';
      const passToUse = demoRole === 'ADMIN' ? 'admin123' : 'farmer123';
      const res = await api.login(emailToUse, passToUse);
      onSuccess(res.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Demo login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200">
        <div className="flex justify-between items-center pb-4 border-b border-stone-100">
          <div>
            <h3 className="text-lg font-bold text-stone-900">
              {isRegister
                ? isTe
                  ? 'అగ్రివైజ్ ఖాతాను సృష్టించండి'
                  : 'Create AgriWise Account'
                : isTe
                ? 'అగ్రివైజ్ లోకి ప్రవేశించండి (లాగిన్)'
                : 'Sign in to AgriWise'}
            </h3>
            <p className="text-xs text-stone-500">
              {isTe
                ? 'రైతుల కోసం సురక్షిత వ్యవసాయ నిర్ణయ సహాయక వ్యవస్థ'
                : 'Secure agricultural decision support access'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 text-lg font-bold p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="my-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-2 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {isRegister && (
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {isTe ? 'పూర్తి పేరు' : 'Full Name'}
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  placeholder={isTe ? 'ఉదాహరణ: రమేష్ రావు' : 'e.g. Ramesh Patel'}
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              {isTe ? 'ఈమెయిల్ చిరునామా' : 'Email Address'}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                placeholder="farmer@agriwise.org"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              {isTe ? 'పాస్‌వర్డ్' : 'Password'}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            {loading
              ? isTe
                ? 'ప్రాసెస్ అవుతోంది...'
                : 'Processing...'
              : isRegister
              ? isTe
                ? 'ఖాతా సృష్టించండి'
                : 'Create Account'
              : isTe
              ? 'లాగిన్ అవ్వండి'
              : 'Sign In'}
          </button>
        </form>

        <div className="mt-4 pt-4 border-t border-stone-100 flex flex-col space-y-3">
          <button
            type="button"
            onClick={() => setIsRegister(!isRegister)}
            className="text-xs text-emerald-700 hover:underline font-bold text-center cursor-pointer"
          >
            {isRegister
              ? isTe
                ? 'ఇప్పటికే ఖాతా ఉందా? లాగిన్ అవ్వండి'
                : 'Already have an account? Sign in'
              : isTe
              ? 'ఖాతా లేదా? ఇక్కడ నమోదు చేసుకోండి'
              : "Don't have an account? Create one"}
          </button>

          {/* Quick Demo Sign In Button for Evaluation */}
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block mb-2 text-center">
              {isTe ? 'పరీక్షించడానికి డెమో లాగిన్' : 'Instant Demo Login'}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => loginDemo('FARMER')}
                className="flex-1 py-1.5 bg-white hover:bg-emerald-50 text-stone-800 hover:text-emerald-900 border border-stone-200 rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                {isTe ? 'రైతు డెమో (Farmer)' : 'Demo Farmer'}
              </button>
              <button
                type="button"
                onClick={() => loginDemo('ADMIN')}
                className="flex-1 py-1.5 bg-white hover:bg-amber-50 text-stone-800 hover:text-amber-900 border border-stone-200 rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                {isTe ? 'అడ్మిన్ డెమో (Admin)' : 'Demo Admin'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
