import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useCreateBattle } from "@/entities/battle/model/useCreateBattle";
import { BattleCreateForm } from "@/entities/battle/ui/BattleCreateForm";
import { pointKeys } from "@/entities/point/model/point.keys";
import { isApiError } from "@/shared/api/apiError";
import { ROUTE_PATH } from "@/shared/constants/routePath";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { PageContainer } from "@/shared/ui/page-container";
import { PageHeader } from "@/shared/ui/page-header";

const ERROR_MESSAGES: Record<string, string> = {
  BATTLE_INVALID_PERIOD: "배틀 기간이 올바르지 않습니다. 시작/마감 일시를 확인해 주세요.",
  POINT_INSUFFICIENT: "포인트가 부족하여 배틀을 만들 수 없습니다.",
  VALIDATION_FAILED: "입력값을 다시 확인해 주세요.",
};

export function BattleCreatePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const createBattle = useCreateBattle();

  return (
    <PageContainer>
      <PageHeader
        title="배틀 만들기"
        description="새로운 선호 배틀 주제를 등록합니다. 등록 후 관리자 검수를 거쳐 공개됩니다."
      />

      <Card className="mx-auto w-full max-w-2xl rounded-2xl border-slate-200 bg-white">
        <CardHeader>
          <CardTitle className="text-base font-bold">배틀 정보</CardTitle>
          <CardDescription className="text-xs">
            제목과 두 선택지, 투표 기간은 필수입니다. 등록 시 배틀 생성권(포인트)이
            차감될 수 있으며, 관리자 승인 후 목록에 노출됩니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BattleCreateForm
            isSubmitting={createBattle.isPending}
            onSubmit={(request) =>
              createBattle.mutate(request, {
                onSuccess: () => {
                  // 생성권 차감으로 잔액이 바뀌므로 page 레벨에서 무효화
                  queryClient.invalidateQueries({
                    queryKey: pointKeys.balance(),
                  });
                  toast.success(
                    "배틀이 등록되었습니다. 관리자 검수 후 공개됩니다.",
                  );
                  navigate(ROUTE_PATH.BATTLES);
                },
                onError: (error) => {
                  if (isApiError(error)) {
                    toast.error(
                      ERROR_MESSAGES[error.errorCode] ?? error.message,
                    );
                    return;
                  }
                  toast.error("배틀 등록 중 문제가 발생했습니다.");
                },
              })
            }
          />
        </CardContent>
      </Card>
    </PageContainer>
  );
}
