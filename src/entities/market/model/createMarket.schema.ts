import { z } from "zod";

import type {
  AdminMarketCategory,
  AdminMarketMetricUnit,
  MarketAnswerType,
  MarketRegionScope,
} from "./market.types";

export const MARKET_TITLE_MAX_LENGTH = 255;
export const MARKET_JUDGE_DATA_SOURCE_MAX_LENGTH = 255;
export const MARKET_OPTION_TEXT_MAX_LENGTH = 100;
export const MARKET_OPTION_CODE_MAX_LENGTH = 20;

/** market-service AdminMarketService.NATIONAL_REGION_SIDO와 동일한 값. */
export const NATIONAL_REGION_SIDO = "전국";

export const CATEGORY_OPTIONS: { value: AdminMarketCategory; label: string }[] = [
  { value: "PRICE_INDEX", label: "가격지수" },
  { value: "TRANSACTION_VOLUME", label: "거래량" },
  { value: "ACTUAL_PRICE", label: "실거래가" },
  { value: "POLICY_EVENT", label: "정책/이벤트" },
];

export const METRIC_UNIT_OPTIONS: { value: AdminMarketMetricUnit; label: string }[] = [
  { value: "PERCENT", label: "%" },
  { value: "COUNT", label: "건" },
  { value: "KRW", label: "원" },
  { value: "INDEX_POINT", label: "포인트" },
];

export const ANSWER_TYPE_OPTIONS: { value: MarketAnswerType; label: string }[] = [
  { value: "YES_NO", label: "예 / 아니오" },
  { value: "MULTIPLE_CHOICE", label: "객관식" },
  { value: "NUMERIC_RANGE", label: "숫자 구간" },
];

export const REGION_SCOPE_OPTIONS: { value: MarketRegionScope; label: string }[] = [
  { value: "NON_REGIONAL", label: "지역 무관" },
  { value: "NATIONAL", label: "전국" },
  { value: "REGIONAL", label: "특정 지역" },
];

/**
 * optionCode, displayOrder, minInclusive, maxInclusive는 화면에서 직접 입력받지 않는다.
 * answerType과 옵션 배열의 순서(index)만으로 제출 시점에 자동 계산한다(§4 옵션 UI 정책).
 */
const createMarketOptionSchema = z.object({
  optionText: z
    .string()
    .trim()
    .min(1, "선택지 내용을 입력해 주세요.")
    .max(
      MARKET_OPTION_TEXT_MAX_LENGTH,
      `선택지는 최대 ${MARKET_OPTION_TEXT_MAX_LENGTH}자까지 입력할 수 있습니다.`,
    ),
  /** NUMERIC_RANGE에서만 사용. 빈 문자열은 무한대(null)를 의미한다. */
  rangeMin: z.string(),
  rangeMax: z.string(),
  virtualPoolAmount: z
    .string()
    .trim()
    .min(1, "가상 유동성을 입력해 주세요.")
    .refine(isPositiveDecimal, "가상 유동성은 0보다 큰 숫자여야 합니다."),
});

export const createMarketSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "제목을 입력해 주세요.")
      .max(
        MARKET_TITLE_MAX_LENGTH,
        `제목은 최대 ${MARKET_TITLE_MAX_LENGTH}자까지 입력할 수 있습니다.`,
      ),
    description: z.string().trim().optional(),
    category: z.enum(
      ["PRICE_INDEX", "TRANSACTION_VOLUME", "ACTUAL_PRICE", "POLICY_EVENT"],
      "카테고리를 선택해 주세요.",
    ),
    answerType: z.enum(["YES_NO", "MULTIPLE_CHOICE", "NUMERIC_RANGE"]),
    metricUnit: z.string().trim().optional(),
    regionScope: z.enum(
      ["NON_REGIONAL", "NATIONAL", "REGIONAL"],
      "지역 범위를 선택해 주세요.",
    ),
    regionSido: z.string().trim(),
    regionSigu: z.string().trim(),
    judgeDataSource: z
      .string()
      .trim()
      .min(1, "판정 데이터 출처를 입력해 주세요.")
      .max(MARKET_JUDGE_DATA_SOURCE_MAX_LENGTH),
    judgeCriteria: z.string().trim().min(1, "판정 기준을 입력해 주세요."),
    judgeDate: z.string().min(1, "판정일을 선택해 주세요."),
    closeAt: z.string().min(1, "마감 일시를 선택해 주세요."),
    settleDueAt: z.string().min(1, "정산 예정일을 선택해 주세요."),
    feeRate: z
      .string()
      .trim()
      .min(1, "수수료율을 입력해 주세요.")
      .refine(isValidFeeRate, "수수료율은 0 이상 100 이하여야 합니다."),
    createdBy: z
      .number({ error: "로그인한 관리자 정보를 확인할 수 없습니다." })
      .int()
      .positive("로그인한 관리자 정보를 확인할 수 없습니다."),
    options: z
      .array(createMarketOptionSchema)
      .min(2, "선택지는 최소 2개 이상이어야 합니다."),
  })
  .superRefine((values, ctx) => {
    validateRegion(values, ctx);
    validateDates(values, ctx);

    if (values.answerType === "YES_NO" && values.options.length !== 2) {
      ctx.addIssue({
        code: "custom",
        path: ["options"],
        message: "예/아니오 마켓은 선택지가 정확히 2개여야 합니다.",
      });
    }

    if (values.answerType === "NUMERIC_RANGE") {
      validateNumericRanges(values.options, ctx);
    }
  });

export type CreateMarketFormValues = z.infer<typeof createMarketSchema>;

function isPositiveDecimal(value: string): boolean {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0;
}

function isValidFeeRate(value: string): boolean {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 && parsed <= 100;
}

function validateRegion(
  values: { regionScope: MarketRegionScope; regionSido?: string; regionSigu?: string },
  ctx: z.RefinementCtx,
) {
  const sido = values.regionSido?.trim() ?? "";
  const sigu = values.regionSigu?.trim() ?? "";

  if (values.regionScope === "NON_REGIONAL") {
    if (sido !== "" || sigu !== "") {
      ctx.addIssue({
        code: "custom",
        path: ["regionSido"],
        message: "지역 무관 마켓에는 시/도, 시/군/구를 입력할 수 없습니다.",
      });
    }
    return;
  }

  if (values.regionScope === "NATIONAL") {
    if (sido !== "" && sido !== NATIONAL_REGION_SIDO) {
      ctx.addIssue({
        code: "custom",
        path: ["regionSido"],
        message: "전국 마켓의 시/도는 비워두거나 '전국'만 입력할 수 있습니다.",
      });
    }
    if (sigu !== "") {
      ctx.addIssue({
        code: "custom",
        path: ["regionSigu"],
        message: "전국 마켓에는 시/군/구를 입력할 수 없습니다.",
      });
    }
    return;
  }

  // REGIONAL
  if (sido === "") {
    ctx.addIssue({
      code: "custom",
      path: ["regionSido"],
      message: "특정 지역 마켓은 시/도를 입력해야 합니다.",
    });
  } else if (sido === NATIONAL_REGION_SIDO) {
    ctx.addIssue({
      code: "custom",
      path: ["regionSido"],
      message: "특정 지역 마켓에는 '전국'을 사용할 수 없습니다.",
    });
  }
}

function validateDates(
  values: { closeAt: string; judgeDate: string; settleDueAt: string },
  ctx: z.RefinementCtx,
) {
  const closeAt = values.closeAt ? new Date(values.closeAt) : null;
  const judgeDate = values.judgeDate ? new Date(`${values.judgeDate}T00:00:00`) : null;
  const settleDueAt = values.settleDueAt ? new Date(values.settleDueAt) : null;

  if (closeAt && Number.isNaN(closeAt.getTime())) return;
  if (judgeDate && Number.isNaN(judgeDate.getTime())) return;
  if (settleDueAt && Number.isNaN(settleDueAt.getTime())) return;

  if (closeAt && judgeDate) {
    const closeAtDateOnly = new Date(
      closeAt.getFullYear(),
      closeAt.getMonth(),
      closeAt.getDate(),
    );
    if (judgeDate.getTime() < closeAtDateOnly.getTime()) {
      ctx.addIssue({
        code: "custom",
        path: ["judgeDate"],
        message: "판정일은 마감일 이후 날짜여야 합니다.",
      });
    }
  }

  if (closeAt && settleDueAt && settleDueAt.getTime() <= closeAt.getTime()) {
    ctx.addIssue({
      code: "custom",
      path: ["settleDueAt"],
      message: "정산 예정일은 마감 일시보다 이후여야 합니다.",
    });
  }

  if (judgeDate && settleDueAt) {
    const settleDueAtDateOnly = new Date(
      settleDueAt.getFullYear(),
      settleDueAt.getMonth(),
      settleDueAt.getDate(),
    );
    if (settleDueAtDateOnly.getTime() < judgeDate.getTime()) {
      ctx.addIssue({
        code: "custom",
        path: ["settleDueAt"],
        message: "정산 예정일은 판정일 이후여야 합니다.",
      });
    }
  }
}

function validateNumericRanges(
  options: { rangeMin: string; rangeMax: string }[],
  ctx: z.RefinementCtx,
) {
  type ParsedRange = { index: number; min: number | null; max: number | null };

  const parsed: ParsedRange[] = options.map((option, index) => ({
    index,
    min: option.rangeMin.trim() === "" ? null : Number(option.rangeMin),
    max: option.rangeMax.trim() === "" ? null : Number(option.rangeMax),
  }));

  parsed.forEach(({ index, min, max }) => {
    if (min === null && max === null) {
      ctx.addIssue({
        code: "custom",
        path: ["options", index, "rangeMin"],
        message: "구간의 최소값과 최대값이 모두 비어 있을 수 없습니다.",
      });
    }
    if (min !== null && max !== null && min >= max) {
      ctx.addIssue({
        code: "custom",
        path: ["options", index, "rangeMax"],
        message: "최대값은 최소값보다 커야 합니다.",
      });
    }
  });

  const openStartCount = parsed.filter((range) => range.min === null).length;
  const openEndCount = parsed.filter((range) => range.max === null).length;
  if (openStartCount > 1) {
    ctx.addIssue({
      code: "custom",
      path: ["options"],
      message: "최소값이 없는(-무한대) 구간은 최대 1개만 허용됩니다.",
    });
  }
  if (openEndCount > 1) {
    ctx.addIssue({
      code: "custom",
      path: ["options"],
      message: "최대값이 없는(+무한대) 구간은 최대 1개만 허용됩니다.",
    });
  }

  const sorted = [...parsed].sort((a, b) => {
    const aMin = a.min ?? Number.NEGATIVE_INFINITY;
    const bMin = b.min ?? Number.NEGATIVE_INFINITY;
    return aMin - bMin;
  });

  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1];
    const current = sorted[i];
    if (prev.max === null || current.min === null || prev.max !== current.min) {
      ctx.addIssue({
        code: "custom",
        path: ["options"],
        message: "구간이 겹치거나 빈 부분이 있습니다. 구간을 다시 확인해 주세요.",
      });
      break;
    }
  }
}
