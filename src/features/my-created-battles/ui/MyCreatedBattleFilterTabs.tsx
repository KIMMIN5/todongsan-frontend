import { cn } from "@/shared/lib/utils";

import type {
  BattleStatus,
  MyCreatedBattleListParams,
} from "@/entities/battle/model/battle.types";

export type CreatedBattleFilterKey =
  | "all"
  | "pending"
  | "active"
  | "closed"
  | "cancelled";

type FilterTab = {
  key: CreatedBattleFilterKey;
  label: string;
  params: Pick<MyCreatedBattleListParams, "status">;
};

// 필터는 서버 status 쿼리 파라미터로 처리. 생성자 본인이라 4개 상태 전부 노출
const FILTER_TABS: FilterTab[] = [
  { key: "all", label: "전체", params: {} },
  { key: "pending", label: "검수 대기", params: { status: ["PENDING"] as BattleStatus[] } },
  { key: "active", label: "진행 중", params: { status: ["ACTIVE"] as BattleStatus[] } },
  { key: "closed", label: "종료", params: { status: ["CLOSED"] as BattleStatus[] } },
  { key: "cancelled", label: "취소", params: { status: ["CANCELLED"] as BattleStatus[] } },
];

type MyCreatedBattleFilterTabsProps = {
  activeKey: CreatedBattleFilterKey;
  onChange: (
    key: CreatedBattleFilterKey,
    params: Pick<MyCreatedBattleListParams, "status">,
  ) => void;
};

export function MyCreatedBattleFilterTabs({
  activeKey,
  onChange,
}: MyCreatedBattleFilterTabsProps) {
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
