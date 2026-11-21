import 'dotenv/config';

export interface ServerEnv {
  geminiApiKey: string;
  liveModel: string;
  solandraApiUrl: string;
  port: number;
  isProduction: boolean;
}

export function loadEnv(): ServerEnv {
  const { GEMINI_API_KEY, LIVE_MODEL, SOLANDRA_API_URL, PORT, NODE_ENV } = process.env;
  if (!GEMINI_API_KEY || !LIVE_MODEL || !SOLANDRA_API_URL) {
    throw new Error('Set GEMINI_API_KEY, LIVE_MODEL, and SOLANDRA_API_URL in .env');
  }
  return {
    geminiApiKey: GEMINI_API_KEY,
    liveModel: LIVE_MODEL,
    solandraApiUrl: SOLANDRA_API_URL,
    port: Number(PORT ?? 8080),
    isProduction: NODE_ENV === 'production',
  };
}
