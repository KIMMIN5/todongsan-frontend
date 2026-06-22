import { Link } from "react-router-dom";

import { usePointBalanceQuery } from "@/entities/point/model/point.queries";
import { buttonVariants } from "@/shared/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { Skeleton } from "@/shared/ui/skeleton";
import { formatPointAmount } from "@/shared/lib/formatDecimal";
import { cn } from "@/shared/lib/utils";
import { ROUTE_PATH } from "@/shared/constants/routePath";

export function MyPointSummaryCard() {
  const balanceQuery = usePointBalanceQuery();

  return (
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
        <Link
          to={ROUTE_PATH.MY_POINTS}
          className={cn(buttonVariants({ variant: "outline" }), "mt-2 w-full text-xs")}
        >
          포인트 내역 보기
        </Link>
      </CardContent>
    </Card>
  );
}
