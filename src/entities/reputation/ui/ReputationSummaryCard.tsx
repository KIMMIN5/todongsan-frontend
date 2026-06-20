import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";

import type { Reputation } from "../model/reputation.types";

type ReputationSummaryCardProps = {
  reputation: Reputation;
};

export function ReputationSummaryCard({
  reputation,
}: ReputationSummaryCardProps) {
  const region =
    reputation.residenceSido && reputation.residenceSigu
      ? `${reputation.residenceSido} ${reputation.residenceSigu}`
      : reputation.residenceSido ?? "미설정";

  const visitCount =
    reputation.visitCertifications?.length ??
    reputation.visitCertificationCount ??
    0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">신뢰도</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <InfoItem label="활동 점수" value={String(reputation.activityScore)} />
        <InfoItem
          label="예측 정확도"
          value={`${reputation.predictionAccuracy.toFixed(1)}%`}
        />
        <InfoItem
          label="총 예측"
          value={`${reputation.predictionCount}회`}
        />
        <InfoItem label="거주지" value={region} />
        <InfoItem label="방문 인증" value={`${visitCount}회`} />
        <InfoItem
          label="활동 인증"
          value={reputation.activityConfirmed ? "인증 완료" : "미인증"}
        />
      </CardContent>
    </Card>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-semibold text-foreground">{value}</p>
    </div>
  );
}
