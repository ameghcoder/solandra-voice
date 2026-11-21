import type { AnswerStatus, LookupResult, SourceCard } from './types.js';

// Calls Solandra's public chatbot API and splits the answer into
// what Gemini should speak (forModel) and what the page should show (forScreen).

const VOICE_ERRORS: Record<string, string> = {
  HUMAN_MODE: 'A team member is handling this conversation now.',
  ASSISTANT_UNAVAILABLE: "I can't answer right now. Please try again later or call the sales office.",
};
const DEFAULT_ERROR = "I can't look that up right now. Please try again or call the sales office.";

interface SolandraSource {
  url: string;
  pageTitle: string;
}

interface SolandraAction {
  label: string;
  url: string;
}

interface SolandraResponse {
  ok: boolean;
  error?: { code?: string; requestId?: string };
  data?: {
    answer: {
      text: string;
      status: AnswerStatus;
      uncovered?: string;
      handoff?: boolean;
      route?: string;
      sources: SolandraSource[];
      actions: SolandraAction[];
    };
  };
}

export interface AskSolandraParams {
  apiUrl: string;
  widgetKey: string;
  question: string;
  visitorRef?: string;
}

export async function askSolandra({ apiUrl, widgetKey, question, visitorRef }: AskSolandraParams): Promise<LookupResult> {
  const res = await fetch(`${apiUrl}/v1/public/widget/ask`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'X-Widget-Key': widgetKey },
    body: JSON.stringify({ question, ...(visitorRef ? { visitorRef } : {}) }),
    signal: AbortSignal.timeout(15_000),
  });
  const body = (await res.json().catch(() => null)) as SolandraResponse | null;

  if (!body?.ok || !body.data) {
    const code = body?.error?.code ?? `HTTP_${res.status}`;
    console.error(`solandra error ${res.status} ${code} requestId=${body?.error?.requestId ?? '-'}`);
    return {
      forModel: { error: VOICE_ERRORS[code] ?? DEFAULT_ERROR },
      forScreen: { cards: [], actions: [] },
      status: code,
    };
  }

  const a = body.data.answer;
  return {
    forModel: {
      text: stripMarkdown(a.text), // it gets spoken, so no ** or # marks
      status: a.status,
      ...(a.uncovered ? { uncovered: a.uncovered } : {}),
      ...(a.handoff ? { handoff: true } : {}),
      ...(a.actions.length ? { buttonsOnScreen: a.actions.map((x) => x.label) } : {}),
    },
    forScreen: {
      cards: a.route === 'documentation' ? toCards(a.sources) : [],
      actions: a.actions.map(({ label, url }) => ({ label, url })),
    },
    status: a.status,
  };
}

// Sources come back one per chunk. Group them into one card per document:
// web pages keep their own URL; an uploaded PDF comes as "pdf://<documentId>/<page>",
// which a browser can't open, so its card lists the pages instead of linking.
function toCards(sources: SolandraSource[]): SourceCard[] {
  const byDoc = new Map<string, { title: string; url: string | null; pages: number[] }>();
  for (const s of sources) {
    const pdf = /^pdf:\/\/([^/]+)\/(\d+)/.exec(s.url);
    const key = pdf ? `pdf:${pdf[1]}` : s.url;
    const card = byDoc.get(key) ?? { title: s.pageTitle, url: pdf ? null : s.url, pages: [] };
    if (pdf) card.pages.push(Number(pdf[2]));
    byDoc.set(key, card);
  }
  return [...byDoc.values()].map(({ title, url, pages }) => {
    const unique = [...new Set(pages)].sort((x, y) => x - y);
    return {
      title,
      url,
      ...(unique.length ? { body: `PDF · page${unique.length > 1 ? 's' : ''} ${unique.join(', ')}` } : {}),
    };
  });
}

function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/__(.+?)__/g, '$1')
    .replace(/^#+\s*/gm, '')
    .replace(/^\s*[-*]\s+/gm, '')
    .replace(/\[(.+?)\]\((.+?)\)/g, '$1');
}
