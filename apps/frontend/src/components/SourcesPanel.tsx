import { FileText, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { isSafeUrl, type DemoTheme } from '@/lib/theme';
import { cn } from '@/lib/utils';
import type { ForScreen } from '@/types';

interface SourcesPanelProps {
  business: string;
  theme: DemoTheme;
  screen: ForScreen | null;
  lastStatus?: string;
}

function StatusBadge({ status }: { status?: string }) {
  if (!status) return null;
  if (status === 'answered') {
    return (
      <Badge variant="outline" className="bg-emerald-100 text-emerald-900 border-emerald-300">
        answered
      </Badge>
    );
  }
  if (status === 'partial') {
    return (
      <Badge variant="outline" className="bg-amber-100 text-amber-900 border-amber-300">
        partial
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-300">
      not on the website
    </Badge>
  );
}

export function SourcesPanel({ business, theme, screen, lastStatus }: SourcesPanelProps) {
  const cards = screen?.cards.slice(0, 3) ?? [];
  const actions = screen?.actions ?? [];

  return (
    <Card className={cn('shadow-md', theme.headerBorder)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base">Sources</CardTitle>
          <StatusBadge status={lastStatus} />
        </div>
        <CardDescription className="text-xs">
          Every answer comes from {business}&apos;s published content.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {cards.length === 0 ? (
          <div className="text-sm text-muted-foreground border border-dashed rounded-xl p-4 text-center">
            Sources appear here when Aria answers.
          </div>
        ) : (
          cards.map((card, i) => (
            <div
              key={`${card.title}-${i}`}
              className={cn('rounded-xl border p-4 fade-in', theme.softBorder, theme.softBg)}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className={cn(
                    'w-7 h-7 rounded-lg text-white grid place-items-center shrink-0',
                    theme.solidBg,
                  )}
                >
                  <FileText className="w-4 h-4" />
                </span>
                <div className={cn('font-semibold leading-tight text-sm', theme.titleText)}>
                  {card.title}
                </div>
              </div>
              {card.body && (
                <p className="text-xs text-muted-foreground mt-2">{card.body}</p>
              )}
              {isSafeUrl(card.url) && (
                <a
                  href={card.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    'inline-flex items-center gap-1 text-xs font-medium mt-2 hover:underline',
                    theme.accentText,
                  )}
                >
                  Open source <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          ))
        )}

        {actions.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {actions.map((action, i) =>
              isSafeUrl(action.url) ? (
                <a
                  key={`${action.label}-${i}`}
                  href={action.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    buttonVariants({ variant: 'outline', size: 'sm' }),
                    'fade-in',
                    theme.outlineBtn,
                  )}
                >
                  {action.label}
                </a>
              ) : (
                <span
                  key={`${action.label}-${i}`}
                  className="text-xs text-muted-foreground border rounded-md px-2.5 py-1.5"
                >
                  {action.label}
                </span>
              ),
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
