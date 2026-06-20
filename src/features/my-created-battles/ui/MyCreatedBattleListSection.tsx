import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Swords } from "lucide-react";

import { isApiError } from "@/shared/api/apiError";
import { Button } from "@/shared/ui/button";
import { ErrorState } from "@/shared/ui/error-state";
import { Skeleton } from "@/shared/ui/skeleton";
import { ROUTE_PATH } from "@/shared/constants/routePath";

import type { MyCreatedBattleListParams } from "@/entities/battle/model/battle.types";
import { useMyCreatedBattleListQuery } from "@/entities/battle/model/useMyCreatedBattleListQuery";
import {
  MyCreatedBattleFilterTabs,
  type CreatedBattleFilterKey,
} from "./MyCreatedBattleFilterTabs";
import { MyCreatedBattleListCard } from "./MyCreatedBattleListCard";

export function MyCreatedBattleListSection() {
  const navigate = useNavigate();
  const [activeFilterKey, setActiveFilterKey] =
    useState<CreatedBattleFilterKey>("all");
  const [filterParams, setFilterParams] = useState<
    Pick<MyCreatedBattleListParams, "status">
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
  } = useMyCreatedBattleListQuery(filterParams);

  // 누적 목록을 pages에서 직접 파생 — setState 없이 렌더 중 계산
  const accumulated = useMemo(
    () => data?.pages.flatMap((p) => p.content) ?? [],
    [data],
  );

  const handleFilterChange = useCallback(
    (
      key: CreatedBattleFilterKey,
      params: Pick<MyCreatedBattleListParams, "status">,
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
      : "내가 만든 배틀 목록을 불러오는 중 문제가 발생했습니다.";

  return (
    <div className="space-y-4">
      <h2 className="text-base font-bold text-foreground">내가 만든 배틀</h2>

      <MyCreatedBattleFilterTabs
        activeKey={activeFilterKey}
        onChange={handleFilterChange}
      />

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
          <p className="text-center text-xs text-muted-foreground">
            내가 만든 배틀 목록을 불러오는 중입니다.
          </p>
        </div>
      )}

      {isError && (
        <ErrorState
          title="내가 만든 배틀 목록을 불러오지 못했습니다"
          message={errorMessage}
          action={<Button onClick={() => refetch()}>다시 시도</Button>}
        />
      )}

      {!isLoading && !isError && (
        <>
          {accumulated.length === 0 ? (
            <EmptyState
              isAllFilter={isAllFilter}
              onCreateBattle={() => navigate(ROUTE_PATH.BATTLE_CREATE)}
            />
          ) : (
            <div className="space-y-3">
              {accumulated.map((item) => (
                <MyCreatedBattleListCard key={item.battleId} item={item} />
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
  onCreateBattle: () => void;
};

function EmptyState({ isAllFilter, onCreateBattle }: EmptyStateProps) {
  if (!isAllFilter) {
    return (
      <div className="flex flex-col items-center gap-2 py-12 text-center">
        <Swords className="size-8 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">
          조건에 맞는 배틀이 없습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 py-12 text-center">
      <Swords className="size-8 text-muted-foreground/40" />
      <div>
        <p className="text-sm font-medium text-foreground">
          아직 만든 배틀이 없습니다.
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          새로운 배틀 주제를 등록해보세요.
        </p>
      </div>
      <Button size="sm" onClick={onCreateBattle}>
        배틀 만들기
      </Button>
    </div>
  );
}
