import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { PageContainer } from "@/shared/ui/page-container";
import { PageHeader } from "@/shared/ui/page-header";
import { Skeleton } from "@/shared/ui/skeleton";
import { ErrorState } from "@/shared/ui/error-state";
import { buttonVariants } from "@/shared/ui/button";
import { useMyProfileQuery } from "@/entities/member/model/member.queries";
import { usePointBalanceQuery } from "@/entities/point/model/point.queries";
import { useMyReputationQuery } from "@/entities/reputation/model/useMyReputationQuery";
import { ReputationSummaryCard } from "@/entities/reputation/ui/ReputationSummaryCard";
import { formatDate } from "@/shared/lib/formatDate";
import { formatPointAmount } from "@/shared/lib/formatDecimal";
import { cn } from "@/shared/lib/utils";
import { ROUTE_PATH } from "@/shared/constants/routePath";

const MEMBER_ROLE_LABEL: Record<string, string> = {
  USER: "일반 회원",
  ADMIN: "관리자",
};

export function MyPage() {
  const profileQuery = useMyProfileQuery();
  const balanceQuery = usePointBalanceQuery();
  const reputationQuery = useMyReputationQuery();

  if (profileQuery.isError) {
    return (
      <PageContainer>
        <PageHeader title="마이페이지" />
        <ErrorState />
      </PageContainer>
    );
  }

  const profile = profileQuery.data;
  const isProfileLoading = profileQuery.isPending;

  return (
    <PageContainer>
      <PageHeader
        title="마이페이지"
        description="회원님의 활동 요약과 포인트 지표를 확인하세요."
      />

      <div className="grid gap-6 md:grid-cols-3">
        {/* User Card */}
        <Card className="rounded-2xl border-slate-200 bg-white md:col-span-1">
          <CardHeader className="flex flex-col items-center pb-6 text-center border-b border-slate-100">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 text-2xl font-bold">
              회
            </div>
            {isProfileLoading ? (
              <>
                <Skeleton className="mt-4 h-6 w-24" />
                <Skeleton className="mt-2 h-3 w-32" />
              </>
            ) : (
              <>
                <CardTitle className="text-lg font-bold mt-4">{profile?.nickname}님</CardTitle>
                <CardDescription className="text-xs">{profile?.email ?? "-"}</CardDescription>
              </>
            )}
          </CardHeader>
          <CardContent className="py-4 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">회원 등급</span>
              {isProfileLoading ? (
                <Skeleton className="h-4 w-16" />
              ) : (
                <span className="font-bold text-slate-800">
                  {profile ? MEMBER_ROLE_LABEL[profile.role] ?? profile.role : "-"}
                </span>
              )}
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">가입 날짜</span>
              {isProfileLoading ? (
                <Skeleton className="h-4 w-20" />
              ) : (
                <span className="font-bold text-slate-800">{formatDate(profile?.createdAt)}</span>
              )}
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">거주지</span>
              {isProfileLoading ? (
                <Skeleton className="h-4 w-24" />
              ) : (
                <span className="font-bold text-slate-800">
                  {profile?.residenceSido
                    ? `${profile.residenceSido} ${profile.residenceSigu ?? ""}`.trim()
                    : "미설정"}
                </span>
              )}
            </div>

            <Link
              to={ROUTE_PATH.MY_PROFILE}
              className={cn(buttonVariants({ variant: "outline" }), "mt-2 w-full text-xs")}
            >
              정보 수정
            </Link>
          </CardContent>
        </Card>

        {/* Stats and Activity */}
        <div className="md:col-span-2 space-y-6">
          <Card className="rounded-2xl border-slate-200 bg-white sm:max-w-xs">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs font-semibold uppercase tracking-wider text-slate-400">보유 포인트</CardDescription>
              {balanceQuery.isPending ? (
                <Skeleton className="h-9 w-28" />
              ) : balanceQuery.isError ? (
                <CardTitle className="text-base font-bold text-destructive">불러오지 못했습니다</CardTitle>
              ) : (
                <CardTitle className="text-3xl font-extrabold text-emerald-700">
                  {formatPointAmount(balanceQuery.data?.pointBalance)}
                </CardTitle>
              )}
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-500">예측 적중 및 선호 투표 참여로 획득 가능합니다.</p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-slate-200 bg-white">
            <CardHeader>
              <CardTitle className="text-base font-bold">최근 참여 내역</CardTitle>
              <CardDescription className="text-xs">현재 참여하신 예측 마켓 또는 배틀이 없습니다.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6 text-slate-400 text-xs">
                참여 내역이 비어 있습니다. 홈 또는 마켓 목록에서 흥미로운 이슈를 확인해 보세요!
              </div>
            </CardContent>
          </Card>

          {/* 신뢰도 요약 */}
          {reputationQuery.isPending && (
            <Skeleton className="h-48 w-full rounded-2xl" />
          )}
          {!reputationQuery.isPending && reputationQuery.data && (
            <ReputationSummaryCard reputation={reputationQuery.data} />
          )}
        </div>
      </div>
    </PageContainer>
  );
}
