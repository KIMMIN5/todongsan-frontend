import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CheckCircle2, Clock, Lock } from "lucide-react";

import { isApiError } from "@/shared/api/apiError";
import { formatDateTime } from "@/shared/lib/formatDate";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";

import { battleKeys } from "../model/battle.keys";
import type {
  BattleOption,
  BattleResult,
  BattleStatus,
} from "../model/battle.types";
import { useCreateVote } from "../model/useCreateVote";
import { BattleVoteResult } from "./BattleVoteResult";

type BattleVotePanelProps = {
  battleId: number;
  optionA: string;
  optionB: string;
  status: BattleStatus;
  startAt: string;
  result: BattleResult;
  isAuthenticated: boolean;
  /** 비로그인 사용자가 투표를 시도할 때 호출 (로그인 토스트/이동은 page에서 처리) */
  onRequireLogin: () => void;
  /** 투표 성공 후 page 레벨 후처리 (예: 포인트 잔액 무효화) */
  onVoteSuccess?: () => void;
};

type OptionButtonProps = {
  side: "A" | "B";
  label: string;
  selected: boolean;
  disabled: boolean;
  onSelect: () => void;
};

function OptionButton({
  side,
  label,
  selected,
  disabled,
  onSelect,
}: OptionButtonProps) {
  const accent = side === "A" ? "text-emerald-700" : "text-sky-700";

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-3.5 text-left text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60",
        selected
          ? "border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500"
          : "border-border bg-white hover:bg-muted/40",
      )}
    >
      <span className="line-clamp-2">{label}</span>
      <span className={cn("shrink-0 text-base font-bold", accent)}>{side}</span>
    </button>
  );
}

export function BattleVotePanel({
  battleId,
  optionA,
  optionB,
  status,
  startAt,
  result,
  isAuthenticated,
  onRequireLogin,
  onVoteSuccess,
}: BattleVotePanelProps) {
  const queryClient = useQueryClient();
  const voteMutation = useCreateVote(battleId);

  const [selected, setSelected] = useState<BattleOption | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  // 마운트 시점 기준으로 시작 전 여부 판단 (렌더 중 impure 호출 회피)
  const [nowMs] = useState(() => Date.now());

  const notStarted = new Date(startAt).getTime() > nowMs;
  const isActive = status === "ACTIVE";
  const canVote = isActive && !notStarted && !result.voted;

  // 1) ACTIVE + 이미 투표한 경우 → 종료 후 결과 공개 (익명 투표)
  if (result.voted && status === "ACTIVE") {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-emerald-200 bg-emerald-50/50 py-8 text-center">
        <CheckCircle2 className="size-6 text-emerald-600" />
        <p className="text-sm font-medium text-emerald-700">
          투표에 참여하셨습니다.
        </p>
        <p className="text-xs text-muted-foreground">
          배틀이 종료된 후 결과를 확인할 수 있습니다.
        </p>
      </div>
    );
  }

  // 2) 종료된 배틀
  if (status === "CLOSED") {
    const resultContent = result.resultVisible ? (
      <BattleVoteResult
        optionALabel={optionA}
        optionBLabel={optionB}
        result={result}
      />
    ) : (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border bg-muted/20 py-8 text-center">
        <Lock className="size-6 text-muted-foreground/70" />
        <p className="text-sm text-muted-foreground">
          {result.message ?? "투표 종료 72시간 후 결과가 공개됩니다."}
        </p>
      </div>
    );

    if (result.voted) {
      return (
        <div className="space-y-4">
          <p className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700">
            <CheckCircle2 className="size-4" />
            투표에 참여하셨습니다.
          </p>
          {resultContent}
        </div>
      );
    }
    return resultContent;
  }

  // 3) 진행 중이지만 아직 시작 전
  if (isActive && notStarted) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border bg-muted/20 py-8 text-center">
        <Clock className="size-6 text-muted-foreground/70" />
        <p className="text-sm text-muted-foreground">투표 시작 전입니다.</p>
        <p className="text-xs text-muted-foreground">
          {formatDateTime(startAt)}부터 투표할 수 있어요.
        </p>
      </div>
    );
  }

  const handleVoteClick = () => {
    if (!selected) return;
    if (!isAuthenticated) {
      onRequireLogin();
      return;
    }
    setConfirmOpen(true);
  };

  const handleConfirm = () => {
    if (!selected) return;
    voteMutation.mutate(
      { option: selected },
      {
        onSuccess: (data) => {
          setConfirmOpen(false);
          setSelected(null);
          toast.success(data.message ?? "투표가 완료되었습니다.");
          onVoteSuccess?.();
        },
        onError: (error) => {
          setConfirmOpen(false);
          const errorCode = isApiError(error) ? error.errorCode : undefined;
          const message = isApiError(error)
            ? error.message
            : "투표 처리 중 문제가 발생했습니다.";
          toast.error(message);

          // 이미 투표했거나 종료된 경우 최신 상태로 동기화
          if (
            errorCode === "BATTLE_ALREADY_VOTED" ||
            errorCode === "BATTLE_CLOSED"
          ) {
            queryClient.invalidateQueries({
              queryKey: battleKeys.result(battleId),
            });
            queryClient.invalidateQueries({
              queryKey: battleKeys.detail(battleId),
            });
          }
        },
      },
    );
  };

  const selectedLabel =
    selected === "A" ? optionA : selected === "B" ? optionB : "";

  return (
    <div className="space-y-4">
      {canVote ? (
        <>
          <div className="space-y-2.5">
            <OptionButton
              side="A"
              label={optionA}
              selected={selected === "A"}
              disabled={voteMutation.isPending}
              onSelect={() => setSelected("A")}
            />
            <OptionButton
              side="B"
              label={optionB}
              selected={selected === "B"}
              disabled={voteMutation.isPending}
              onSelect={() => setSelected("B")}
            />
          </div>

          <p className="text-xs text-muted-foreground">
            투표는 1인 1표이며, 한 번 투표하면 변경할 수 없습니다.
          </p>

          <Button
            className="w-full"
            size="lg"
            disabled={!selected || voteMutation.isPending}
            onClick={handleVoteClick}
          >
            {isAuthenticated ? "투표하기" : "로그인하고 투표하기"}
          </Button>
        </>
      ) : null}

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>투표 확인</DialogTitle>
            <DialogDescription>
              <strong className="font-semibold text-foreground">
                {selectedLabel}
              </strong>
              에 투표하시겠어요? 투표 후에는 변경하거나 취소할 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose
              render={
                <Button variant="outline" disabled={voteMutation.isPending} />
              }
            >
              취소
            </DialogClose>
            <Button onClick={handleConfirm} disabled={voteMutation.isPending}>
              {voteMutation.isPending ? "투표 중..." : "투표하기"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
