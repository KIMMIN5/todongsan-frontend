import { useEffect, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { ROUTE_PATH } from "@/shared/constants/routePath";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { buttonVariants } from "@/shared/ui/button";
import { PageContainer } from "@/shared/ui/page-container";
import { PageHeader } from "@/shared/ui/page-header";
import { ErrorState } from "@/shared/ui/error-state";
import { cn } from "@/shared/lib/utils";
import { exchangeKakaoToken } from "@/shared/lib/kakao";
import { loginWithKakao } from "@/entities/auth/api/authApi";
import { useAuth } from "@/entities/auth/model/useAuth";
import { toApiError } from "@/shared/api/apiError";

export function KakaoCallbackPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [searchParams] = useSearchParams();
  const requestedRef = useRef(false);

  const code = searchParams.get("code");
  const errorParam = searchParams.get("error");

  const mutation = useMutation({
    mutationFn: async (authCode: string) => {
      const kakaoAccessToken = await exchangeKakaoToken(authCode);
      return loginWithKakao(kakaoAccessToken);
    },
    onSuccess: (data) => {
      login({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        memberId: data.memberId,
        nickname: data.nickname,
        role: data.role,
      });
      navigate(ROUTE_PATH.HOME, { replace: true });
    },
  });

  useEffect(() => {
    if (requestedRef.current || !code) return;
    requestedRef.current = true;
    mutation.mutate(code);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  const failed = !code || !!errorParam || mutation.isError;

  return (
    <PageContainer>
      <PageHeader
        title="소셜 로그인 진행"
        description="카카오 인증 센터로부터 응답 코드를 확인 및 인가 처리 중입니다."
      />

      <div className="mx-auto w-full max-w-md py-8">
        <Card className="rounded-2xl border-slate-200 bg-white">
          <CardHeader className="text-center">
            <CardTitle className="text-xl font-bold">카카오 로그인 처리</CardTitle>
            <CardDescription>카카오 OAuth callback 인증 대기</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {failed ? (
              <ErrorState
                title="로그인에 실패했습니다"
                message={
                  mutation.isError
                    ? toApiError(mutation.error).message
                    : "카카오 인증 정보를 확인할 수 없습니다. 다시 시도해 주세요."
                }
              />
            ) : (
              <div className="flex flex-col items-center justify-center space-y-3 py-6">
                <div className="h-9 w-9 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
                <p className="text-xs text-slate-500 font-medium">
                  로그인 세션 인증 요청을 백엔드 서버와 통신 중입니다...
                </p>
              </div>
            )}

            <Link
              to={failed ? ROUTE_PATH.LOGIN : ROUTE_PATH.HOME}
              className={cn(
                buttonVariants({ variant: "outline" }),
                "flex w-full items-center justify-center text-xs font-bold py-2.5 rounded-xl border-slate-200 hover:bg-slate-50 transition-all cursor-pointer",
              )}
            >
              {failed ? "로그인 페이지로 돌아가기" : "대기 중단하고 홈으로 이동"}
            </Link>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
