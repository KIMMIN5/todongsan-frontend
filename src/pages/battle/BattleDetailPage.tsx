import { Link, useNavigate, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, CalendarDays, MapPin, Users } from "lucide-react";

import { useAuth } from "@/entities/auth/model/useAuth";
import { useBattleDetailQuery } from "@/entities/battle/model/useBattleDetailQuery";
import { useBattleResultQuery } from "@/entities/battle/model/useBattleResultQuery";
import { BattleCommentSection } from "@/entities/battle/ui/BattleCommentSection";
import { BattleStatusBadge } from "@/entities/battle/ui/BattleStatusBadge";
import { BattleVotePanel } from "@/entities/battle/ui/BattleVotePanel";
import { pointKeys } from "@/entities/point/model/point.keys";
import { isApiError } from "@/shared/api/apiError";
import { ROUTE_PATH } from "@/shared/constants/routePath";
import { formatDateTime } from "@/shared/lib/formatDate";
import { formatPointAmount } from "@/shared/lib/formatDecimal";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { EmptyState } from "@/shared/ui/empty-state";
import { ErrorState } from "@/shared/ui/error-state";
import { PageContainer } from "@/shared/ui/page-container";
import { Skeleton } from "@/shared/ui/skeleton";

export default function BattleDetailPage() {
  const { battleId } = useParams<{ battleId: string }>();
  const isValidId = battleId !== undefined && /^\d+$/.test(battleId);
  const parsedId = isValidId ? Number(battleId) : 0;

  const detailQuery = useBattleDetailQuery(parsedId);
  const resultQuery = useBattleResultQuery(parsedId);

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated, memberId, nickname } = useAuth();

  const handleRequireLogin = () => {
    toast.error("로그인이 필요합니다.");
    navigate(ROUTE_PATH.LOGIN);
  };

  // 투표/댓글 보상으로 포인트 잔액이 바뀌므로 성공 시 page 레벨에서 무효화
  const invalidatePointBalance = () => {
    queryClient.invalidateQueries({ queryKey: pointKeys.balance() });
  };

  if (!isValidId) {
    return (
      <PageContainer>
        <BackLink />
        <ErrorState
          title="잘못된 배틀 주소입니다"
          message="배틀 ID를 확인한 뒤 다시 시도해 주세요."
        />
      </PageContainer>
    );
  }

  if (detailQuery.isLoading) {
    return (
      <PageContainer>
        <BackLink />
        <BattleDetailSkeleton />
      </PageContainer>
    );
  }

  if (detailQuery.isError) {
    const message = isApiError(detailQuery.error)
      ? detailQuery.error.message
      : "배틀 정보를 불러오는 중 문제가 발생했습니다.";
    const notFound =
      isApiError(detailQuery.error) &&
      detailQuery.error.errorCode === "BATTLE_NOT_FOUND";

    return (
      <PageContainer>
        <BackLink />
        {notFound ? (
          <EmptyState
            title="배틀을 찾을 수 없습니다"
            description="이미 종료되었거나 존재하지 않는 배틀입니다."
            action={
              <Button render={<Link to="/battles" />}>목록으로 돌아가기</Button>
            }
          />
        ) : (
          <ErrorState
            message={message}
            action={
              <Button onClick={() => detailQuery.refetch()}>다시 시도</Button>
            }
          />
        )}
      </PageContainer>
    );
  }

  const battle = detailQuery.data;
  if (!battle) {
    return (
      <PageContainer>
        <BackLink />
        <EmptyState
          title="배틀을 찾을 수 없습니다"
          description="요청한 배틀이 존재하지 않거나 조회할 수 없습니다."
        />
      </PageContainer>
    );
  }

  const region = [battle.sido, battle.sigu].filter(Boolean).join(" ");
  const settled = battle.settledAt !== null;
  const hasReward = settled && battle.winningOption !== "DRAW";

  return (
    <PageContainer>
      <BackLink />

      {/* 헤더 */}
      <div className="space-y-3 border-b border-slate-200/60 pb-5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">
            #{battle.battleId}
          </span>
          <BattleStatusBadge status={battle.status} settled={settled} />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          {battle.title}
        </h1>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
          {region && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-4" />
              {region}
            </span>
          )}
          <span className="inline-flex items-center gap-1">
            <Users className="size-4" />
            {battle.voteCount.toLocaleString()}명 참여
          </span>
          <span className="inline-flex items-center gap-1">
            <CalendarDays className="size-4" />
            {formatDateTime(battle.startAt)} ~ {formatDateTime(battle.endAt)}
          </span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        {/* 투표 */}
        <Card>
          <CardHeader>
            <CardTitle>
              {battle.status === "ACTIVE" && !resultQuery.data?.voted
                ? "투표하기"
                : "투표 결과"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {resultQuery.isLoading && (
              <div className="space-y-3">
                <Skeleton className="h-14 w-full rounded-xl" />
                <Skeleton className="h-14 w-full rounded-xl" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
            )}

            {resultQuery.isError && (
              <ErrorState
                title="투표 정보를 불러오지 못했습니다"
                message={
                  isApiError(resultQuery.error)
                    ? resultQuery.error.message
                    : "잠시 후 다시 시도해 주세요."
                }
                action={
                  <Button onClick={() => resultQuery.refetch()}>
                    다시 시도
                  </Button>
                }
              />
            )}

            {resultQuery.data && (
              <BattleVotePanel
                battleId={battle.battleId}
                optionA={battle.optionA}
                optionB={battle.optionB}
                status={battle.status}
                startAt={battle.startAt}
                result={resultQuery.data}
                isAuthenticated={isAuthenticated}
                onRequireLogin={handleRequireLogin}
                onVoteSuccess={invalidatePointBalance}
              />
            )}
          </CardContent>
        </Card>

        {/* 정보 */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>배틀 정보</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-3 text-sm">
              <InfoRow label="선택지 A" value={battle.optionA} />
              <InfoRow label="선택지 B" value={battle.optionB} />
              {region && <InfoRow label="지역" value={region} />}
              <InfoRow
                label="시작"
                value={formatDateTime(battle.startAt)}
              />
              <InfoRow label="마감" value={formatDateTime(battle.endAt)} />
              {hasReward && (
                <InfoRow
                  label="승리 보상"
                  value={formatPointAmount(battle.rewardAmount)}
                />
              )}
            </dl>
          </CardContent>
        </Card>
      </div>

      {/* 댓글 */}
      <Card>
        <CardContent className="pt-6">
          <BattleCommentSection
            battleId={battle.battleId}
            status={battle.status}
            isAuthenticated={isAuthenticated}
            currentMemberId={memberId}
            currentNickname={nickname}
            unauthenticatedFallback={<CommentLoginRequired />}
            onCommentSuccess={invalidatePointBalance}
          />
        </CardContent>
      </Card>

    </PageContainer>
  );
}

function BackLink() {
  return (
    <Link
      to="/battles"
      className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
    >
      <ArrowLeft className="size-4" />
      배틀 목록
    </Link>
  );
}

function CommentLoginRequired() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-muted/20 px-4 py-6 text-center">
      <p className="text-sm text-muted-foreground">
        댓글을 작성하려면 로그인이 필요합니다.
      </p>
      <Button
        render={<Link to={ROUTE_PATH.LOGIN} />}
        variant="outline"
        size="sm"
      >
        로그인하기
      </Button>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="shrink-0 text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium text-foreground">{value}</dd>
    </div>
  );
}

function BattleDetailSkeleton() {
  return (
    <>
      <div className="space-y-3 border-b border-slate-200/60 pb-5">
        <Skeleton className="h-5 w-24 rounded-full" />
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="rounded-xl border border-border bg-card p-4">
          <Skeleton className="h-6 w-24" />
          <div className="mt-5 space-y-3">
            <Skeleton className="h-14 w-full rounded-xl" />
            <Skeleton className="h-14 w-full rounded-xl" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <Skeleton className="h-6 w-24" />
          <div className="mt-5 space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-10/12" />
            <Skeleton className="h-4 w-11/12" />
          </div>
        </div>
      </div>
    </>
  );
}

export { BattleDetailPage as Component };
