import { useNavigate } from "react-router-dom";

import { formatDateTime } from "@/shared/lib/formatDate";
import { formatPointAmount } from "@/shared/lib/formatDecimal";
import { cn } from "@/shared/lib/utils";
import { Card, CardContent } from "@/shared/ui/card";

import type { MyBattleVoteItem } from "@/entities/battle/model/battle.types";
import { BattleStatusBadge } from "@/entities/battle/ui/BattleStatusBadge";

type MyBattleParticipationListCardProps = {
  item: MyBattleVoteItem;
};

type ResultInfo = { label: string; tone: "win" | "lose" | "draw" } | null;

// 정산 전이면 결과 없음. winningOption === "DRAW"면 무승부.
function resolveResult(item: MyBattleVoteItem): ResultInfo {
  if (item.settledAt === null) return null;
  if (item.winningOption === "DRAW") return { label: "무승부", tone: "draw" };
  if (item.isWin === true) return { label: "승리", tone: "win" };
  if (item.isWin === false) return { label: "패배", tone: "lose" };
  return null;
}

export function MyBattleParticipationListCard({
  item,
}: MyBattleParticipationListCardProps) {
  const navigate = useNavigate();

  const selectedLabel = item.selectedOption === "A" ? item.optionA : item.optionB;
  const result = resolveResult(item);

  return (
    <Card
      className="cursor-pointer transition-colors hover:bg-muted/40"
      onClick={() => navigate(`/battles/${item.battleId}`)}
    >
      <CardContent className="py-4">
        <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
          <p className="text-sm font-semibold leading-snug text-foreground">
            {item.title}
          </p>
          <div className="flex shrink-0 items-center gap-1.5">
            <BattleStatusBadge
              status={item.status}
              settled={item.settledAt !== null}
            />
            {result && (
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-xs font-semibold",
                  result.tone === "win" && "bg-emerald-100 text-emerald-700",
                  result.tone === "lose" && "bg-rose-100 text-rose-700",
                  result.tone === "draw" && "bg-slate-100 text-slate-600",
                )}
              >
                {result.label}
              </span>
            )}
          </div>
        </div>

        <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 text-xs sm:grid-cols-3">
          <InfoRow label="내 선택" value={`${item.selectedOption} · ${selectedLabel}`} />
          <InfoRow label="투표일" value={formatDateTime(item.votedAt)} />
          <InfoRow label="마감" value={formatDateTime(item.endAt)} />

          {item.rewardAmount && (
            <InfoRow
              label="승리 보상"
              value={formatPointAmount(item.rewardAmount)}
              highlight
            />
          )}
        </dl>
      </CardContent>
    </Card>
  );
}

type InfoRowProps = {
  label: string;
  value: string;
  highlight?: boolean;
};

function InfoRow({ label, value, highlight = false }: InfoRowProps) {
  return (
    <div>
      <dt className="text-muted-foreground">{label}</dt>
      <dd
        className={
          highlight
            ? "mt-0.5 font-semibold text-emerald-600"
            : "mt-0.5 font-medium text-foreground"
        }
      >
        {value}
      </dd>
    </div>
  );
}
