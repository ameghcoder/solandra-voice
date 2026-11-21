import { Router } from 'express';
import { pickDemo } from '../demos.js';
import { rateLimit } from '../lib/rate-limit.js';
import { askSolandra } from '../solandra.js';
import type { EnabledDemo } from '../types.js';

export interface LookupRouterDeps {
  solandraApiUrl: string;
  enabled: Record<string, EnabledDemo>;
}

export function lookupRouter({ solandraApiUrl, enabled }: LookupRouterDeps): Router {
  const router = Router();

  router.post('/', rateLimit(60, 60_000), async (req, res) => {
    const body = req.body as { query?: unknown; demo?: unknown; callId?: unknown } | undefined;
    const query = body?.query;
    if (typeof query !== 'string' || !query.trim() || query.length > 300) {
      res.status(400).json({ error: 'query must be a non-empty string under 300 chars' });
      return;
    }
    const demo = pickDemo(enabled, body?.demo);
    if (!demo) {
      res.status(400).json({ error: 'unknown demo' });
      return;
    }
    const callId = body?.callId;
    const visitorRef = typeof callId === 'string' && /^[\w-]{1,64}$/.test(callId) ? `voice-${callId}` : undefined;
    const t0 = Date.now();
    try {
      const result = await askSolandra({
        apiUrl: solandraApiUrl,
        widgetKey: demo.widgetKey,
        question: query,
        visitorRef,
      });
      const safeQuery = query.replace(/[\r\n]+/g, ' ');
      console.log(`lookup[${demo.id}] "${safeQuery}" ${result.status} ${Date.now() - t0}ms`);
      res.json({ forModel: result.forModel, forScreen: result.forScreen });
    } catch (err) {
      console.error('lookup error', err);
      res.status(502).json({ error: 'lookup failed' });
    }
  });

  return router;
}
