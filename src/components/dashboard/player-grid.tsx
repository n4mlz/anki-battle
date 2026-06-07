import type { RankedUser } from "@/types";
import { PlayerCard } from "./player-card";

interface PlayerGridProps {
  users: RankedUser[];
}

export function PlayerGrid({ users }: PlayerGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
      {users.map((user) => (
        <PlayerCard key={user.email} user={user} />
      ))}
    </div>
  );
}
