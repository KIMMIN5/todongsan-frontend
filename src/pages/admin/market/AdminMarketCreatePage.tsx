import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { useAuthStore } from "@/entities/auth/model/auth.store";
import { getAdminMarketErrorMessage } from "@/entities/market/lib/adminMarketErrorMessage";
import { useCreateMarketMutation } from "@/entities/market/model/useCreateMarketMutation";
import { AdminMarketCreateForm } from "@/entities/market/ui/AdminMarketCreateForm";
import { toApiError } from "@/shared/api/apiError";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { PageContainer } from "@/shared/ui/page-container";
import { PageHeader } from "@/shared/ui/page-header";

export default function AdminMarketCreatePage() {
  const navigate = useNavigate();
  const createMarket = useCreateMarketMutation();

  const authMemberId = useAuthStore((state) => state.memberId);
  const resolvedCreatedBy: number | null =
    authMemberId ??
    (import.meta.env.DEV && import.meta.env.VITE_DEV_MEMBER_ID
      ? Number(import.meta.env.VITE_DEV_MEMBER_ID)
      : null);

  return (
    <PageContainer>
      <PageHeader title="마켓 생성" description="새로운 예측 마켓을 생성합니다." />

      <Card className="mx-auto w-full max-w-2xl rounded-2xl border-slate-200 bg-white">
        <CardHeader>
          <CardTitle className="text-base font-bold">마켓 정보</CardTitle>
          <CardDescription className="text-xs">
            생성된 마켓은 PENDING 상태로 시작하며, 활성화 전까지 사용자에게 노출되지
            않습니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AdminMarketCreateForm
            createdBy={resolvedCreatedBy}
            isSubmitting={createMarket.isPending}
            onSubmit={(request) =>
              createMarket.mutate(request, {
                onSuccess: (data) => {
                  toast.success(
                    "마켓이 생성되었습니다. 활성화 전까지 사용자에게 노출되지 않습니다.",
                  );
                  navigate(`/admin/markets/${data.marketId}`);
                },
                onError: (error) => {
                  toast.error(getAdminMarketErrorMessage(toApiError(error)));
                },
              })
            }
          />
        </CardContent>
      </Card>
    </PageContainer>
  );
}
