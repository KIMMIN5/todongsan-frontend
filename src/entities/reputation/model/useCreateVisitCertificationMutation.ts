import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createVisitCertification } from "../api/reputationApi";
import type {
  CreateVisitCertCommentRequest,
  CreateVisitCertGPSRequest,
} from "./reputation.types";
import { reputationKeys, visitCertKeys } from "./reputation.keys";

export function useCreateVisitCertificationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      request: CreateVisitCertGPSRequest | CreateVisitCertCommentRequest,
    ) => createVisitCertification(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reputationKeys.me() });
      queryClient.invalidateQueries({ queryKey: visitCertKeys.mine({}) });
    },
  });
}
