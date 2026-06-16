import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createBattleComment } from "../api/battleApi";
import { battleKeys } from "./battle.keys";
import type { CreateCommentRequest } from "./battle.types";

export function useCreateComment(battleId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateCommentRequest) =>
      createBattleComment(battleId, request),
    onSuccess: () => {
      // 댓글 목록만 무효화 (보상 포인트 잔액 무효화는 page 레벨에서 처리)
      queryClient.invalidateQueries({ queryKey: battleKeys.comments(battleId) });
    },
  });
}
