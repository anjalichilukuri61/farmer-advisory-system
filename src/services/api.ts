// src/services/api.ts
import {
  User,
  Farm,
  FarmProfile,
  WeatherData,
  ComprehensiveAdvisoryData,
  PredictionRecord,
  ModelVersion,
  AdminAnalytics,
} from '../types/index.js';

const TOKEN_KEY = 'agriwise_auth_token';

export const api = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  },

  clearToken(): void {
    localStorage.removeItem(TOKEN_KEY);
  },

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(endpoint, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok || data.success === false) {
      const errMsg = data.error?.message || data.message || `Request failed (${response.status})`;
      throw new Error(errMsg);
    }

    return data.data !== undefined ? data.data : data;
  },

  // Auth
  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const res = await this.request<{ token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(res.token);
    return res;
  },

  async register(data: { name: string; email: string; password: string; role?: string; preferred_language?: string }): Promise<{ token: string; user: User }> {
    const res = await this.request<{ token: string; user: User }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    this.setToken(res.token);
    return res;
  },

  async getMe(): Promise<User> {
    return this.request<User>('/api/auth/me');
  },

  // Farms
  async getFarms(): Promise<Farm[]> {
    return this.request<Farm[]>('/api/farms');
  },

  async createFarm(farm: Partial<Farm> & { profile?: Partial<FarmProfile> }): Promise<Farm> {
    return this.request<Farm>('/api/farms', {
      method: 'POST',
      body: JSON.stringify(farm),
    });
  },

  async updateFarmProfile(farmId: string, profile: Partial<FarmProfile>): Promise<FarmProfile> {
    return this.request<FarmProfile>(`/api/farms/${farmId}/profile`, {
      method: 'PUT',
      body: JSON.stringify(profile),
    });
  },

  // Weather
  async getWeather(lat?: number, lon?: number, location?: string): Promise<WeatherData> {
    const params = new URLSearchParams();
    if (lat) params.append('lat', lat.toString());
    if (lon) params.append('lon', lon.toString());
    if (location) params.append('location', location);
    return this.request<WeatherData>(`/api/weather?${params.toString()}`);
  },

  // Language Preference
  async updateUserLanguage(language: 'en' | 'te' | 'hi'): Promise<void> {
    try {
      await this.request('/api/users/language', {
        method: 'PUT',
        body: JSON.stringify({ language }),
      });
    } catch (e) {
      // Non-blocking if offline or guest
    }
  },

  // Soil Report OCR & Document Extraction
  async extractSoilReport(payload: {
    file_data?: string;
    file_name?: string;
    mime_type?: string;
    sample_preset?: string;
    farm_id?: string;
  }): Promise<{ reportId: string; farmId: string; fileName: string; extractionResult: any }> {
    return this.request('/api/soil-report/extract', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async confirmSoilReport(payload: {
    report_id?: string;
    farm_id: string;
    confirmed_values: any;
    corrections?: any;
  }): Promise<{ report: any; profile: FarmProfile }> {
    return this.request('/api/soil-report/confirm', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async getLatestSoilReport(farmId: string): Promise<{ hasReport: boolean; report: any | null; profile: FarmProfile | null }> {
    return this.request(`/api/soil-report/latest/${farmId}`);
  },

  // Individual Module Predictions
  async predictCrop(input: any): Promise<{ predictionId: string; result: any; explanation: any }> {
    return this.request('/api/predictions/crop', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  async predictYield(input: any): Promise<{ predictionId: string; result: any }> {
    return this.request('/api/predictions/yield', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  async predictFertilizer(input: any): Promise<{ predictionId: string; result: any }> {
    return this.request('/api/predictions/fertilizer', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  async predictIrrigation(input: any): Promise<{ predictionId: string; result: any }> {
    return this.request('/api/predictions/irrigation', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  async predictDisease(input: any): Promise<{ predictionId: string; result: any }> {
    return this.request('/api/predictions/disease', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  // Predictions
  async runComprehensiveAnalysis(input: any): Promise<ComprehensiveAdvisoryData> {
    return this.request<ComprehensiveAdvisoryData>('/api/predictions/comprehensive', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  async getPredictions(params: { farmId?: string; type?: string; limit?: number } = {}): Promise<PredictionRecord[]> {
    const q = new URLSearchParams();
    if (params.farmId) q.append('farmId', params.farmId);
    if (params.type) q.append('type', params.type);
    if (params.limit) q.append('limit', params.limit.toString());
    return this.request<PredictionRecord[]>(`/api/predictions?${q.toString()}`);
  },

  // Admin
  async getAdminAnalytics(): Promise<AdminAnalytics> {
    return this.request<AdminAnalytics>('/api/admin/analytics');
  },

  async getAdminModels(): Promise<ModelVersion[]> {
    return this.request<ModelVersion[]>('/api/admin/models');
  },

  async getAdminAuditLogs(limit = 50): Promise<any[]> {
    return this.request<any[]>(`/api/admin/audit-logs?limit=${limit}`);
  },

  async getHealth(): Promise<any> {
    const res = await fetch('/health');
    return res.json();
  },
};
