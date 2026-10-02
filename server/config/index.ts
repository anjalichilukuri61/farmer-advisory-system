// server/config/index.ts
import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'agriwise_secure_jwt_secret_production_key_2026_fallback',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  databaseUrl: process.env.DATABASE_URL || '',
  weatherApiKey: process.env.WEATHER_API_KEY || '',
  isProduction: process.env.NODE_ENV === 'production',
};
