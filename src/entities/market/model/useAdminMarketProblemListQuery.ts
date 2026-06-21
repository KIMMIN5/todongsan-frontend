import { useQuery } from "@tanstack/react-query";

import { getAdminMarketProblemList } from "../api/adminMarketApi";
import { marketKeys } from "./market.keys";
import type { AdminMarketProblemListParams } from "./market.types";

export function useAdminMarketProblemListQuery(params: AdminMarketProblemListParams) {
  return useQuery({
    queryKey: marketKeys.adminProblemList(params),
    queryFn: () => getAdminMarketProblemList(params),
  });
}
