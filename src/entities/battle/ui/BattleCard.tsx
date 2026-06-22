import { Link } from "react-router-dom";
import { MessageSquare, Users } from "lucide-react";

import { formatDateTime } from "@/shared/lib/formatDate";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";

import type { BattleSummary } from "../model/battle.types";
import { BattleStatusBadge } from "./BattleStatusBadge";

type BattleCardProps = {
  battle: BattleSummary;
};

export function BattleCard({ battle }: BattleCardProps) {
  return (
    <Card className="h-full transition-shadow hover:shadow-md">
      <CardHeader className="gap-3">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-medium text-muted-foreground">
            #{battle.battleId}
          </span>
          <BattleStatusBadge status={battle.status} />
        </div>
        <CardTitle className="line-clamp-2 min-h-11 text-base font-semibold">
          <Link
            to={`/battles/${battle.battleId}`}
            className="hover:text-emerald-700"
          >
            {battle.title}
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">
        <div className="grid gap-2">
          <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/20 px-3 py-2">
            <span className="line-clamp-1 text-sm font-medium">
              {battle.optionA}
            </span>
            <span className="shrink-0 text-xs font-bold text-emerald-700">
              A
            </span>
          </div>
          <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/20 px-3 py-2">
            <span className="line-clamp-1 text-sm font-medium">
              {battle.optionB}
            </span>
            <span className="shrink-0 text-xs font-bold text-sky-700">B</span>
          </div>
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <Users className="size-3.5" />
              {battle.voteCount.toLocaleString()}명 참여
            </span>
            <span className="inline-flex items-center gap-1">
              <MessageSquare className="size-3.5" />
              {battle.commentCount.toLocaleString()}
            </span>
          </div>
          <span>마감 {formatDateTime(battle.endAt)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
