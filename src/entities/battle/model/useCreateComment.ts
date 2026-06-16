import { useMutation, useQueryClient } from "@tanstack/react-query";

import { pointKeys } from "@/entities/point/model/point.keys";

import { createBattleComment } from "../api/battleApi";
import { battleKeys } from "./battle.keys";
import type { CreateCommentRequest } from "./battle.types";

export function useCreateComment(battleId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateCommentRequest) =>
      createBattleComment(battleId, request),
    onSuccess: () => {
      // 댓글 목록 갱신 + 댓글 보상 포인트 잔액 갱신
      queryClient.invalidateQueries({ queryKey: battleKeys.comments(battleId) });
      queryClient.invalidateQueries({ queryKey: pointKeys.balance() });
    },
  });
}
