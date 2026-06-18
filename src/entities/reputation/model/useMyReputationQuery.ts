import { useQuery } from "@tanstack/react-query";

import { getMyReputation } from "../api/reputationApi";
import { reputationKeys } from "./reputation.keys";

export function useMyReputationQuery() {
  return useQuery({
    queryKey: reputationKeys.me(),
    queryFn: () => getMyReputation(),
  });
}
