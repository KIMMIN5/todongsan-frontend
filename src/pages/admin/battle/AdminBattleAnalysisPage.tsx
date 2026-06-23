import { useParams } from "react-router-dom";

import { useAdminBattleDetailQuery } from "@/entities/battle/model/useAdminBattleDetailQuery";
import type { BattleDetail } from "@/entities/battle/model/battle.types";
import { BattleStatusBadge } from "@/entities/battle/ui/BattleStatusBadge";
import { formatDate } from "@/shared/lib/formatDate";
import { formatPointAmount } from "@/shared/lib/formatDecimal";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { ErrorState } from "@/shared/ui/error-state";
import { PageContainer } from "@/shared/ui/page-container";
import { PageHeader } from "@/shared/ui/page-header";
import { Skeleton } from "@/shared/ui/skeleton";

export default function AdminBattleAnalysisPage() {
  const { battleId } = useParams<{ battleId: string }>();
  const numericBattleId = Number(battleId);

  const { data, isLoading, isError, refetch } = useAdminBattleDetailQuery(numericBattleId);

  return (
    <PageContainer>
      <PageHeader
        title="배틀 교차분석"
        description={`배틀 ID: ${battleId}`}
      />

      {isLoading && <AnalysisSkeleton />}

      {isError && (
        <ErrorState
          message="배틀 정보를 불러오는 중 문제가 발생했습니다."
          action={<Button onClick={() => refetch()}>다시 시도</Button>}
        />
      )}

      {data && <BattleAnalysisCard battle={data} />}
    </PageContainer>
  );
}

function BattleAnalysisCard({ battle }: { battle: BattleDetail }) {
  const { voteCount, optionACount, optionBCount, winningOption, status } = battle;

  const aRatio = voteCount > 0 ? (optionACount / voteCount) * 100 : 0;
  const bRatio = voteCount > 0 ? (optionBCount / voteCount) * 100 : 0;

  const region =
    [battle.sido, battle.sigu].filter(Boolean).join(" ") || "전국";

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-xl">{battle.title}</CardTitle>
          <BattleStatusBadge status={status} settled={battle.settledAt !== null} />
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* 투표 분포 */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-slate-700">투표 분포</h3>
            {status === "CLOSED" && winningOption !== null && (
              <WinnerBadge winningOption={winningOption} />
            )}
          </div>

          {voteCount === 0 ? (
            <p className="py-4 text-center text-sm text-slate-400">
              아직 투표 데이터가 없습니다
            </p>
          ) : (
            <div className="space-y-3">
              <VoteBar
                label={battle.optionA}
                prefix="A"
                count={optionACount}
                ratio={aRatio}
                color="bg-blue-500"
              />
              <VoteBar
                label={battle.optionB}
                prefix="B"
                count={optionBCount}
                ratio={bRatio}
                color="bg-slate-400"
              />
            </div>
          )}
        </section>

        {/* KPI 그리드 2×2 */}
        <section>
          <h3 className="text-sm font-semibold text-slate-700 mb-3">기본 정보</h3>
          <dl className="grid grid-cols-2 gap-3">
            <KpiItem label="총 투표" value={`${voteCount.toLocaleString()}표`} />
            <KpiItem label="보상" value={formatPointAmount(battle.rewardAmount)} />
            <KpiItem label="지역" value={region} />
            <KpiItem
              label="기간"
              value={`${formatDate(battle.startAt)} ~ ${formatDate(battle.endAt)}`}
            />
          </dl>
        </section>
      </CardContent>
    </Card>
  );
}

function WinnerBadge({ winningOption }: { winningOption: "A" | "B" | "DRAW" }) {
  if (winningOption === "DRAW") {
    return <Badge variant="neutral">무승부</Badge>;
  }
  return (
    <Badge variant={winningOption === "A" ? "success" : "info"}>
      {winningOption} 승리
    </Badge>
  );
}

function VoteBar({
  label,
  prefix,
  count,
  ratio,
  color,
}: {
  label: string;
  prefix: "A" | "B";
  count: number;
  ratio: number;
  color: string;
}) {
  const pct = Math.round(ratio);
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs text-slate-600">
        <span className="truncate font-medium max-w-[60%]">
          <span className="mr-1 font-bold">{prefix}.</span>
          {label}
        </span>
        <span className="ml-2 shrink-0 tabular-nums">
          {pct}% · {count.toLocaleString()}표
        </span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className={`${color} h-full rounded-full transition-all duration-300`}
          style={{ width: `${ratio.toFixed(2)}%` }}
        />
      </div>
    </div>
  );
}

function KpiItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted/40 p-3">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium text-foreground">{value}</dd>
    </div>
  );
}

function AnalysisSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-48 w-full" />
      <Skeleton className="h-32 w-full" />
    </div>
  );
}
