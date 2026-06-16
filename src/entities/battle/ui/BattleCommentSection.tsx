import { useState } from "react";

import { isApiError } from "@/shared/api/apiError";
import { Button } from "@/shared/ui/button";
import { EmptyState } from "@/shared/ui/empty-state";
import { ErrorState } from "@/shared/ui/error-state";
import { Skeleton } from "@/shared/ui/skeleton";

import type { BattleStatus } from "../model/battle.types";
import { useBattleCommentsQuery } from "../model/useBattleCommentsQuery";
import { BattleCommentForm } from "./BattleCommentForm";
import { BattleCommentList } from "./BattleCommentList";

const COMMENT_PAGE_SIZE = 10;

type BattleCommentSectionProps = {
  battleId: number;
  status: BattleStatus;
  isAuthenticated: boolean;
  currentMemberId: number | null;
  currentNickname: string | null;
  /** 댓글 작성 성공 후 page 레벨 후처리 (예: 포인트 잔액 무효화) */
  onCommentSuccess?: () => void;
};

export function BattleCommentSection({
  battleId,
  status,
  isAuthenticated,
  currentMemberId,
  currentNickname,
  onCommentSuccess,
}: BattleCommentSectionProps) {
  const [page, setPage] = useState(0);

  const { data, error, isError, isLoading, isFetching, refetch } =
    useBattleCommentsQuery(battleId, { page, size: COMMENT_PAGE_SIZE });

  const isCommentable = status === "ACTIVE";
  const totalElements = data?.totalElements ?? 0;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-semibold">댓글</h2>
        <span className="text-sm font-medium text-muted-foreground">
          {totalElements.toLocaleString()}
        </span>
      </div>

      <BattleCommentForm
        battleId={battleId}
        isAuthenticated={isAuthenticated}
        disabled={!isCommentable}
        onCommentSuccess={onCommentSuccess}
      />

      {isLoading && (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-full" />
            </div>
          ))}
        </div>
      )}

      {isError && (
        <ErrorState
          title="댓글을 불러오지 못했습니다"
          message={
            isApiError(error)
              ? error.message
              : "댓글을 불러오는 중 문제가 발생했습니다."
          }
          action={<Button onClick={() => refetch()}>다시 시도</Button>}
        />
      )}

      {data && data.content.length === 0 && (
        <EmptyState
          title="아직 댓글이 없습니다"
          description="가장 먼저 의견을 남겨보세요."
        />
      )}

      {data && data.content.length > 0 && (
        <>
          <BattleCommentList
            battleId={battleId}
            comments={data.content}
            currentMemberId={currentMemberId}
            currentNickname={currentNickname}
          />

          {data.totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                disabled={data.first || isFetching}
                onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
              >
                이전
              </Button>
              <span className="text-sm text-muted-foreground">
                {data.number + 1} / {data.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={data.last || isFetching}
                onClick={() => setPage((prev) => prev + 1)}
              >
                다음
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
