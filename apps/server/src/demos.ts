import type { Demo, DemoId, EnabledDemo } from './types.js';

// The three demo businesses. Each one has its own Solandra project + public widget,
// so each tab sends lookups with its own widget key, and Gemini gets its own prompt.
export const demos: Record<DemoId, Demo> = {
  realestate: {
    id: 'realestate',
    label: 'Real estate',
    business: 'Kesar Developers',
    tagline: 'Homes in Jaipur',
    widgetKeyEnv: 'SOLANDRA_WIDGET_KEY', // the first demo keeps the original env name
    hint: 'Try "2BHK ka price kya hai?"',
    role: `You are Aria, the personal voice assistant on the website of Kesar Developers, a real-estate developer in Jaipur.
You help home buyers with projects, prices, sizes, possession dates, amenities, payment plans, booking and site visits.
If the visitor's question could mean more than one project, ask which project before looking it up.`,
    rules: 'Never promise prices, discounts or dates that the tool did not return.',
  },
  clinic: {
    id: 'clinic',
    label: 'Clinic',
    business: 'Sunrise Care Clinic',
    tagline: 'Family health care in Jaipur',
    widgetKeyEnv: 'SOLANDRA_WIDGET_KEY_CLINIC',
    hint: 'Try "Skin doctor kab baithte hain?"',
    role: `You are Aria, the personal voice assistant on the website of Sunrise Care Clinic, a multi-speciality clinic in Jaipur.
You help patients with doctors, specialities, OPD timings, consultation fees, booking appointments, lab tests and health packages.
If the patient doesn't say which doctor or speciality, ask before looking it up.`,
    rules: `You are not a doctor. Never diagnose, never suggest medicines or doses, never say whether a symptom is serious.
For health questions, suggest booking a consultation with the right speciality.
If the patient describes an emergency (chest pain, breathing trouble, heavy bleeding, unconsciousness), tell them to call 112 or go to the nearest emergency room right away.`,
  },
  coaching: {
    id: 'coaching',
    label: 'Coaching',
    business: 'Pragati Academy',
    tagline: 'JEE and NEET coaching in Jaipur',
    widgetKeyEnv: 'SOLANDRA_WIDGET_KEY_COACHING',
    hint: 'Try "Main class 11 mein hoon, NEET ki taiyari karni hai"',
    role: `You are Aria, the course advisor on the website of Pragati Academy, a JEE and NEET coaching institute in Jaipur.
You help students and parents choose the right course: courses, fees, batch dates, timings, scholarships, the free demo class and admissions.
Before recommending a course, ask the student's class and goal (JEE, NEET or school foundation) if you don't know them.
Be encouraging, like a good counsellor: recommend one best-fit course, mention a scholarship or the free demo class when it fits, and invite them to book the demo class.`,
    rules: 'Never promise ranks, selections or results. Never invent discounts. Only mention fees and scholarships the tool returned.',
  },
};

export function loadEnabledDemos(): Record<string, EnabledDemo> {
  const enabled: Record<string, EnabledDemo> = {};
  for (const [id, d] of Object.entries(demos)) {
    const widgetKey = process.env[d.widgetKeyEnv];
    if (widgetKey) {
      enabled[id] = { ...d, widgetKey };
    }
  }
  if (!Object.keys(enabled).length) {
    throw new Error('No demo has a widget key: set SOLANDRA_WIDGET_KEY in .env');
  }
  return enabled;
}

export function pickDemo(enabled: Record<string, EnabledDemo>, id: unknown): EnabledDemo | null {
  return typeof id === 'string' && Object.prototype.hasOwnProperty.call(enabled, id) ? enabled[id] : null;
}
