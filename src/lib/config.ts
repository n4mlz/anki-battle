import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import toml from "toml";
import type { AppConfig } from "@/types";

let cachedConfig: AppConfig | null = null;

export function loadConfig(): AppConfig | null {
  if (cachedConfig) return cachedConfig;

  const configPath = resolve(process.cwd(), "credentials.toml");
  if (!existsSync(configPath)) return null;

  const raw = readFileSync(configPath, "utf-8");
  cachedConfig = toml.parse(raw) as AppConfig;
  return cachedConfig;
}

export function getUserKeys(): string[] {
  const config = loadConfig();
  if (!config) return [];
  return Object.keys(config.users);
}

export function getUserCount(): number {
  return getUserKeys().length;
}
