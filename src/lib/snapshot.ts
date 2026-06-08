import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { resolve } from "path";
import type { UserSnapshot } from "@/types";

const SNAPSHOT_DIR = resolve(process.cwd(), "data/snapshots");

function ensureDir() {
  if (!existsSync(SNAPSHOT_DIR)) {
    mkdirSync(SNAPSHOT_DIR, { recursive: true });
  }
}

export function saveSnapshot(userKey: string, snapshot: UserSnapshot): void {
  ensureDir();
  const path = resolve(SNAPSHOT_DIR, `${userKey}_latest.json`);
  writeFileSync(path, JSON.stringify(snapshot, null, 2), "utf-8");
}

function migrateSnapshot(raw: Record<string, unknown>): Record<string, unknown> {
  const deck = raw.deck as Record<string, unknown> | undefined;
  if (deck && "mature_total" in deck) {
    const mt = (deck.mature_total as number) ?? 0;
    const ip = (deck.in_progress_total as number) ?? 0;
    deck.studied_total = mt + ip;
    delete deck.mature_total;
    delete deck.in_progress_total;
    const chunks = deck.chunks as Array<Record<string, unknown>> | undefined;
    if (chunks) {
      for (const c of chunks) {
        if ("mature" in c) {
          c.studied = ((c.mature as number) ?? 0) + ((c.inProgress as number) ?? 0);
          delete c.mature;
          delete c.inProgress;
        }
      }
    }
  }
  return raw;
}

export function loadSnapshot(userKey: string): UserSnapshot | null {
  const path = resolve(SNAPSHOT_DIR, `${userKey}_latest.json`);
  if (!existsSync(path)) return null;
  try {
    const raw = readFileSync(path, "utf-8");
    return migrateSnapshot(JSON.parse(raw)) as unknown as UserSnapshot;
  } catch {
    return null;
  }
}

export function loadAllSnapshots(userKeys: string[]): UserSnapshot[] {
  return userKeys
    .map((key) => loadSnapshot(key))
    .filter((s): s is UserSnapshot => s !== null);
}
