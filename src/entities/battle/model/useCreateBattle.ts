import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createBattle } from "../api/battleApi";
import { battleKeys } from "./battle.keys";
import type { CreateBattleRequest } from "./battle.types";

export function useCreateBattle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateBattleRequest) => createBattle(request),
    onSuccess: () => {
      // 생성 직후엔 PENDING이라 목록엔 안 보이지만 승인 흐름 대비 prefix 무효화.
      // 생성권(포인트) 차감 후 잔액 무효화는 page 레벨에서 처리.
      queryClient.invalidateQueries({ queryKey: battleKeys.all });
    },
  });
}
