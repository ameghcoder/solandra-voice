export type DemoId = 'realestate' | 'clinic' | 'coaching';

export interface PublicDemo {
  id: DemoId;
  label: string;
  business: string;
  tagline: string;
  hint: string;
}

export type AnswerStatus = 'answered' | 'partial' | 'insufficient_evidence';

export type ForModel =
  | {
      text: string;
      status: AnswerStatus;
      uncovered?: string;
      handoff?: true;
      buttonsOnScreen?: string[];
    }
  | { error: string };

export interface SourceCard {
  title: string;
  url: string | null;
  body?: string;
}

export interface ActionButton {
  label: string;
  url: string;
}

export interface ForScreen {
  cards: SourceCard[];
  actions: ActionButton[];
}

export interface LookupResponse {
  forModel: ForModel;
  forScreen: ForScreen;
}

export interface TokenResponse {
  token: string;
  model: string;
}

export type VoiceState = 'idle' | 'connecting' | 'listening' | 'thinking' | 'speaking';

export interface TranscriptEntry {
  role: 'user' | 'agent';
  text: string;
}
