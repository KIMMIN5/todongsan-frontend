import { toDecimal } from "@/shared/lib/decimal";
import { decimalToPercentValue } from "@/shared/lib/formatDecimal";

import { getOptionColorMap } from "./optionColor";
import type {
  MarketOption,
  MarketPriceHistoryItem,
} from "../model/market.types";

/**
 * 이력이 1건(고유 시각 1개)뿐이라 평균 간격을 구할 수 없을 때,
 * 시작점을 첫 이력보다 이만큼 앞에 두는 fallback 간격.
 */
const SINGLE_POINT_FALLBACK_MS = 60 * 60 * 1000; // 1시간

/** Recharts LineChart 행 한 개. t(epoch ms) + 선택지별 가격(%) 숫자를 가집니다. */
export type MarketPriceHistoryChartRow = {
  t: number;
  [optionDataKey: string]: number;
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
  /** 수치 시간축 domain [시작 시각, 마지막 이력 시각]. 이력이 없으면 undefined. */
  xDomain: [number, number] | undefined;
};

/** 선택지 ID로 Recharts dataKey를 만듭니다. */
export function optionDataKey(optionId: number): string {
  return `opt_${optionId}`;
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
 * 옵션별 시작 가격(%)을 구합니다.
 * 1) 응답에 initialPrice가 있으면 그대로 사용
 * 2) 없으면 virtualPoolAmount 비율(vp_i / Σvp)로 계산 (MARKET_API_SPEC 공식)
 * 3) Σvp가 0이거나 비정상이면 시작점을 만들 수 없으므로 null 반환
 */
function resolveInitialPercents(
  options: MarketOption[],
): Map<number, number> | null {
  const sumVirtual = options.reduce(
    (sum, option) => sum.plus(toDecimal(option.virtualPoolAmount)),
    toDecimal(0),
  );
  const canUseVirtual = sumVirtual.greaterThan(0);

  const result = new Map<number, number>();
  for (const option of options) {
    if (option.initialPrice !== undefined && option.initialPrice !== "") {
      result.set(option.optionId, decimalToPercentValue(option.initialPrice));
      continue;
    }
    if (!canUseVirtual) {
      // 어느 한 옵션이라도 시작 가격을 구할 수 없으면 시작점 자체를 생략한다.
      return null;
    }
    const ratio = toDecimal(option.virtualPoolAmount).div(sumVirtual);
    result.set(option.optionId, decimalToPercentValue(ratio.toString()));
  }
  return result;
}

/**
 * 가격 이력 응답을 Recharts LineChart용 데이터로 변환하는 순수 함수입니다.
 *
 * - 시작점은 initialPrice(없으면 virtualPoolAmount 비율)로 합성하고, 첫 이력보다 앞선 시각에 둡니다.
 * - 이력이 0건이면 chartData는 빈 배열입니다(호출부에서 빈 상태 UI로 분기).
 * - selectedOptionId가 있으면 해당 선택지 라인만 그립니다.
 * - latestPrices는 필터와 무관하게 전체 선택지에 대해 계산합니다.
 * - 라인 색은 옵션 색상 단일 소스(getOptionColorMap, optionId 고정)를 따릅니다.
 * - 모든 Decimal은 string이며, 숫자 변환은 toDecimal/decimalToPercentValue 유틸로만 수행합니다.
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

  // 색은 전체 옵션 기준으로 한 번 배정하고(필터와 무관하게 같은 옵션=같은 색),
  // 작업 0의 단일 소스 헬퍼(optionId 오름차순 고정)를 사용한다.
  const colorMap = getOptionColorMap(options.map((option) => option.optionId));

  const visibleOptionModels =
    selectedOptionId !== undefined
      ? options.filter((option) => option.optionId === selectedOptionId)
      : options;

  const visibleOptions: MarketPriceHistoryVisibleOption[] =
    visibleOptionModels.map((option) => ({
      optionId: option.optionId,
      content: option.content,
      dataKey: optionDataKey(option.optionId),
      color: colorMap[option.optionId]?.base ?? "#888780",
    }));

  const initialPercents = resolveInitialPercents(options);
  const { chartData, xDomain } = buildChartRows(
    visibleOptionModels,
    sorted,
    initialPercents,
  );

  const latestPrices: MarketPriceHistoryLatestPrice[] = options.map(
    (option) => ({
      optionId: option.optionId,
      content: option.content,
      price: resolveLatestPrice(option, sorted),
    }),
  );

  return { chartData, visibleOptions, latestPrices, xDomain };
}

/** 시작점 시각: 첫 이력에서 "평균 간격"만큼 앞. 고유 시각이 1개뿐이면 고정 fallback. */
function resolveStartMs(historyMs: number[]): number {
  const firstMs = historyMs[0];
  const lastMs = historyMs[historyMs.length - 1];
  if (historyMs.length >= 2) {
    const averageInterval = (lastMs - firstMs) / (historyMs.length - 1);
    return firstMs - averageInterval;
  }
  return firstMs - SINGLE_POINT_FALLBACK_MS;
}

function buildChartRows(
  optionModels: MarketOption[],
  sortedHistories: MarketPriceHistoryItem[],
  initialPercents: Map<number, number> | null,
): { chartData: MarketPriceHistoryChartRow[]; xDomain: [number, number] | undefined } {
  // 이력이 없으면 차트를 그리지 않는다(빈 상태). 시작점 1개만으로 직선을 긋지 않음.
  if (sortedHistories.length === 0) {
    return { chartData: [], xDomain: undefined };
  }

  // 고유 이력 시각(오름차순)
  const historyTimes: string[] = [];
  const seenTimes = new Set<string>();
  for (const item of sortedHistories) {
    if (!seenTimes.has(item.createdAt)) {
      seenTimes.add(item.createdAt);
      historyTimes.push(item.createdAt);
    }
  }

  const historyMs = historyTimes.map((time) => new Date(time).getTime());
  const lastMs = historyMs[historyMs.length - 1];
  const startMs = resolveStartMs(historyMs);

  const historyLookup = new Map<string, number>();
  for (const item of sortedHistories) {
    historyLookup.set(
      `${item.optionId}|${item.createdAt}`,
      decimalToPercentValue(item.priceAfter),
    );
  }

  // carry-forward 초기값: 시작 가격이 있으면 그 값, 없으면 첫 이력에서 채워진다.
  const carried = new Map<number, number>();
  for (const option of optionModels) {
    carried.set(
      option.optionId,
      initialPercents?.get(option.optionId) ??
        historyLookup.get(`${option.optionId}|${historyTimes[0]}`) ??
        0,
    );
  }

  const chartData: MarketPriceHistoryChartRow[] = [];

  // 시작점(initialPrice). 구할 수 없으면(initialPercents === null) 생략하고 이력만 그린다.
  if (initialPercents) {
    const startRow: MarketPriceHistoryChartRow = { t: startMs };
    for (const option of optionModels) {
      startRow[optionDataKey(option.optionId)] = carried.get(option.optionId)!;
    }
    chartData.push(startRow);
  }

  // 이력 점들 (carry-forward)
  historyTimes.forEach((time, timeIndex) => {
    const row: MarketPriceHistoryChartRow = { t: historyMs[timeIndex] };
    for (const option of optionModels) {
      const value = historyLookup.get(`${option.optionId}|${time}`);
      if (value !== undefined) {
        carried.set(option.optionId, value);
      }
      row[optionDataKey(option.optionId)] = carried.get(option.optionId)!;
    }
    chartData.push(row);
  });

  return { chartData, xDomain: [startMs, lastMs] };
}
