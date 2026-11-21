import type { DemoId, LookupResponse, PublicDemo, TokenResponse } from '@/types';

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${url} ${res.status}`);
  return (await res.json()) as T;
}

export async function getDemos(): Promise<PublicDemo[]> {
  const res = await fetch('/api/demos');
  if (!res.ok) throw new Error(`/api/demos ${res.status}`);
  return (await res.json()) as PublicDemo[];
}

export function getToken(demo: DemoId): Promise<TokenResponse> {
  return postJson<TokenResponse>('/api/token', { demo });
}

export function lookup(params: {
  query: string;
  demo: DemoId;
  callId?: string;
}): Promise<LookupResponse> {
  return postJson<LookupResponse>('/api/lookup', params);
}
