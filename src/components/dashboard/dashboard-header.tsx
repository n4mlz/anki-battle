interface DashboardHeaderProps {
  deckName: string;
  lastUpdated: string | null;
}

export function DashboardHeader({ deckName, lastUpdated }: DashboardHeaderProps) {
  return (
    <div className="text-center mb-8">
      <h1 className="text-2xl font-bold tracking-tight">Anki Battle</h1>
      <p className="text-muted-foreground text-sm mt-1">{deckName} 進捗比較</p>
      {lastUpdated && (
        <p className="text-xs text-muted-foreground mt-1">
          最終更新: {lastUpdated}
        </p>
      )}
    </div>
  );
}
