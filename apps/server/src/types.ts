export type DemoId = 'realestate' | 'clinic' | 'coaching';

export interface Demo {
  id: DemoId;
  label: string;
  business: string;
  tagline: string;
  widgetKeyEnv: string;
  hint: string;
  role: string;
  rules: string;
}

export interface EnabledDemo extends Demo {
  widgetKey: string;
}

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

export interface LookupResult {
  forModel: ForModel;
  forScreen: ForScreen;
  status: string;
}
