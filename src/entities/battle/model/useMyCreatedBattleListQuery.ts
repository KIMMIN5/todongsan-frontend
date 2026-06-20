import { useInfiniteQuery } from "@tanstack/react-query";

import { getMyCreatedBattles } from "../api/battleApi";
import { battleKeys } from "./battle.keys";
import type { MyCreatedBattleListParams } from "./battle.types";

type MyCreatedBattleFilters = Omit<MyCreatedBattleListParams, "page" | "size">;

const PAGE_SIZE = 20;

export function useMyCreatedBattleListQuery(filters: MyCreatedBattleFilters) {
  return useInfiniteQuery({
    queryKey: battleKeys.myCreatedList(filters),
    initialPageParam: 0,
    queryFn: ({ pageParam }) =>
      getMyCreatedBattles({ ...filters, page: pageParam, size: PAGE_SIZE }),
    // Battle Service는 Spring Page를 그대로 직렬화 → 현재 페이지는 number
    getNextPageParam: (lastPage) =>
      lastPage.last ? undefined : lastPage.number + 1,
  });
}
