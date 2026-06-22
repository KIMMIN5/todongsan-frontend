import { useMutation, useQueryClient } from "@tanstack/react-query";

import { approveBattle } from "../api/adminBattleApi";
import { adminBattleKeys } from "./battle.keys";

export function useApproveBattleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (battleId: number) => approveBattle(battleId),
    onSuccess: (_data, battleId) => {
      queryClient.invalidateQueries({ queryKey: adminBattleKeys.all });
      queryClient.invalidateQueries({ queryKey: adminBattleKeys.detail(battleId) });
    },
  });
}
