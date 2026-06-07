export interface UserConfig {
  name: string;
  email: string;
  password: string;
}

export interface AppConfig {
  users: Record<string, UserConfig>;
  anki: {
    deck_name: string;
    fetch_interval_minutes: number;
  };
}

export interface ChunkProgress {
  index: number;
  label: string;
  level: string;
  total: number;
  mature: number;
  done: boolean;
}

export interface DeckSnapshot {
  deck_id: string;
  name: string;
  total_including_children: number;
  mature_total: number;
  base_progress_pct: number;
  bonus_progress_pct: number;
  chunks: ChunkProgress[];
}

export interface UserSnapshot {
  user: string;
  email: string;
  timestamp: string;
  deck: DeckSnapshot | null;
  error?: string;
}

export interface RankedUser extends UserSnapshot {
  rank: number;
}
