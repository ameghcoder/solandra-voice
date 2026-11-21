import type { DemoId } from '@/types';

export interface DemoTheme {
  pageBg: string;
  headerBorder: string;
  solidBg: string;
  solidHoverBg: string;
  titleText: string;
  accentText: string;
  softBg: string;
  softBorder: string;
  userBubble: string;
  agentBubble: string;
  footerCard: string;
  outlineBtn: string;
  orbLight: string;
  orbMid: string;
  orbDark: string;
  orbGlowRgb: string;
}

export const DEMO_THEMES: Record<DemoId, DemoTheme> = {
  realestate: {
    pageBg: 'from-amber-50 via-white to-orange-50',
    headerBorder: 'border-amber-100',
    solidBg: 'bg-amber-700',
    solidHoverBg: 'hover:bg-amber-800',
    titleText: 'text-amber-950',
    accentText: 'text-amber-800',
    softBg: 'bg-amber-50/70',
    softBorder: 'border-amber-200',
    userBubble: 'bg-amber-700 text-white',
    agentBubble: 'bg-amber-50 text-amber-950 border border-amber-200/70',
    footerCard: 'bg-amber-950 text-amber-50 border-amber-900',
    outlineBtn: 'border-amber-700 text-amber-800 hover:bg-amber-700 hover:text-white',
    orbLight: '#ffd9a0',
    orbMid: '#e08a1e',
    orbDark: '#7a3e00',
    orbGlowRgb: '224, 138, 30',
  },
  clinic: {
    pageBg: 'from-teal-50 via-white to-emerald-50',
    headerBorder: 'border-teal-100',
    solidBg: 'bg-teal-700',
    solidHoverBg: 'hover:bg-teal-800',
    titleText: 'text-teal-950',
    accentText: 'text-teal-800',
    softBg: 'bg-teal-50/70',
    softBorder: 'border-teal-200',
    userBubble: 'bg-teal-700 text-white',
    agentBubble: 'bg-teal-50 text-teal-950 border border-teal-200/70',
    footerCard: 'bg-teal-950 text-teal-50 border-teal-900',
    outlineBtn: 'border-teal-700 text-teal-800 hover:bg-teal-700 hover:text-white',
    orbLight: '#99f6e4',
    orbMid: '#0d9488',
    orbDark: '#134e4a',
    orbGlowRgb: '13, 148, 136',
  },
  coaching: {
    pageBg: 'from-indigo-50 via-white to-slate-50',
    headerBorder: 'border-indigo-100',
    solidBg: 'bg-indigo-700',
    solidHoverBg: 'hover:bg-indigo-800',
    titleText: 'text-indigo-950',
    accentText: 'text-indigo-800',
    softBg: 'bg-indigo-50/70',
    softBorder: 'border-indigo-200',
    userBubble: 'bg-indigo-700 text-white',
    agentBubble: 'bg-indigo-50 text-indigo-950 border border-indigo-200/70',
    footerCard: 'bg-indigo-950 text-indigo-50 border-indigo-900',
    outlineBtn: 'border-indigo-700 text-indigo-800 hover:bg-indigo-700 hover:text-white',
    orbLight: '#c7d2fe',
    orbMid: '#4f46e5',
    orbDark: '#312e81',
    orbGlowRgb: '79, 70, 229',
  },
};

export function getDemoTheme(id: DemoId | undefined): DemoTheme {
  return (id && DEMO_THEMES[id]) || DEMO_THEMES.realestate;
}

export function isSafeUrl(url: string | null | undefined): url is string {
  return typeof url === 'string' && /^(https?:\/\/|mailto:)/i.test(url);
}
