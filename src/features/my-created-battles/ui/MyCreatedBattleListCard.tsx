import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { useCancelMyBattleMutation } from "@/entities/battle/model/useCancelMyBattleMutation";
import type { MyCreatedBattleItem } from "@/entities/battle/model/battle.types";
import { BattleStatusBadge } from "@/entities/battle/ui/BattleStatusBadge";
import { toApiError } from "@/shared/api/apiError";
import { formatDateTime } from "@/shared/lib/formatDate";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";

type MyCreatedBattleListCardProps = {
  item: MyCreatedBattleItem;
};

export function MyCreatedBattleListCard({
  item,
}: MyCreatedBattleListCardProps) {
  const navigate = useNavigate();
  const cancelMutation = useCancelMyBattleMutation();
  const [cancelOpen, setCancelOpen] = useState(false);

  // 공개 상세(GET /battles/{id})는 ACTIVE/CLOSED만 조회 가능.
  // PENDING(검수 대기)/CANCELLED는 일반 상세에서 404라 이동시키지 않는다.
  const isOpenable = item.status === "ACTIVE" || item.status === "CLOSED";

  function handleCancel() {
    cancelMutation.mutate(item.battleId, {
      onSuccess: () => {
        toast.success("배틀 등록이 취소되었습니다.");
        setCancelOpen(false);
      },
      onError: (error) => {
        const apiError = toApiError(error);
        toast.error(apiError.message ?? "취소 중 오류가 발생했습니다.");
        setCancelOpen(false);
      },
    });
  }

  return (
    <>
      <Card
        className={cn(
          "transition-colors",
          isOpenable && "cursor-pointer hover:bg-muted/40",
        )}
        onClick={isOpenable ? () => navigate(`/battles/${item.battleId}`) : undefined}
      >
        <CardContent className="py-4">
          <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
            <p className="text-sm font-semibold leading-snug text-foreground">
              {item.title}
            </p>
            <div className="flex shrink-0 items-center gap-2">
              <BattleStatusBadge
                status={item.status}
                settled={item.settledAt !== null}
              />
              {item.status === "PENDING" && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6 px-2 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                  disabled={cancelMutation.isPending}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCancelOpen(true);
                  }}
                >
                  취소
                </Button>
              )}
            </div>
          </div>

          <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 text-xs sm:grid-cols-3">
            <InfoRow label="대결" value={`${item.optionA} vs ${item.optionB}`} />
            <InfoRow label="참여 수" value={`${item.voteCount.toLocaleString()}명`} />
            <InfoRow label="마감" value={formatDateTime(item.endAt)} />
            <InfoRow label="등록일" value={formatDateTime(item.createdAt)} />
          </dl>

          {item.status === "PENDING" && (
            <p className="mt-3 text-xs text-muted-foreground">
              관리자 검수 후 공개됩니다.
            </p>
          )}
        </CardContent>
      </Card>

      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>배틀 등록을 취소하시겠습니까?</DialogTitle>
            <DialogDescription>
              검수 대기 중인 배틀 등록을 취소합니다. 이 작업은 되돌릴 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          <p className="text-sm">
            <span className="font-semibold">{item.title}</span>
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCancelOpen(false)}
              disabled={cancelMutation.isPending}
            >
              닫기
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={cancelMutation.isPending}
            >
              {cancelMutation.isPending ? "취소 중..." : "등록 취소합니다"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

type InfoRowProps = {
  label: string;
  value: string;
};

function InfoRow({ label, value }: InfoRowProps) {
  return (
    <div>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 font-medium text-foreground">{value}</dd>
    </div>
  );
}
