// Prints the models your key can use for Live (bidiGenerateContent) and for embeddings.
import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';

// The SDK default API version lists only some models; v1beta lists the Live ones too.
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY, httpOptions: { apiVersion: 'v1beta' } });
// Large page size so every model comes back in one call.
const pager = await ai.models.list({ config: { pageSize: 1000 } });
for await (const m of pager) {
  const actions = m.supportedActions ?? [];
  const name = m.name?.replace('models/', '') ?? '';
  if (actions.includes('bidiGenerateContent')) console.log('LIVE  ', name);
  if (actions.includes('embedContent')) console.log('EMBED ', name);
}
