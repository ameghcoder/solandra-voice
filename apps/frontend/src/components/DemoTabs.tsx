import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { DemoId, PublicDemo } from '@/types';

interface DemoTabsProps {
  demos: PublicDemo[];
  selectedId: DemoId;
  onSelect: (id: DemoId) => void;
}

export function DemoTabs({ demos, selectedId, onSelect }: DemoTabsProps) {
  if (!demos.length) return null;

  return (
    <Tabs value={selectedId} onValueChange={(v) => onSelect(v as DemoId)}>
      <TabsList>
        {demos.map((d) => (
          <TabsTrigger key={d.id} value={d.id} className="px-4">
            {d.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
