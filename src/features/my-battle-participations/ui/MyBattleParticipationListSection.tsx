import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Swords } from "lucide-react";

import { isApiError } from "@/shared/api/apiError";
import { Button } from "@/shared/ui/button";
import { ErrorState } from "@/shared/ui/error-state";
import { Skeleton } from "@/shared/ui/skeleton";
import { ROUTE_PATH } from "@/shared/constants/routePath";

import type { MyBattleVoteListParams } from "@/entities/battle/model/battle.types";
import { useMyBattleVoteListQuery } from "@/entities/battle/model/useMyBattleVoteListQuery";
import {
  MyBattleParticipationFilterTabs,
  type BattleParticipationFilterKey,
} from "./MyBattleParticipationFilterTabs";
import { MyBattleParticipationListCard } from "./MyBattleParticipationListCard";

export function MyBattleParticipationListSection() {
  const navigate = useNavigate();
  const [activeFilterKey, setActiveFilterKey] =
    useState<BattleParticipationFilterKey>("all");
  const [filterParams, setFilterParams] = useState<
    Pick<MyBattleVoteListParams, "status">
  >({});

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    isError,
    error,
    refetch,
  } = useMyBattleVoteListQuery(filterParams);

  // 누적 목록을 pages에서 직접 파생 — setState 없이 렌더 중 계산
  const accumulated = useMemo(
    () => data?.pages.flatMap((p) => p.content) ?? [],
    [data],
  );

  const handleFilterChange = useCallback(
    (
      key: BattleParticipationFilterKey,
      params: Pick<MyBattleVoteListParams, "status">,
    ) => {
      setActiveFilterKey(key);
      setFilterParams(params);
    },
    [],
  );

  const isAllFilter = activeFilterKey === "all";

  const errorMessage = isApiError(error)
    ? error.message
    : error instanceof Error
      ? error.message
      : "내 배틀 참여 목록을 불러오는 중 문제가 발생했습니다.";

  return (
    <div className="space-y-4">
      <h2 className="text-base font-bold text-foreground">내 배틀 참여 목록</h2>

      <MyBattleParticipationFilterTabs
        activeKey={activeFilterKey}
        onChange={handleFilterChange}
      />

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
          <p className="text-center text-xs text-muted-foreground">
            내 배틀 참여 목록을 불러오는 중입니다.
          </p>
        </div>
      )}

      {isError && (
        <ErrorState
          title="내 배틀 참여 목록을 불러오지 못했습니다"
          message={errorMessage}
          action={<Button onClick={() => refetch()}>다시 시도</Button>}
        />
      )}

      {!isLoading && !isError && (
        <>
          {accumulated.length === 0 ? (
            <EmptyState
              isAllFilter={isAllFilter}
              onGoBattles={() => navigate(ROUTE_PATH.BATTLES)}
            />
          ) : (
            <div className="space-y-3">
              {accumulated.map((item) => (
                <MyBattleParticipationListCard
                  key={item.battleId}
                  item={item}
                />
              ))}
            </div>
          )}

          {hasNextPage && (
            <div className="pt-2 text-center">
              <Button
                variant="outline"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
              >
                {isFetchingNextPage ? "더 불러오는 중..." : "더보기"}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

type EmptyStateProps = {
  isAllFilter: boolean;
  onGoBattles: () => void;
};

function EmptyState({ isAllFilter, onGoBattles }: EmptyStateProps) {
  if (!isAllFilter) {
    return (
      <div className="flex flex-col items-center gap-2 py-12 text-center">
        <Swords className="size-8 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">
          조건에 맞는 배틀 참여 내역이 없습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 py-12 text-center">
      <Swords className="size-8 text-muted-foreground/40" />
      <div>
        <p className="text-sm font-medium text-foreground">
          아직 참여한 배틀이 없습니다.
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          관심 있는 배틀에 투표해보세요.
        </p>
      </div>
      <Button size="sm" onClick={onGoBattles}>
        배틀 보러 가기
      </Button>
    </div>
  );
}
