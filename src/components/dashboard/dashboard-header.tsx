interface DashboardHeaderProps {
  deckName: string;
  lastUpdated: string | null;
}

export function DashboardHeader({ deckName, lastUpdated }: DashboardHeaderProps) {
  return (
    <div className="text-center mb-8 md:mb-12">
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Anki Battle</h1>
      <p className="text-muted-foreground text-sm md:text-base mt-1 md:mt-2">
        {deckName} 進捗比較
      </p>
      {lastUpdated && (
        <p className="text-xs md:text-sm text-muted-foreground mt-1 md:mt-2">
          最終更新: {lastUpdated}
        </p>
      )}
    </div>
  );
}
