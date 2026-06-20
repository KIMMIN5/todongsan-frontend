import { useInfiniteQuery } from "@tanstack/react-query";

import { getMyMarketPredictions } from "../api/predictionApi";
import { predictionKeys } from "./prediction.keys";
import type { MyMarketPredictionListParams } from "./prediction.types";

type MyMarketPredictionFilters = Omit<MyMarketPredictionListParams, "page" | "size">;

const PAGE_SIZE = 20;

export function useMyMarketPredictionListQuery(filters: MyMarketPredictionFilters) {
  return useInfiniteQuery({
    queryKey: predictionKeys.myList(filters),
    initialPageParam: 0,
    queryFn: ({ pageParam }) =>
      getMyMarketPredictions({ ...filters, page: pageParam, size: PAGE_SIZE }),
    getNextPageParam: (lastPage) =>
      lastPage.last ? undefined : lastPage.page + 1,
  });
}
