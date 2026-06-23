import { useMutation, useQueryClient } from "@tanstack/react-query";

import { cancelMyBattle } from "../api/battleApi";
import { battleKeys } from "./battle.keys";

export function useCancelMyBattleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (battleId: number) => cancelMyBattle(battleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: battleKeys.myCreated() });
    },
  });
}
