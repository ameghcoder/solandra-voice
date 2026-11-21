import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Transcript } from '@/components/Transcript';
import { VoiceOrb } from '@/components/VoiceOrb';
import type { DemoTheme } from '@/lib/theme';
import { cn } from '@/lib/utils';
import type { PublicDemo, TranscriptEntry, VoiceState } from '@/types';

interface VoicePanelProps {
  demo: PublicDemo;
  theme: DemoTheme;
  state: VoiceState;
  level: number;
  transcript: TranscriptEntry[];
  error?: string;
  onStart: () => void;
  onStop: () => void;
}

const STATE_LABEL: Record<VoiceState, string> = {
  idle: 'idle',
  connecting: 'connecting…',
  listening: 'listening',
  thinking: 'checking…',
  speaking: 'Aria is speaking',
};

export function VoicePanel({
  demo,
  theme,
  state,
  level,
  transcript,
  error,
  onStart,
  onStop,
}: VoicePanelProps) {
  const isActive = state !== 'idle';

  const hintText =
    state === 'idle'
      ? `Tap to talk. ${demo.hint}`
      : state === 'connecting'
        ? 'Connecting to Aria…'
        : state === 'thinking'
          ? 'Ek second, checking…'
          : state === 'speaking'
            ? 'You can interrupt any time.'
            : "Go ahead, I'm listening. Hindi or English.";

  const badgeClass =
    state === 'idle'
      ? 'border-border text-muted-foreground'
      : state === 'thinking'
        ? 'bg-amber-100 text-amber-900 border-amber-300'
        : 'bg-emerald-100 text-emerald-900 border-emerald-300';

  return (
    <Card className={cn('shadow-xl', theme.headerBorder)}>
      <CardContent className="pt-6 flex flex-col items-center text-center gap-4">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2.5">
            <Avatar className="h-9 w-9">
              <AvatarFallback className={cn(theme.solidBg, 'text-white text-xs font-semibold')}>
                AR
              </AvatarFallback>
            </Avatar>
            <div className="text-left">
              <div className="font-semibold leading-tight text-sm">Aria</div>
              <div className="text-xs text-muted-foreground">Voice assistant · Hindi &amp; English</div>
            </div>
          </div>
          <Badge variant="outline" className={badgeClass}>
            {STATE_LABEL[state]}
          </Badge>
        </div>

        <VoiceOrb state={state} level={level} theme={theme} />

        <p className="text-sm text-muted-foreground">{hintText}</p>

        {error && (
          <p className="text-xs text-destructive bg-destructive/10 px-3 py-1.5 rounded-md">
            {error}
          </p>
        )}

        <Button
          size="lg"
          onClick={isActive ? onStop : onStart}
          className={cn(
            'rounded-full px-10 py-6 text-base font-medium text-white cursor-pointer',
            isActive ? 'bg-red-700 hover:bg-red-800' : cn(theme.solidBg, theme.solidHoverBg),
          )}
        >
          {isActive ? 'End conversation' : 'Start voice assistant'}
        </Button>

        <div className="w-full flex items-center gap-3 pt-2">
          <Separator className="flex-1" />
          <span className="text-xs text-muted-foreground uppercase tracking-wider">Conversation</span>
          <Separator className="flex-1" />
        </div>

        <div className="w-full text-left">
          <Transcript entries={transcript} theme={theme} />
        </div>
      </CardContent>
    </Card>
  );
}
