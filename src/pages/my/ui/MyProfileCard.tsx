import { Link } from "react-router-dom";

import { useMyProfileQuery } from "@/entities/member/model/member.queries";
import { buttonVariants } from "@/shared/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { ErrorState } from "@/shared/ui/error-state";
import { Skeleton } from "@/shared/ui/skeleton";
import { formatDate } from "@/shared/lib/formatDate";
import { cn } from "@/shared/lib/utils";
import { ROUTE_PATH } from "@/shared/constants/routePath";

const MEMBER_ROLE_LABEL: Record<string, string> = {
  USER: "일반 회원",
  ADMIN: "관리자",
};

export function MyProfileCard() {
  const profileQuery = useMyProfileQuery();

  if (profileQuery.isError) {
    return (
      <Card className="rounded-2xl border-slate-200 bg-white md:col-span-1">
        <CardContent className="py-8">
          <ErrorState />
        </CardContent>
      </Card>
    );
  }

  const profile = profileQuery.data;
  const isProfileLoading = profileQuery.isPending;

  return (
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
  );
}
