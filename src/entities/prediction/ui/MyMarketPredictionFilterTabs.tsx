import { cn } from "@/shared/lib/utils";
import type { MarketDisplayStatus } from "@/entities/market/model/market.types";

import type { MyMarketPredictionListParams, PredictionStatus } from "../model/prediction.types";

export type PredictionFilterKey =
  | "all"
  | "active"
  | "closedByTime"
  | "settled"
  | "voided"
  | "pending"
  | "refund";

type FilterTab = {
  key: PredictionFilterKey;
  label: string;
  params: Pick<MyMarketPredictionListParams, "marketDisplayStatus" | "predictionStatus">;
};

const FILTER_TABS: FilterTab[] = [
  { key: "all", label: "전체", params: {} },
  {
    key: "active",
    label: "진행 중",
    params: { marketDisplayStatus: ["ACTIVE"] as MarketDisplayStatus[] },
  },
  {
    key: "closedByTime",
    label: "마감",
    params: { marketDisplayStatus: ["CLOSED_BY_TIME"] as MarketDisplayStatus[] },
  },
  {
    key: "settled",
    label: "정산 완료",
    params: { marketDisplayStatus: ["SETTLED"] as MarketDisplayStatus[] },
  },
  {
    key: "voided",
    label: "무효",
    params: { marketDisplayStatus: ["VOIDED"] as MarketDisplayStatus[] },
  },
  {
    key: "pending",
    label: "확인 중",
    params: {
      predictionStatus: [
        "POINT_PENDING",
        "POINT_UNKNOWN",
      ] as PredictionStatus[],
    },
  },
  {
    key: "refund",
    label: "환불",
    params: {
      predictionStatus: [
        "REFUND_PENDING",
        "REFUND_UNKNOWN",
        "REFUNDED",
      ] as PredictionStatus[],
    },
  },
];

type MyMarketPredictionFilterTabsProps = {
  activeKey: PredictionFilterKey;
  onChange: (
    key: PredictionFilterKey,
    params: Pick<MyMarketPredictionListParams, "marketDisplayStatus" | "predictionStatus">,
  ) => void;
};

export function MyMarketPredictionFilterTabs({
  activeKey,
  onChange,
}: MyMarketPredictionFilterTabsProps) {
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
