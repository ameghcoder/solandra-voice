import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { GoogleGenAI } from '@google/genai';
import { loadEnv } from './env.js';
import { loadEnabledDemos } from './demos.js';
import { demosRouter } from './routes/demos.js';
import { tokenRouter } from './routes/token.js';
import { lookupRouter } from './routes/lookup.js';

const env = loadEnv();
const enabled = loadEnabledDemos();
const ai = new GoogleGenAI({ apiKey: env.geminiApiKey });

const app = express();
// Cloud Run sits behind Google's proxy: trust one hop so req.ip is the visitor's IP,
// otherwise every visitor shares one rate-limit bucket.
app.set('trust proxy', 1);
app.use(express.json({ limit: '10kb' }));

app.use('/api/demos', demosRouter(enabled));
app.use('/api/token', tokenRouter({ ai, liveModel: env.liveModel, enabled }));
app.use('/api/lookup', lookupRouter({ solandraApiUrl: env.solandraApiUrl, enabled }));

if (env.isProduction) {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const frontendDist = path.resolve(__dirname, '../../frontend/dist');
  app.use(express.static(frontendDist));
  app.get('/{*splat}', (req, res) => {
    if (req.path.startsWith('/api')) {
      res.status(404).json({ error: 'not found' });
      return;
    }
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

// Express 5 passes listen errors (e.g. port in use) to this callback instead of throwing.
app.listen(env.port, (err) => {
  if (err) {
    const code = (err as NodeJS.ErrnoException).code ?? err.message;
    console.error(`cannot listen on port ${env.port}: ${code}. Set another PORT in .env`);
    process.exit(1);
  }
  console.log(`demos=${Object.keys(enabled).join(',')}  http://localhost:${env.port}`);
});
