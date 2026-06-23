import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useAdminPendingBattleListQuery } from "@/entities/battle/model/useAdminPendingBattleListQuery";
import { useApproveBattleMutation } from "@/entities/battle/model/useApproveBattleMutation";
import { useRejectBattleMutation } from "@/entities/battle/model/useRejectBattleMutation";
import { useCancelBattleMutation } from "@/entities/battle/model/useCancelBattleMutation";
import { useBattleListQuery } from "@/entities/battle/model/useBattleListQuery";
import { BattleStatusBadge } from "@/entities/battle/ui/BattleStatusBadge";
import type { BattleDetail, BattleSummary } from "@/entities/battle/model/battle.types";
import { battleKeys } from "@/entities/battle/model/battle.keys";
import { toApiError } from "@/shared/api/apiError";
import { formatDate } from "@/shared/lib/formatDate";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { EmptyState } from "@/shared/ui/empty-state";
import { ErrorState } from "@/shared/ui/error-state";
import { PageContainer } from "@/shared/ui/page-container";
import { PageHeader } from "@/shared/ui/page-header";
import { Skeleton } from "@/shared/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";

const PAGE_SIZE = 10;

export default function AdminBattleListPage() {
  return (
    <PageContainer>
      <PageHeader
        title="배틀 관리"
        description="배틀을 승인, 거절하거나 진행 중인 배틀을 관리합니다."
      />

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">검수 대기</TabsTrigger>
          <TabsTrigger value="active">진행 중인 배틀</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          <PendingBattleSection />
        </TabsContent>

        <TabsContent value="active" className="mt-6">
          <ActiveBattleSection />
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}

// ── 검수 대기 탭 ──────────────────────────────────────────────

function PendingBattleSection() {
  const [page, setPage] = useState(0);
  const listQuery = useAdminPendingBattleListQuery({ page, size: PAGE_SIZE });

  return (
    <div className="space-y-6">
      {listQuery.isLoading && <AdminBattleTableSkeleton />}

      {listQuery.isError && (
        <ErrorState
          message="배틀 목록을 불러오는 중 문제가 발생했습니다."
          action={<Button onClick={() => listQuery.refetch()}>다시 시도</Button>}
        />
      )}

      {listQuery.data && listQuery.data.content.length === 0 && (
        <EmptyState
          title="검수 대기 중인 배틀이 없습니다"
          description="새로운 배틀 등록 요청이 들어오면 이곳에 표시됩니다."
        />
      )}

      {listQuery.data && listQuery.data.content.length > 0 && (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">ID</TableHead>
                  <TableHead>제목</TableHead>
                  <TableHead>선택지</TableHead>
                  <TableHead>지역</TableHead>
                  <TableHead>기간</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead className="text-right">액션</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {listQuery.data.content.map((battle) => (
                  <AdminPendingBattleRow key={battle.battleId} battle={battle} />
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              총 {listQuery.data.totalElements.toLocaleString()}건 중{" "}
              {page * PAGE_SIZE + 1}–
              {Math.min((page + 1) * PAGE_SIZE, listQuery.data.totalElements)}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              >
                이전
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={listQuery.data.last}
                onClick={() => setPage((p) => p + 1)}
              >
                다음
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function AdminPendingBattleRow({ battle }: { battle: BattleDetail }) {
  const navigate = useNavigate();
  const approveMutation = useApproveBattleMutation();
  const rejectMutation = useRejectBattleMutation();

  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);

  const isPending = battle.status === "PENDING";
  const isMutating = approveMutation.isPending || rejectMutation.isPending;

  const region =
    battle.sido && battle.sigu
      ? `${battle.sido} ${battle.sigu}`
      : battle.sido ?? "-";

  function handleApprove() {
    approveMutation.mutate(battle.battleId, {
      onSuccess: () => {
        toast.success(`배틀 #${battle.battleId}이 승인되었습니다.`);
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
    rejectMutation.mutate(battle.battleId, {
      onSuccess: () => {
        toast.success(`배틀 #${battle.battleId}이 거절되었습니다.`);
        setRejectOpen(false);
      },
      onError: (error) => {
        const apiError = toApiError(error);
        toast.error(apiError.message ?? "거절 중 오류가 발생했습니다.");
        setRejectOpen(false);
      },
    });
  }

  return (
    <TableRow>
      <TableCell className="text-muted-foreground">{battle.battleId}</TableCell>
      <TableCell className="max-w-48 truncate font-medium text-foreground">
        {battle.title}
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {battle.optionA} vs {battle.optionB}
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">{region}</TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {formatDate(battle.startAt)} ~ {formatDate(battle.endAt)}
      </TableCell>
      <TableCell>
        <BattleStatusBadge status={battle.status} />
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/admin/battles/${battle.battleId}`)}
          >
            상세
          </Button>

          {isPending && (
            <>
              <Button
                size="sm"
                disabled={isMutating}
                onClick={() => setApproveOpen(true)}
              >
                승인
              </Button>
              <Button
                variant="destructive"
                size="sm"
                disabled={isMutating}
                onClick={() => setRejectOpen(true)}
              >
                거절
              </Button>
            </>
          )}
        </div>
      </TableCell>

      {/* 승인 확인 Dialog */}
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

      {/* 거절 확인 Dialog */}
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
    </TableRow>
  );
}

// ── 진행 중인 배틀 탭 ─────────────────────────────────────────

function ActiveBattleSection() {
  const [page, setPage] = useState(0);
  const listQuery = useBattleListQuery({ status: "ACTIVE", page, size: PAGE_SIZE });

  return (
    <div className="space-y-6">
      {listQuery.isLoading && <AdminBattleTableSkeleton />}

      {listQuery.isError && (
        <ErrorState
          message="진행 중인 배틀 목록을 불러오는 중 문제가 발생했습니다."
          action={<Button onClick={() => listQuery.refetch()}>다시 시도</Button>}
        />
      )}

      {listQuery.data && listQuery.data.content.length === 0 && (
        <EmptyState
          title="진행 중인 배틀이 없습니다"
          description="현재 활성화된 배틀이 없습니다."
        />
      )}

      {listQuery.data && listQuery.data.content.length > 0 && (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">ID</TableHead>
                  <TableHead>제목</TableHead>
                  <TableHead>선택지</TableHead>
                  <TableHead>참여 수</TableHead>
                  <TableHead>기간</TableHead>
                  <TableHead className="text-right">액션</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {listQuery.data.content.map((battle) => (
                  <AdminActiveBattleRow key={battle.battleId} battle={battle} />
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              총 {listQuery.data.totalElements.toLocaleString()}건 중{" "}
              {page * PAGE_SIZE + 1}–
              {Math.min((page + 1) * PAGE_SIZE, listQuery.data.totalElements)}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              >
                이전
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={listQuery.data.last}
                onClick={() => setPage((p) => p + 1)}
              >
                다음
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function AdminActiveBattleRow({ battle }: { battle: BattleSummary }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const cancelMutation = useCancelBattleMutation();

  const [cancelOpen, setCancelOpen] = useState(false);

  function handleCancel() {
    cancelMutation.mutate(battle.battleId, {
      onSuccess: () => {
        // useCancelBattleMutation이 adminBattleKeys 무효화함.
        // 일반 배틀 목록(ACTIVE)도 함께 무효화해 탭에서 제거
        queryClient.invalidateQueries({ queryKey: battleKeys.all });
        toast.success(`배틀 #${battle.battleId}이 강제 취소되었습니다.`);
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
    <TableRow>
      <TableCell className="text-muted-foreground">{battle.battleId}</TableCell>
      <TableCell className="max-w-48 truncate font-medium text-foreground">
        {battle.title}
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {battle.optionA} vs {battle.optionB}
      </TableCell>
      <TableCell className="text-sm font-semibold text-foreground">
        {battle.voteCount.toLocaleString()}명
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {formatDate(battle.startAt)} ~ {formatDate(battle.endAt)}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/admin/battles/${battle.battleId}`)}
          >
            상세
          </Button>
          <Button
            variant="destructive"
            size="sm"
            disabled={cancelMutation.isPending}
            onClick={() => setCancelOpen(true)}
          >
            강제 취소
          </Button>
        </div>
      </TableCell>

      {/* 강제 취소 확인 Dialog */}
      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>배틀을 강제 취소하시겠습니까?</DialogTitle>
            <DialogDescription>
              강제 취소하면 진행 중인 배틀이 즉시 종료됩니다. 투표 결과 정산은
              이루어지지 않으며, 이 작업은 되돌릴 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          <p className="text-sm">
            <span className="font-semibold">{battle.title}</span>
            <span className="ml-2 text-muted-foreground">
              ({battle.voteCount.toLocaleString()}명 참여 중)
            </span>
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCancelOpen(false)}
              disabled={cancelMutation.isPending}
            >
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
    </TableRow>
  );
}

function AdminBattleTableSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, index) => (
        <Skeleton key={index} className="h-12 w-full" />
      ))}
    </div>
  );
}
