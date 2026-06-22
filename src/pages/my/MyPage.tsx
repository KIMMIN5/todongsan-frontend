import { PageContainer } from "@/shared/ui/page-container";
import { PageHeader } from "@/shared/ui/page-header";
import { Skeleton } from "@/shared/ui/skeleton";
import { useMyReputationQuery } from "@/entities/reputation/model/useMyReputationQuery";
import { ReputationSummaryCard } from "@/entities/reputation/ui/ReputationSummaryCard";

import { MyProfileCard } from "./ui/MyProfileCard";
import { MyPointSummaryCard } from "./ui/MyPointSummaryCard";
import { MyActivityPanel } from "./ui/MyActivityPanel";

export function MyPage() {
  const reputationQuery = useMyReputationQuery();

  return (
    <PageContainer>
      <PageHeader
        title="마이페이지"
        description="회원님의 활동 요약과 포인트 지표를 확인하세요."
      />

      <div className="grid gap-6 md:grid-cols-3">
        <MyProfileCard />

        <div className="md:col-span-2 space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <MyPointSummaryCard />

            {reputationQuery.isPending && (
              <Skeleton className="h-full min-h-36 w-full rounded-2xl" />
            )}
            {!reputationQuery.isPending && reputationQuery.data && (
              <ReputationSummaryCard reputation={reputationQuery.data} />
            )}
          </div>

          <MyActivityPanel />
        </div>
      </div>
    </PageContainer>
  );
}
