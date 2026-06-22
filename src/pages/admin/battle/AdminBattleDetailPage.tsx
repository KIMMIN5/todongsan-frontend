import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

import { useAdminBattleDetailQuery } from "@/entities/battle/model/useAdminBattleDetailQuery";
import { useApproveBattleMutation } from "@/entities/battle/model/useApproveBattleMutation";
import { useRejectBattleMutation } from "@/entities/battle/model/useRejectBattleMutation";
import { useCancelBattleMutation } from "@/entities/battle/model/useCancelBattleMutation";
import { BattleStatusBadge } from "@/entities/battle/ui/BattleStatusBadge";
import type { BattleDetail } from "@/entities/battle/model/battle.types";
import { toApiError } from "@/shared/api/apiError";
import { formatDate } from "@/shared/lib/formatDate";
import { Button } from "@/shared/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { ErrorState } from "@/shared/ui/error-state";
import { PageContainer } from "@/shared/ui/page-container";
import { PageHeader } from "@/shared/ui/page-header";
import { Skeleton } from "@/shared/ui/skeleton";

export default function AdminBattleDetailPage() {
  const { battleId } = useParams<{ battleId: string }>();
  const numericBattleId = Number(battleId);
  const navigate = useNavigate();

  const detailQuery = useAdminBattleDetailQuery(numericBattleId);

  return (
    <PageContainer>
      <PageHeader
        title="배틀 관리 상세"
        description={`배틀 ID: ${battleId}`}
        actions={
          <Button
            variant="outline"
            onClick={() => navigate("/admin/battles")}
          >
            목록으로
          </Button>
        }
      />

      {detailQuery.isLoading && <AdminBattleDetailSkeleton />}

      {detailQuery.isError && (
        <ErrorState
          message="배틀 정보를 불러오는 중 문제가 발생했습니다."
          action={<Button onClick={() => detailQuery.refetch()}>다시 시도</Button>}
        />
      )}

      {detailQuery.data && (
        <div className="space-y-6">
          <BattleInfoCard battle={detailQuery.data} />
          <BattleActionCard battleId={numericBattleId} battle={detailQuery.data} />
        </div>
      )}
    </PageContainer>
  );
}

function BattleInfoCard({ battle }: { battle: BattleDetail }) {
  const region =
    battle.sido && battle.sigu
      ? `${battle.sido} ${battle.sigu}`
      : battle.sido ?? "지역 없음";

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-xl">{battle.title}</CardTitle>
          <BattleStatusBadge
            status={battle.status}
            settled={battle.settledAt !== null}
          />
        </div>
        <CardDescription>
          {region} · {formatDate(battle.startAt)} ~ {formatDate(battle.endAt)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <InfoItem label="선택지 A" value={battle.optionA} />
          <InfoItem label="선택지 B" value={battle.optionB} />
          <InfoItem label="총 투표 수" value={`${battle.voteCount.toLocaleString()}표`} />
          <InfoItem label="A 투표" value={`${battle.optionACount.toLocaleString()}표`} />
          <InfoItem label="B 투표" value={`${battle.optionBCount.toLocaleString()}표`} />
          <InfoItem
            label="우승 선택지"
            value={battle.winningOption ?? "미정"}
          />
          <InfoItem label="등록자 ID" value={String(battle.createdBy)} />
          <InfoItem label="등록일" value={formatDate(battle.createdAt)} />
          {battle.settledAt && (
            <InfoItem label="정산일" value={formatDate(battle.settledAt)} />
          )}
        </dl>
      </CardContent>
    </Card>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted/40 p-3">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium text-foreground">{value}</dd>
    </div>
  );
}

function BattleActionCard({
  battleId,
  battle,
}: {
  battleId: number;
  battle: BattleDetail;
}) {
  const approveMutation = useApproveBattleMutation();
  const rejectMutation = useRejectBattleMutation();
  const cancelMutation = useCancelBattleMutation();

  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);

  const isMutating =
    approveMutation.isPending ||
    rejectMutation.isPending ||
    cancelMutation.isPending;

  const isPending = battle.status === "PENDING";
  const isActive = battle.status === "ACTIVE";

  function handleApprove() {
    approveMutation.mutate(battleId, {
      onSuccess: () => {
        toast.success("배틀이 승인되었습니다.");
        setApproveOpen(false);
      },
      onError: (error) => {
        const apiError = toApiError(error);
        toast.error(apiError.message ?? "승인 중 오류가 발생했습니다.");
        setApproveOpen(false);
      },
    });
  }

  function handleReject() {
    rejectMutation.mutate(battleId, {
      onSuccess: () => {
        toast.success("배틀이 거절되었습니다.");
        setRejectOpen(false);
      },
      onError: (error) => {
        const apiError = toApiError(error);
        toast.error(apiError.message ?? "거절 중 오류가 발생했습니다.");
        setRejectOpen(false);
      },
    });
  }

  function handleCancel() {
    cancelMutation.mutate(battleId, {
      onSuccess: () => {
        toast.success("배틀이 강제 취소되었습니다.");
        setCancelOpen(false);
      },
      onError: (error) => {
        const apiError = toApiError(error);
        toast.error(apiError.message ?? "취소 중 오류가 발생했습니다.");
        setCancelOpen(false);
      },
    });
  }

  if (!isPending && !isActive) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>관리 액션</CardTitle>
          <CardDescription>
            {battle.status === "CLOSED"
              ? "투표가 종료된 배틀입니다."
              : "취소된 배틀입니다. 더 이상 관리 액션을 수행할 수 없습니다."}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>관리 액션</CardTitle>
        <CardDescription>
          {isPending
            ? "이 배틀을 승인하거나 거절할 수 있습니다."
            : "진행 중인 배틀을 강제 취소할 수 있습니다."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-3">
          {isPending && (
            <>
              <Button
                disabled={isMutating}
                onClick={() => setApproveOpen(true)}
              >
                배틀 승인
              </Button>
              <Button
                variant="destructive"
                disabled={isMutating}
                onClick={() => setRejectOpen(true)}
              >
                배틀 거절
              </Button>
            </>
          )}

          {isActive && (
            <Button
              variant="destructive"
              disabled={isMutating}
              onClick={() => setCancelOpen(true)}
            >
              강제 취소
            </Button>
          )}
        </div>
      </CardContent>

      {/* 승인 Dialog */}
      <Dialog open={approveOpen} onOpenChange={setApproveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>배틀을 승인하시겠습니까?</DialogTitle>
            <DialogDescription>
              승인하면 배틀이 활성화되어 사용자들이 투표할 수 있게 됩니다.
            </DialogDescription>
          </DialogHeader>
          <p className="text-sm">
            <span className="font-semibold">{battle.title}</span>
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveOpen(false)}>
              취소
            </Button>
            <Button onClick={handleApprove} disabled={approveMutation.isPending}>
              {approveMutation.isPending ? "승인 중..." : "승인합니다"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 거절 Dialog */}
      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>배틀을 거절하시겠습니까?</DialogTitle>
            <DialogDescription>
              거절하면 배틀이 취소 상태로 변경됩니다. 이 작업은 되돌릴 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          <p className="text-sm">
            <span className="font-semibold">{battle.title}</span>
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectOpen(false)}>
              취소
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={rejectMutation.isPending}
            >
              {rejectMutation.isPending ? "거절 중..." : "거절합니다"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 강제 취소 Dialog */}
      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>배틀을 강제 취소하시겠습니까?</DialogTitle>
            <DialogDescription>
              강제 취소하면 진행 중인 배틀이 즉시 종료됩니다. 이 작업은 되돌릴 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          <p className="text-sm">
            <span className="font-semibold">{battle.title}</span>
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelOpen(false)}>
              취소
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={cancelMutation.isPending}
            >
              {cancelMutation.isPending ? "취소 중..." : "강제 취소합니다"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function AdminBattleDetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-48 w-full" />
      <Skeleton className="h-32 w-full" />
    </div>
  );
}
