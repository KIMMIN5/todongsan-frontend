import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteBattleComment } from "../api/battleApi";
import { battleKeys } from "./battle.keys";

export function useDeleteComment(battleId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: number) => deleteBattleComment(battleId, commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: battleKeys.comments(battleId) });
    },
  });
}
