import { Router } from 'express';
import type { GoogleGenAI } from '@google/genai';
import { pickDemo } from '../demos.js';
import { buildLiveConfig } from '../live-config.js';
import { rateLimit } from '../lib/rate-limit.js';
import type { EnabledDemo } from '../types.js';

export interface TokenRouterDeps {
  ai: GoogleGenAI;
  liveModel: string;
  enabled: Record<string, EnabledDemo>;
}

// Ephemeral token: single use, must start a session within 60s, session ends by 15 min.
// The model and config are locked inside the token.
export function tokenRouter({ ai, liveModel, enabled }: TokenRouterDeps): Router {
  const router = Router();

  router.post('/', rateLimit(10, 60_000), async (req, res) => {
    const body = req.body as { demo?: unknown } | undefined;
    const demo = pickDemo(enabled, body?.demo);
    if (!demo) {
      res.status(400).json({ error: 'unknown demo' });
      return;
    }
    const now = Date.now();
    try {
      const token = await ai.authTokens.create({
        config: {
          uses: 1,
          expireTime: new Date(now + 15 * 60_000).toISOString(),
          newSessionExpireTime: new Date(now + 60_000).toISOString(),
          liveConnectConstraints: { model: liveModel, config: buildLiveConfig(demo) },
          httpOptions: { apiVersion: 'v1alpha' },
        },
      });
      res.json({ token: token.name, model: liveModel });
    } catch (err) {
      console.error('token error', err);
      res.status(502).json({ error: 'could not create token' });
    }
  });

  return router;
}
