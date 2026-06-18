import { useQuery } from "@tanstack/react-query";

import { isApiError } from "@/shared/api/apiError";

import { getReputationByMemberId } from "../api/reputationApi";
import { reputationKeys } from "./reputation.keys";

export function useReputationQuery(memberId: number) {
  return useQuery({
    queryKey: reputationKeys.detail(memberId),
    queryFn: () => getReputationByMemberId(memberId),
    enabled: Number.isFinite(memberId) && memberId > 0,
    retry: (failureCount, error) => {
      if (
        isApiError(error) &&
        error.errorCode === "REPUTATION_NOT_FOUND"
      ) {
        return false;
      }

      return failureCount < 3;
    },
  });
}
