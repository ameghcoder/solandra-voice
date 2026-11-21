import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { TooltipProvider } from '@/components/ui/tooltip';
import { DemoTabs } from '@/components/DemoTabs';
import { SourcesPanel } from '@/components/SourcesPanel';
import { VoicePanel } from '@/components/VoicePanel';
import { useVoiceSession } from '@/hooks/useVoiceSession';
import { getDemos } from '@/lib/api';
import { getDemoTheme } from '@/lib/theme';
import { cn } from '@/lib/utils';
import type { DemoId, PublicDemo } from '@/types';

export default function App() {
  const [demos, setDemos] = useState<PublicDemo[]>([]);
  const [selectedId, setSelectedId] = useState<DemoId | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    getDemos()
      .then((list) => {
        setDemos(list);
        if (list[0]) setSelectedId(list[0].id);
      })
      .catch((err) => {
        setLoadError(err instanceof Error ? err.message : 'Failed to load demos');
      });
  }, []);

  const currentDemo = demos.find((d) => d.id === selectedId) ?? demos[0] ?? null;
  const theme = getDemoTheme(currentDemo?.id);
  const voice = useVoiceSession(currentDemo?.id ?? null);

  return (
    <TooltipProvider>
      <div className={cn('min-h-screen bg-gradient-to-br', theme.pageBg)}>
        <header
          className={cn(
            'bg-white/80 backdrop-blur border-b px-4 md:px-10 h-16 flex items-center justify-between',
            theme.headerBorder,
          )}
        >
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'w-9 h-9 rounded-xl text-white grid place-items-center font-bold shrink-0',
                theme.solidBg,
              )}
            >
              {currentDemo ? currentDemo.business[0] : 'S'}
            </div>
            <div className="leading-tight">
              <div className={cn('text-base md:text-lg font-semibold', theme.titleText)}>
                {currentDemo ? currentDemo.business : 'Solandra Voice'}
              </div>
              <div className="text-xs text-muted-foreground">
                {currentDemo ? currentDemo.tagline : 'Voice assistant demo'}
              </div>
            </div>
            <Badge variant="secondary" className="hidden md:inline-flex text-xs">
              Fictional demo
            </Badge>
          </div>
          <div className="hidden md:block text-xs uppercase tracking-wider text-muted-foreground">
            Solandra Voice
          </div>
        </header>

        <div className="max-w-6xl mx-auto px-4 md:px-10 pt-6">
          {loadError ? (
            <p className="text-sm text-destructive">{loadError}</p>
          ) : (
            currentDemo && (
              <DemoTabs
                demos={demos}
                selectedId={currentDemo.id}
                onSelect={(id) => setSelectedId(id)}
              />
            )
          )}
        </div>

        {currentDemo && (
          <main className="max-w-6xl mx-auto px-4 md:px-10 py-6 grid lg:grid-cols-5 gap-6">
            <section className="lg:col-span-3">
              <VoicePanel
                demo={currentDemo}
                theme={theme}
                state={voice.state}
                level={voice.level}
                transcript={voice.transcript}
                error={voice.error}
                onStart={() => void voice.start()}
                onStop={voice.stop}
              />
            </section>

            <aside className="lg:col-span-2 flex flex-col gap-4">
              <SourcesPanel
                business={currentDemo.business}
                theme={theme}
                screen={voice.screen}
                lastStatus={voice.lastStatus}
              />
              <Card className={cn('shadow-md', theme.footerCard)}>
                <CardContent className="py-5 space-y-1">
                  <div className="text-xs uppercase tracking-wider opacity-70">Powered by</div>
                  <div className="font-semibold">Gemini Live · Solandra</div>
                  <div className="text-xs opacity-75">
                    Answers only from the business&apos;s own content. If it isn&apos;t there, Aria says so.
                  </div>
                </CardContent>
              </Card>
            </aside>
          </main>
        )}
      </div>
    </TooltipProvider>
  );
}
