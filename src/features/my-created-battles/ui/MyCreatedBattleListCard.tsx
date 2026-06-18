import { useNavigate } from "react-router-dom";

import { formatDateTime } from "@/shared/lib/formatDate";
import { cn } from "@/shared/lib/utils";
import { Card, CardContent } from "@/shared/ui/card";

import type { MyCreatedBattleItem } from "@/entities/battle/model/battle.types";
import { BattleStatusBadge } from "@/entities/battle/ui/BattleStatusBadge";

type MyCreatedBattleListCardProps = {
  item: MyCreatedBattleItem;
};

export function MyCreatedBattleListCard({
  item,
}: MyCreatedBattleListCardProps) {
  const navigate = useNavigate();

  // 공개 상세(GET /battles/{id})는 ACTIVE/CLOSED만 조회 가능.
  // PENDING(검수 대기)/CANCELLED는 일반 상세에서 404라 이동시키지 않는다.
  const isOpenable = item.status === "ACTIVE" || item.status === "CLOSED";

  return (
    <Card
      className={cn(
        "transition-colors",
        isOpenable && "cursor-pointer hover:bg-muted/40",
      )}
      onClick={isOpenable ? () => navigate(`/battles/${item.battleId}`) : undefined}
    >
      <CardContent className="py-4">
        <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
          <p className="text-sm font-semibold leading-snug text-foreground">
            {item.title}
          </p>
          <div className="shrink-0">
            <BattleStatusBadge
              status={item.status}
              settled={item.settledAt !== null}
            />
          </div>
        </div>

        <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 text-xs sm:grid-cols-3">
          <InfoRow label="대결" value={`${item.optionA} vs ${item.optionB}`} />
          <InfoRow label="참여 수" value={`${item.voteCount.toLocaleString()}명`} />
          <InfoRow label="마감" value={formatDateTime(item.endAt)} />
          <InfoRow label="등록일" value={formatDateTime(item.createdAt)} />
        </dl>

        {item.status === "PENDING" && (
          <p className="mt-3 text-xs text-muted-foreground">
            관리자 검수 후 공개됩니다.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

type InfoRowProps = {
  label: string;
  value: string;
};

function InfoRow({ label, value }: InfoRowProps) {
  return (
    <div>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 font-medium text-foreground">{value}</dd>
    </div>
  );
}
