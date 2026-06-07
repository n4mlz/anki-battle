import { loadConfig, getUserKeys } from "@/lib/config";
import { loadAllSnapshots } from "@/lib/snapshot";
import { rankUsers } from "@/lib/scoring";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { PlayerGrid } from "@/components/dashboard/player-grid";

export default function Home() {
  const config = loadConfig();
  const keys = getUserKeys();
  const snapshots = loadAllSnapshots(keys);
  const ranked = rankUsers(snapshots);

  const lastUpdated =
    snapshots.length > 0
      ? new Date(
          Math.max(...snapshots.map((s) => new Date(s.timestamp).getTime()))
        ).toLocaleString("ja-JP")
      : null;

  return (
    <main className="min-h-screen p-4 md:p-8">
      <DashboardHeader
        deckName={config.anki.deck_name}
        lastUpdated={lastUpdated}
      />

      {ranked.length === 0 ? (
        <div className="text-center text-muted-foreground py-20">
          <p className="text-lg">データがまだありません</p>
          <p className="text-sm mt-2">
            サーバー起動後、最初の定期取得を待っています...
          </p>
        </div>
      ) : (
        <PlayerGrid users={ranked} />
      )}
    </main>
  );
}
