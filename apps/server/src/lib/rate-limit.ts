import type { RequestHandler } from 'express';

// Fixed-window limiter per IP. Fine for one instance; a shared store is needed once it scales out.
export function rateLimit(max: number, windowMs: number): RequestHandler {
  const hits = new Map<string, { start: number; count: number }>();
  return (req, res, next) => {
    const ip = req.ip ?? 'unknown';
    const now = Date.now();
    if (hits.size > 5_000) {
      for (const [key, val] of hits) {
        if (now - val.start > windowMs) hits.delete(key);
      }
    }
    const entry = hits.get(ip);
    if (!entry || now - entry.start > windowMs) {
      hits.set(ip, { start: now, count: 1 });
      next();
      return;
    }
    if (++entry.count > max) {
      res.status(429).json({ error: 'too many requests' });
      return;
    }
    next();
  };
}
