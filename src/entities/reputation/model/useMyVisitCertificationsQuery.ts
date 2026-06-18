import { useQuery } from "@tanstack/react-query";

import { getMyVisitCertifications } from "../api/reputationApi";
import { visitCertKeys } from "./reputation.keys";

export function useMyVisitCertificationsQuery() {
  return useQuery({
    queryKey: visitCertKeys.mine({}),
    queryFn: () => getMyVisitCertifications(),
  });
}
