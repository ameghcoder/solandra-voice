import type { CSSProperties } from 'react';
import type { DemoTheme } from '@/lib/theme';
import type { VoiceState } from '@/types';

interface VoiceOrbProps {
  state: VoiceState;
  level: number;
  theme: DemoTheme;
}

export function VoiceOrb({ state, level, theme }: VoiceOrbProps) {
  const style = {
    '--level': level.toFixed(3),
    '--orb-light': theme.orbLight,
    '--orb-mid': theme.orbMid,
    '--orb-dark': theme.orbDark,
    '--orb-glow-rgb': theme.orbGlowRgb,
  } as CSSProperties;

  return (
    <div className="py-8 flex flex-col items-center gap-6" data-state={state} style={style}>
      <div className="voice-orb" aria-hidden="true" />
      <div className="voice-bars h-10 flex items-end justify-center" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}
