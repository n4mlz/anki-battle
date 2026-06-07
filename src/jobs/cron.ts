import cron from "node-cron";
import { loadConfig } from "@/lib/config";
import { fetchAllUsers } from "@/lib/anki/orchestrator";

let jobStarted = false;

export function startCronJob(): void {
  if (jobStarted) return;

  const config = loadConfig();
  const intervalMinutes = config.anki.fetch_interval_minutes || 5;

  console.log(`[cron] Starting fetch job every ${intervalMinutes} minutes`);

  fetchAllUsers()
    .then((results) => {
      console.log(
        `[cron] Initial fetch complete: ${results.filter((r) => !r.error).length}/${results.length} OK`
      );
    })
    .catch((err) => {
      console.error("[cron] Initial fetch failed:", err);
    });

  cron.schedule(`*/${intervalMinutes} * * * *`, async () => {
    console.log(`[cron] Fetching at ${new Date().toISOString()}`);
    try {
      const results = await fetchAllUsers();
      const ok = results.filter((r) => !r.error).length;
      console.log(`[cron] Fetched: ${ok}/${results.length} OK`);
    } catch (err) {
      console.error("[cron] Fetch failed:", err);
    }
  });

  jobStarted = true;
}
