import { useMutation, useQueryClient } from "@tanstack/react-query";

import { pointKeys } from "@/entities/point/model/point.keys";

import { createBattleVote } from "../api/battleApi";
import { battleKeys } from "./battle.keys";
import type { CreateVoteRequest } from "./battle.types";

export function useCreateVote(battleId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateVoteRequest) =>
      createBattleVote(battleId, request),
    onSuccess: () => {
      // FRONTEND_API_POLICY 13.2 — 투표 성공 후 무효화
      queryClient.invalidateQueries({ queryKey: battleKeys.detail(battleId) });
      queryClient.invalidateQueries({ queryKey: battleKeys.result(battleId) });
      queryClient.invalidateQueries({ queryKey: pointKeys.balance() });
    },
  });
}
