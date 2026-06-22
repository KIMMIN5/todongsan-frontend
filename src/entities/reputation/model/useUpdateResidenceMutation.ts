import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateResidence } from "../api/reputationApi";
import { reputationKeys } from "./reputation.keys";

export function useUpdateResidenceMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateResidence,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reputationKeys.me() });
    },
  });
}
