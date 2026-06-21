import { Decimal } from "@/shared/lib/decimal";

import type { AdminMarketOption } from "../model/market.types";

export type NumericRangeMatchResult =
  | { status: "empty" }
  | { status: "invalid" }
  | { status: "none" }
  | { status: "ambiguous" }
  | { status: "matched"; option: AdminMarketOption };

/**
 * NUMERIC_RANGE 결과 확정 입력값 미리보기용 매칭. 최종 판정은 서버가 수행한다.
 */
export function matchNumericRangeOption(
  resultValue: string,
  options: AdminMarketOption[],
): NumericRangeMatchResult {
  if (resultValue.trim() === "") return { status: "empty" };

  let value: Decimal;
  try {
    value = new Decimal(resultValue);
  } catch {
    return { status: "invalid" };
  }
  if (value.isNaN()) return { status: "invalid" };

  const matched = options.filter((option) => {
    if (option.rangeMin === undefined || option.rangeMax === undefined) {
      return false;
    }
    const min = new Decimal(option.rangeMin);
    const max = new Decimal(option.rangeMax);
    const minOk = option.minInclusive === false ? value.gt(min) : value.gte(min);
    const maxOk = option.maxInclusive === false ? value.lt(max) : value.lte(max);
    return minOk && maxOk;
  });

  if (matched.length === 0) return { status: "none" };
  if (matched.length > 1) return { status: "ambiguous" };
  return { status: "matched", option: matched[0] };
}
