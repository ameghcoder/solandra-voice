import { Router } from 'express';
import type { EnabledDemo, PublicDemo } from '../types.js';

export function demosRouter(enabled: Record<string, EnabledDemo>): Router {
  const router = Router();
  const publicList: PublicDemo[] = Object.values(enabled).map((d) => ({
    id: d.id,
    label: d.label,
    business: d.business,
    tagline: d.tagline,
    hint: d.hint,
  }));

  // The tabs the page shows: only public, display fields.
  router.get('/', (_req, res) => {
    res.json(publicList);
  });

  return router;
}
