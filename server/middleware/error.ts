// server/middleware/error.ts
import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction): void {
  const statusCode = err.statusCode || 500;
  const errorCode = err.code || 'INTERNAL_SERVER_ERROR';
  const message = err.message || 'An unexpected error occurred while processing your agricultural request.';

  // Avoid leaking internal stack trace to farmers
  console.error(`[Error] [${req.method} ${req.url}] ${errorCode}:`, err);

  res.status(statusCode).json({
    success: false,
    error: {
      code: errorCode,
      message,
    },
  });
}

export function validateSoilInputs(data: any): { isValid: boolean; error?: string } {
  const { nitrogen, phosphorus, potassium, ph, rainfall, temperature, humidity } = data;

  if (nitrogen !== undefined && (isNaN(nitrogen) || nitrogen < 0 || nitrogen > 1500)) {
    return { isValid: false, error: 'Nitrogen (N) must be between 0 and 1500 kg/ha.' };
  }
  if (phosphorus !== undefined && (isNaN(phosphorus) || phosphorus < 0 || phosphorus > 1000)) {
    return { isValid: false, error: 'Phosphorus (P) must be between 0 and 1000 kg/ha.' };
  }
  if (potassium !== undefined && (isNaN(potassium) || potassium < 0 || potassium > 2000)) {
    return { isValid: false, error: 'Potassium (K) must be between 0 and 2000 kg/ha.' };
  }
  if (ph !== undefined && (isNaN(ph) || ph < 3.0 || ph > 10.0)) {
    return { isValid: false, error: 'Soil pH must be between 3.0 and 10.0 (acidic to alkaline range).' };
  }
  if (temperature !== undefined && (isNaN(temperature) || temperature < -10 || temperature > 55)) {
    return { isValid: false, error: 'Temperature must be realistic (-10°C to 55°C).' };
  }
  if (humidity !== undefined && (isNaN(humidity) || humidity < 0 || humidity > 100)) {
    return { isValid: false, error: 'Relative humidity must be between 0% and 100%.' };
  }
  if (rainfall !== undefined && (isNaN(rainfall) || rainfall < 0 || rainfall > 4000)) {
    return { isValid: false, error: 'Rainfall must be non-negative and realistic (0 to 4000 mm).' };
  }

  return { isValid: true };
}
