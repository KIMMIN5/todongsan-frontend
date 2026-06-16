import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createBattleVote } from "../api/battleApi";
import { battleKeys } from "./battle.keys";
import type { CreateVoteRequest } from "./battle.types";

export function useCreateVote(battleId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateVoteRequest) =>
      createBattleVote(battleId, request),
    onSuccess: () => {
      // 투표 성공 후 battle 관련 쿼리만 무효화 (포인트 잔액 무효화는 page 레벨에서 처리)
      queryClient.invalidateQueries({ queryKey: battleKeys.detail(battleId) });
      queryClient.invalidateQueries({ queryKey: battleKeys.result(battleId) });
    },
  });
}
