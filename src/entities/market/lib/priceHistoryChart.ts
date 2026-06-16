import type {
  MarketOption,
  MarketPriceHistoryItem,
} from "../model/market.types";

/**
 * 선택지 라인에 적용할 색상 팔레트입니다.
 * 차트 라인과 (필요 시) 범례/툴팁에서 동일한 순서로 사용합니다.
 */
export const PRICE_HISTORY_OPTION_COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
] as const;

const INITIAL_TIME_KEY = "initial";
const INITIAL_TIME_LABEL = "초기";

/** Recharts LineChart에 넘기는 행 한 개. timeLabel + 선택지별 가격(%)을 가집니다. */
export type MarketPriceHistoryChartRow = {
  timeKey: string;
  timeLabel: string;
  [optionDataKey: string]: number | string;
};

/** 차트에 실제로 그릴 선택지 메타데이터(Recharts Line 1개에 대응). */
export type MarketPriceHistoryVisibleOption = {
  optionId: number;
  content: string;
  dataKey: string;
  color: string;
};

/** 최신 가격 패널에 표시할 선택지별 최신 가격(decimal 비율 문자열). */
export type MarketPriceHistoryLatestPrice = {
  optionId: number;
  content: string;
  /** "0.60000000" 형태의 비율 문자열. formatPercent로 그대로 포맷합니다. */
  price: string;
};

export type MarketPriceHistoryChartDataResult = {
  chartData: MarketPriceHistoryChartRow[];
  visibleOptions: MarketPriceHistoryVisibleOption[];
  latestPrices: MarketPriceHistoryLatestPrice[];
};

/** 선택지 ID로 Recharts dataKey를 만듭니다. */
export function optionDataKey(optionId: number): string {
  return `opt_${optionId}`;
}

/** createdAt ISO 문자열을 "MM.DD HH:mm" 형태로 포맷합니다. */
export function formatPriceHistoryLabel(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${month}.${day} ${hours}:${minutes}`;
}

/** createdAt ASC, historyId ASC로 방어적으로 정렬합니다. */
function sortHistories(
  items: MarketPriceHistoryItem[],
): MarketPriceHistoryItem[] {
  return [...items].sort((a, b) => {
    const byTime = a.createdAt.localeCompare(b.createdAt);
    return byTime !== 0 ? byTime : a.historyId - b.historyId;
  });
}

/** 선택지의 마지막 priceAfter를 찾고, 이력이 없으면 currentPrice로 폴백합니다. */
function resolveLatestPrice(
  option: MarketOption,
  sortedHistories: MarketPriceHistoryItem[],
): string {
  let latest: string | undefined;
  for (const item of sortedHistories) {
    if (item.optionId === option.optionId) {
      latest = item.priceAfter;
    }
  }
  return latest ?? option.currentPrice;
}

/**
 * 가격 이력 응답을 Recharts LineChart용 데이터로 변환하는 순수 함수입니다.
 *
 * - 차트 시작점은 option.initialPrice(없으면 currentPrice) 기준으로 만듭니다.
 * - 이벤트가 없는 시점은 직전 가격을 carry-forward 합니다.
 * - selectedOptionId가 있으면 해당 선택지 라인만 그립니다.
 * - latestPrices는 필터와 무관하게 전체 선택지에 대해 계산합니다.
 */
export function buildMarketPriceHistoryChartData({
  options,
  histories,
  selectedOptionId,
}: {
  options: MarketOption[];
  histories: MarketPriceHistoryItem[];
  selectedOptionId?: number;
}): MarketPriceHistoryChartDataResult {
  const sorted = sortHistories(histories);

  const visibleOptionModels =
    selectedOptionId !== undefined
      ? options.filter((option) => option.optionId === selectedOptionId)
      : options;

  // 색상은 전체 options 배열에서의 원래 순서로 고정합니다.
  // (필터를 바꿔도 같은 선택지가 항상 같은 색을 유지하도록)
  const visibleOptions: MarketPriceHistoryVisibleOption[] =
    visibleOptionModels.map((option) => {
      const originalIndex = options.findIndex(
        (candidate) => candidate.optionId === option.optionId,
      );
      const colorIndex = originalIndex >= 0 ? originalIndex : 0;
      return {
        optionId: option.optionId,
        content: option.content,
        dataKey: optionDataKey(option.optionId),
        color:
          PRICE_HISTORY_OPTION_COLORS[
            colorIndex % PRICE_HISTORY_OPTION_COLORS.length
          ],
      };
    });

  const chartData = buildChartRows(visibleOptionModels, sorted);

  const latestPrices: MarketPriceHistoryLatestPrice[] = options.map(
    (option) => ({
      optionId: option.optionId,
      content: option.content,
      price: resolveLatestPrice(option, sorted),
    }),
  );

  return { chartData, visibleOptions, latestPrices };
}

function buildChartRows(
  optionModels: MarketOption[],
  sortedHistories: MarketPriceHistoryItem[],
): MarketPriceHistoryChartRow[] {
  const timesInOrder: string[] = [INITIAL_TIME_KEY];
  const seenTimes = new Set<string>([INITIAL_TIME_KEY]);
  for (const item of sortedHistories) {
    if (!seenTimes.has(item.createdAt)) {
      seenTimes.add(item.createdAt);
      timesInOrder.push(item.createdAt);
    }
  }

  const carriedPrices = new Map<number, number>();
  for (const option of optionModels) {
    const raw = option.initialPrice ?? option.currentPrice;
    carriedPrices.set(option.optionId, Number(raw) * 100);
  }

  const historyLookup = new Map<string, number>();
  for (const item of sortedHistories) {
    historyLookup.set(
      `${item.optionId}|${item.createdAt}`,
      Number(item.priceAfter) * 100,
    );
  }

  return timesInOrder.map((timeKey) => {
    const timeLabel =
      timeKey === INITIAL_TIME_KEY
        ? INITIAL_TIME_LABEL
        : formatPriceHistoryLabel(timeKey);
    const row: MarketPriceHistoryChartRow = { timeKey, timeLabel };

    for (const option of optionModels) {
      if (timeKey !== INITIAL_TIME_KEY) {
        const value = historyLookup.get(`${option.optionId}|${timeKey}`);
        if (value !== undefined) {
          carriedPrices.set(option.optionId, value);
        }
      }
      row[optionDataKey(option.optionId)] = carriedPrices.get(option.optionId)!;
    }

    return row;
  });
}
