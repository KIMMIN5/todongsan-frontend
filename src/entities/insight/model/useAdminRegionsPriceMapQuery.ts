import { useQuery } from "@tanstack/react-query";

import { getAdminRegionsPriceMap } from "../api/insightApi";
import { insightKeys } from "./insight.keys";

export function useAdminRegionsPriceMapQuery() {
  return useQuery({
    queryKey: insightKeys.adminRegionsPriceMap(),
    queryFn: getAdminRegionsPriceMap,
    staleTime: 1000 * 60 * 10,
  });
}
