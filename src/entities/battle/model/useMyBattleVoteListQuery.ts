import { useInfiniteQuery } from "@tanstack/react-query";

import { getMyBattleVotes } from "../api/battleApi";
import { battleKeys } from "./battle.keys";
import type { MyBattleVoteListParams } from "./battle.types";

type MyBattleVoteFilters = Omit<MyBattleVoteListParams, "page" | "size">;

const PAGE_SIZE = 20;

export function useMyBattleVoteListQuery(filters: MyBattleVoteFilters) {
  return useInfiniteQuery({
    queryKey: battleKeys.myVotesList(filters),
    initialPageParam: 0,
    queryFn: ({ pageParam }) =>
      getMyBattleVotes({ ...filters, page: pageParam, size: PAGE_SIZE }),
    // Battle Service는 Spring Page를 그대로 직렬화 → 현재 페이지는 number
    getNextPageParam: (lastPage) =>
      lastPage.last ? undefined : lastPage.number + 1,
  });
}
