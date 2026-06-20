import { cn } from "@/shared/lib/utils";

import type {
  BattleListStatus,
  MyBattleVoteListParams,
} from "@/entities/battle/model/battle.types";

export type BattleParticipationFilterKey = "all" | "active" | "closed";

type FilterTab = {
  key: BattleParticipationFilterKey;
  label: string;
  params: Pick<MyBattleVoteListParams, "status">;
};

// 필터는 서버 status 쿼리 파라미터로 처리 (현재 페이지 content만 거르지 않음)
const FILTER_TABS: FilterTab[] = [
  { key: "all", label: "전체", params: {} },
  { key: "active", label: "진행 중", params: { status: ["ACTIVE"] as BattleListStatus[] } },
  { key: "closed", label: "종료", params: { status: ["CLOSED"] as BattleListStatus[] } },
];

type MyBattleParticipationFilterTabsProps = {
  activeKey: BattleParticipationFilterKey;
  onChange: (
    key: BattleParticipationFilterKey,
    params: Pick<MyBattleVoteListParams, "status">,
  ) => void;
};

export function MyBattleParticipationFilterTabs({
  activeKey,
  onChange,
}: MyBattleParticipationFilterTabsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {FILTER_TABS.map((tab) => (
        <button
          key={tab.key}
          type="button"
          onClick={() => onChange(tab.key, tab.params)}
          className={cn(
            "rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors",
            activeKey === tab.key
              ? "bg-foreground text-background"
              : "bg-muted text-muted-foreground hover:bg-muted/70",
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
