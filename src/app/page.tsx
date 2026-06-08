import { connection } from "next/server";
import { loadConfig, getUserKeys } from "@/lib/config";
import { formatJstDateTime } from "@/lib/date-format";
import { loadAllSnapshots } from "@/lib/snapshot";
import { rankUsers } from "@/lib/scoring";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { PlayerGrid } from "@/components/dashboard/player-grid";

export default async function Home() {
  await connection();

  const config = loadConfig();

  if (!config) {
    return (
      <main className="min-h-screen p-4 md:p-8">
        <div className="text-center py-20">
          <h1 className="text-2xl font-bold tracking-tight mb-2">Anki Battle</h1>
          <p className="text-muted-foreground">
            credentials.toml が見つかりません。
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            credentials.example.toml をコピーして credentials.toml を作成してください。
          </p>
        </div>
      </main>
    );
  }

  const keys = getUserKeys();
  const snapshots = loadAllSnapshots(keys);
  const ranked = rankUsers(snapshots);

  const lastUpdated =
    snapshots.length > 0
      ? `${formatJstDateTime(
          Math.max(...snapshots.map((s) => new Date(s.timestamp).getTime()))
        )} JST`
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
