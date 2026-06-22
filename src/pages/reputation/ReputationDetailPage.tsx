import { useParams } from "react-router-dom";

import { isApiError } from "@/shared/api/apiError";
import { useReputationQuery } from "@/entities/reputation/model/useReputationQuery";
import { ReputationSummaryCard } from "@/entities/reputation/ui/ReputationSummaryCard";
import { Button } from "@/shared/ui/button";
import { EmptyState } from "@/shared/ui/empty-state";
import { ErrorState } from "@/shared/ui/error-state";
import { PageContainer } from "@/shared/ui/page-container";
import { PageHeader } from "@/shared/ui/page-header";
import { Skeleton } from "@/shared/ui/skeleton";

export default function ReputationDetailPage() {
  const { memberId } = useParams<{ memberId: string }>();
  const isValidId = memberId !== undefined && /^\d+$/.test(memberId);
  const parsedId = isValidId ? Number(memberId) : 0;

  const { data: reputation, isLoading, isError, error, refetch } =
    useReputationQuery(parsedId);

  const isNotFound =
    isApiError(error) && error.errorCode === "REPUTATION_NOT_FOUND";

  if (!isValidId) {
    return (
      <PageContainer>
        <PageHeader title="신뢰도" />
        <ErrorState
          title="잘못된 회원 주소입니다"
          message="회원 ID를 확인한 뒤 다시 시도해 주세요."
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader title="신뢰도" description={`회원 #${memberId}`} />

      {isLoading && <Skeleton className="h-48 w-full rounded-xl" />}

      {isNotFound && (
        <EmptyState
          title="신뢰도 정보가 없습니다"
          description="아직 활동 기록이 없는 회원입니다."
        />
      )}

      {isError && !isNotFound && (
        <ErrorState
          message={
            isApiError(error)
              ? error.message
              : "신뢰도 정보를 불러오는 중 문제가 발생했습니다."
          }
          action={<Button onClick={() => refetch()}>다시 시도</Button>}
        />
      )}

      {!isLoading && reputation && <ReputationSummaryCard reputation={reputation} />}
    </PageContainer>
  );
}
