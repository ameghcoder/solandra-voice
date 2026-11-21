import { useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { DemoTheme } from '@/lib/theme';
import { cn } from '@/lib/utils';
import type { TranscriptEntry } from '@/types';

interface TranscriptProps {
  entries: TranscriptEntry[];
  theme: DemoTheme;
}

export function Transcript({ entries, theme }: TranscriptProps) {
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [entries]);

  if (!entries.length) {
    return (
      <div className="text-xs text-muted-foreground text-center py-6">
        Your conversation transcript will appear here.
      </div>
    );
  }

  return (
    <ScrollArea className="h-64 w-full pr-3">
      <div className="flex flex-col gap-3">
        {entries.map((entry, i) => {
          const isUser = entry.role === 'user';
          return (
            <div
              key={i}
              className={cn(
                'flex flex-col gap-1 fade-in',
                isUser ? 'items-end' : 'items-start',
              )}
            >
              <span className="text-xs text-muted-foreground px-1">
                {isUser ? 'You' : 'Aria'}
              </span>
              <div
                className={cn(
                  'max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
                  isUser ? theme.userBubble : theme.agentBubble,
                )}
              >
                {entry.text}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
}
