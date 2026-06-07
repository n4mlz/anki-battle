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

export function loadSnapshot(userKey: string): UserSnapshot | null {
  const path = resolve(SNAPSHOT_DIR, `${userKey}_latest.json`);
  if (!existsSync(path)) return null;
  try {
    const raw = readFileSync(path, "utf-8");
    return JSON.parse(raw) as UserSnapshot;
  } catch {
    return null;
  }
}

export function loadAllSnapshots(userKeys: string[]): UserSnapshot[] {
  return userKeys
    .map((key) => loadSnapshot(key))
    .filter((s): s is UserSnapshot => s !== null);
}
