import { toDecimal } from "./decimal";

/**
 * 포인트 값을 포맷팅합니다. 천 단위 구분 쉼표와 'P' 접미사를 붙입니다.
 * 예: "1250.5" -> "1,250.5P"
 */
export function formatPointAmount(
  value: string | null | undefined,
  maxFractionDigits?: number,
): string {
  if (value === null || value === undefined || value === "") return "-";

  const d =
    maxFractionDigits === undefined
      ? toDecimal(value)
      : toDecimal(value).toDecimalPlaces(maxFractionDigits);
  const parts = d.toString().split(".");
  const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const fractionalPart = parts[1] ? `.${parts[1]}` : "";

  return `${integerPart}${fractionalPart}P`;
}

/**
 * 마켓 가격/수량 값을 포맷팅합니다. 천 단위 구분 쉼표를 붙입니다.
 * 예: "1000" -> "1,000"
 * maxFractionDigits를 지정하면 표시용으로 해당 자릿수까지 반올림합니다.
 * 예: formatMarketPrice("166.66666667", 2) -> "166.67"
 */
export function formatMarketPrice(
  value: string | null | undefined,
  maxFractionDigits?: number,
): string {
  if (value === null || value === undefined || value === "") return "-";

  const d =
    maxFractionDigits === undefined
      ? toDecimal(value)
      : toDecimal(value).toDecimalPlaces(maxFractionDigits);
  const parts = d.toString().split(".");
  const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const fractionalPart = parts[1] ? `.${parts[1]}` : "";

  return `${integerPart}${fractionalPart}`;
}

/**
 * 비율(소수점) 값을 백분율로 포맷팅합니다. 100을 곱한 뒤 '%' 접미사를 붙입니다.
 * 기본적으로 소수 첫째 자리까지 반올림합니다. (예: "0.666666" -> "66.7%")
 * 불필요한 trailing 0은 표시하지 않습니다. (예: "0.25" -> "25%")
 */
export function formatPercent(
  value: string | null | undefined,
  maxFractionDigits = 1,
): string {
  if (value === null || value === undefined || value === "") return "-";

  const d = toDecimal(value).times(100).toDecimalPlaces(maxFractionDigits);
  const parts = d.toString().split(".");
  const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const fractionalPart = parts[1] ? `.${parts[1]}` : "";

  return `${integerPart}${fractionalPart}%`;
}

/**
 * 비율(소수점) 값을 레이아웃 계산용 백분율 숫자로 변환합니다. (예: 진행 막대 너비)
 * 결과는 0~100 범위로 clamp 됩니다.
 * 표시용 텍스트가 아닌 CSS 계산 전용이므로 toDecimal을 거쳐 숫자로 변환합니다.
 */
export function decimalToPercentValue(value: string | null | undefined): number {
  if (value === null || value === undefined || value === "") return 0;

  const pct = toDecimal(value).times(100).toNumber();
  if (pct < 0) return 0;
  if (pct > 100) return 100;
  return pct;
}

/**
 * 배수율 값을 포맷팅합니다. '배' 접미사를 붙입니다.
 * 예: "1.26666666" -> "1.26666666배"
 */
export function formatRate(value: string | null | undefined): string {
  if (value === null || value === undefined || value === "") return "-";

  const d = toDecimal(value);
  return `${d.toString()}배`;
}
