import { Trophy } from "lucide-react";

import { cn } from "@/shared/lib/utils";

import type { BattleResult, WinningOption } from "../model/battle.types";

type BattleVoteResultProps = {
  optionALabel: string;
  optionBLabel: string;
  result: BattleResult;
};

type OptionRowProps = {
  side: "A" | "B";
  label: string;
  count: number;
  ratio: number;
  isWinner: boolean;
};

function formatRatio(ratio: number): string {
  // 소수점 1자리까지 표시 (백엔드가 0~100 범위로 내려줌)
  return `${Math.round(ratio * 10) / 10}%`;
}

function OptionRow({ side, label, count, ratio, isWinner }: OptionRowProps) {
  const accent = side === "A" ? "bg-emerald-500" : "bg-sky-500";
  const tag = side === "A" ? "text-emerald-700" : "text-sky-700";

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="inline-flex items-center gap-1.5 font-medium">
          <span className={cn("text-xs font-bold", tag)}>{side}</span>
          <span className="line-clamp-1">{label}</span>
          {isWinner && (
            <Trophy className="size-3.5 text-amber-500" aria-label="승리" />
          )}
        </span>
        <span className="shrink-0 font-semibold tabular-nums">
          {formatRatio(ratio)}
          <span className="ml-1 text-xs font-normal text-muted-foreground">
            ({count.toLocaleString()})
          </span>
        </span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full transition-all", accent)}
          style={{ width: `${Math.min(Math.max(ratio, 0), 100)}%` }}
        />
      </div>
    </div>
  );
}

function winnerLabel(winningOption: WinningOption | null | undefined): string {
  if (winningOption === "A") return "A 선택지 승리";
  if (winningOption === "B") return "B 선택지 승리";
  if (winningOption === "DRAW") return "무승부";
  return "";
}

export function BattleVoteResult({
  optionALabel,
  optionBLabel,
  result,
}: BattleVoteResultProps) {
  const voteCount = result.voteCount ?? 0;
  const aCount = result.optionACount ?? 0;
  const bCount = result.optionBCount ?? 0;
  const aRatio = result.optionARatio ?? 0;
  const bRatio = result.optionBRatio ?? 0;
  const winning = result.winningOption ?? null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-muted-foreground">
          총 {voteCount.toLocaleString()}표
        </span>
        {winning && (
          <span className="text-sm font-semibold text-amber-600">
            {winnerLabel(winning)}
          </span>
        )}
      </div>

      <div className="space-y-4">
        <OptionRow
          side="A"
          label={optionALabel}
          count={aCount}
          ratio={aRatio}
          isWinner={winning === "A"}
        />
        <OptionRow
          side="B"
          label={optionBLabel}
          count={bCount}
          ratio={bRatio}
          isWinner={winning === "B"}
        />
      </div>
    </div>
  );
}
