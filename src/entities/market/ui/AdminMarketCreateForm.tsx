import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { SIDO_LIST, SIGUNGU_MAP } from "@/shared/constants/regions";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { Textarea } from "@/shared/ui/textarea";

import {
  ANSWER_TYPE_OPTIONS,
  CATEGORY_OPTIONS,
  METRIC_UNIT_OPTIONS,
  NATIONAL_REGION_SIDO,
  REGION_SCOPE_OPTIONS,
  createMarketSchema,
  type CreateMarketFormValues,
} from "../model/createMarket.schema";
import type {
  AdminMarketMetricUnit,
  CreateMarketOptionRequest,
  CreateMarketRequest,
  MarketAnswerType,
} from "../model/market.types";

const DEFAULT_VIRTUAL_POOL_AMOUNT = "25000.00";
const DEFAULT_FEE_RATE = "5.00";

type OptionFormValue = CreateMarketFormValues["options"][number];

function defaultOptionsForAnswerType(answerType: MarketAnswerType): OptionFormValue[] {
  if (answerType === "YES_NO") {
    return [
      { optionText: "예", rangeMin: "", rangeMax: "", virtualPoolAmount: DEFAULT_VIRTUAL_POOL_AMOUNT },
      { optionText: "아니오", rangeMin: "", rangeMax: "", virtualPoolAmount: DEFAULT_VIRTUAL_POOL_AMOUNT },
    ];
  }
  return [
    { optionText: "", rangeMin: "", rangeMax: "", virtualPoolAmount: DEFAULT_VIRTUAL_POOL_AMOUNT },
    { optionText: "", rangeMin: "", rangeMax: "", virtualPoolAmount: DEFAULT_VIRTUAL_POOL_AMOUNT },
  ];
}

// datetime-local 값("YYYY-MM-DDTHH:mm")을 LocalDateTime("...:ss")으로 보정
function toLocalDateTime(value: string): string {
  return value.length === 16 ? `${value}:00` : value;
}

function buildOptionCode(answerType: MarketAnswerType, index: number): string {
  if (answerType === "YES_NO") return index === 0 ? "YES" : "NO";
  if (answerType === "MULTIPLE_CHOICE") return `OPT_${index + 1}`;
  return `RANGE_${index + 1}`;
}

/**
 * minInclusive/maxInclusive는 자유 입력 UI로 열지 않고 옵션 배열 순서(오름차순 입력을 가정)로만
 * 자동 세팅한다(§4-3 NUMERIC_RANGE 기본 포함 정책). minInclusive는 항상 true, maxInclusive는
 * 마지막 구간만 true로 둔다 — 두 값 모두 해당 구간의 범위가 null이면 백엔드에서 비교에 사용되지 않는다.
 */
function buildOptions(values: CreateMarketFormValues): CreateMarketOptionRequest[] {
  const { answerType, options } = values;

  return options.map((option, index) => {
    const base: CreateMarketOptionRequest = {
      optionCode: buildOptionCode(answerType, index),
      optionText: option.optionText.trim(),
      displayOrder: index + 1,
      virtualPoolAmount: option.virtualPoolAmount.trim(),
    };

    if (answerType !== "NUMERIC_RANGE") {
      return base;
    }

    const rangeMin = option.rangeMin.trim();
    const rangeMax = option.rangeMax.trim();
    return {
      ...base,
      rangeMin: rangeMin === "" ? null : rangeMin,
      rangeMax: rangeMax === "" ? null : rangeMax,
      minInclusive: true,
      maxInclusive: index === options.length - 1,
    };
  });
}

type AdminMarketCreateFormProps = {
  /** 로그인한 관리자 memberId. null이면 폼을 막고 안내만 표시한다. */
  createdBy: number | null;
  onSubmit: (request: CreateMarketRequest) => void;
  isSubmitting: boolean;
};

export function AdminMarketCreateForm({
  createdBy,
  onSubmit,
  isSubmitting,
}: AdminMarketCreateFormProps) {
  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CreateMarketFormValues>({
    resolver: zodResolver(createMarketSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "PRICE_INDEX",
      answerType: "YES_NO",
      metricUnit: "",
      regionScope: "NON_REGIONAL",
      regionSido: "",
      regionSigu: "",
      judgeDataSource: "",
      judgeCriteria: "",
      judgeDate: "",
      closeAt: "",
      settleDueAt: "",
      feeRate: DEFAULT_FEE_RATE,
      createdBy: createdBy ?? 0,
      options: defaultOptionsForAnswerType("YES_NO"),
    },
  });

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "options",
  });

  const answerType = useWatch({ control, name: "answerType" });
  const regionScope = useWatch({ control, name: "regionScope" });
  const selectedSido = useWatch({ control, name: "regionSido" });
  const sigunguOptions = selectedSido ? SIGUNGU_MAP[selectedSido] ?? [] : [];

  if (createdBy === null) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-muted/20 px-4 py-6 text-center text-sm text-muted-foreground">
        로그인한 관리자 정보를 확인할 수 없어 마켓을 생성할 수 없습니다. 로그인하거나 로컬
        개발용 회원 ID(VITE_DEV_MEMBER_ID)를 설정한 뒤 다시 시도해 주세요.
      </div>
    );
  }

  const submit = (values: CreateMarketFormValues) => {
    const request: CreateMarketRequest = {
      title: values.title.trim(),
      category: values.category,
      answerType: values.answerType,
      regionScope: values.regionScope,
      regionSido: values.regionScope === "REGIONAL" ? values.regionSido.trim() : null,
      regionSigu:
        values.regionScope === "REGIONAL" ? values.regionSigu.trim() || null : null,
      judgeDataSource: values.judgeDataSource.trim(),
      judgeCriteria: values.judgeCriteria.trim(),
      judgeDate: values.judgeDate,
      closeAt: toLocalDateTime(values.closeAt),
      settleDueAt: toLocalDateTime(values.settleDueAt),
      feeRate: values.feeRate.trim(),
      createdBy: values.createdBy,
      options: buildOptions(values),
    };

    const description = values.description?.trim();
    if (description) request.description = description;

    const metricUnit = values.metricUnit?.trim();
    if (metricUnit) request.metricUnit = metricUnit as AdminMarketMetricUnit;

    onSubmit(request);
  };

  function handleAnswerTypeChange(next: MarketAnswerType) {
    setValue("answerType", next);
    replace(defaultOptionsForAnswerType(next));
  }

  function handleAddOption() {
    append({ optionText: "", rangeMin: "", rangeMax: "", virtualPoolAmount: DEFAULT_VIRTUAL_POOL_AMOUNT });
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-8">
      {/* 기본 정보 */}
      <section className="space-y-4">
        <h3 className="text-sm font-bold text-slate-700">기본 정보</h3>

        <div className="space-y-1.5">
          <label htmlFor="market-title" className="text-xs font-bold text-slate-700">
            제목
          </label>
          <Input
            id="market-title"
            placeholder="예) 이번 주 대구 수성구 매매가 0.3% 이상 상승할까?"
            aria-invalid={Boolean(errors.title)}
            {...register("title")}
          />
          {errors.title && (
            <p className="text-xs text-destructive">{errors.title.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">카테고리</label>
            <Controller
              control={control}
              name="category"
              render={({ field }) => (
                <Select value={field.value ?? null} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="카테고리 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORY_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.category && (
              <p className="text-xs text-destructive">{errors.category.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">
              측정 단위 <span className="font-normal text-muted-foreground">(선택)</span>
            </label>
            <Controller
              control={control}
              name="metricUnit"
              render={({ field }) => (
                <Select value={field.value || null} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="측정 단위 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {METRIC_UNIT_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="market-description" className="text-xs font-bold text-slate-700">
            설명 <span className="font-normal text-muted-foreground">(선택)</span>
          </label>
          <Textarea
            id="market-description"
            rows={3}
            placeholder="판단 기준, 데이터 출처 등"
            {...register("description")}
          />
        </div>
      </section>

      {/* 응답 유형 */}
      <section className="space-y-3">
        <h3 className="text-sm font-bold text-slate-700">응답 유형</h3>
        <div className="grid grid-cols-3 gap-2">
          {ANSWER_TYPE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleAnswerTypeChange(option.value)}
              className={cn(
                "rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                answerType === option.value
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border hover:bg-muted",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {answerType === "YES_NO" &&
            fields.map((field, index) => (
              <div key={field.id} className="flex items-center gap-3">
                <span className="w-20 text-sm font-medium text-foreground">
                  {index === 0 ? "예" : "아니오"}
                </span>
                <div className="flex-1 space-y-1">
                  <label className="text-xs text-muted-foreground">
                    가상 유동성(초기 가격용)
                  </label>
                  <Input
                    inputMode="decimal"
                    {...register(`options.${index}.virtualPoolAmount`)}
                  />
                </div>
              </div>
            ))}

          {answerType === "MULTIPLE_CHOICE" && (
            <div className="space-y-2">
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-2">
                  <span className="w-14 shrink-0 text-xs text-muted-foreground">
                    OPT_{index + 1}
                  </span>
                  <div className="flex-1">
                    <Input
                      placeholder={`선택지 ${index + 1}`}
                      aria-invalid={Boolean(errors.options?.[index]?.optionText)}
                      {...register(`options.${index}.optionText`)}
                    />
                  </div>
                  <div className="w-28 shrink-0">
                    <Input
                      inputMode="decimal"
                      placeholder="가상 유동성"
                      {...register(`options.${index}.virtualPoolAmount`)}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    disabled={fields.length <= 2}
                    onClick={() => remove(index)}
                  >
                    ×
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={handleAddOption}>
                + 선택지 추가
              </Button>
              {typeof errors.options?.message === "string" && (
                <p className="text-xs text-destructive">{errors.options.message}</p>
              )}
            </div>
          )}

          {answerType === "NUMERIC_RANGE" && (
            <div className="space-y-2">
              {fields.map((field, index) => (
                <div key={field.id} className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-16 shrink-0 text-xs text-muted-foreground">
                      RANGE_{index + 1}
                    </span>
                    <Input
                      inputMode="decimal"
                      placeholder="최소값(비우면 -∞)"
                      {...register(`options.${index}.rangeMin`)}
                    />
                    <span className="text-muted-foreground">~</span>
                    <Input
                      inputMode="decimal"
                      placeholder="최대값(비우면 +∞)"
                      {...register(`options.${index}.rangeMax`)}
                    />
                    <Input
                      placeholder="라벨(예: 0~0.3%)"
                      {...register(`options.${index}.optionText`)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      disabled={fields.length <= 2}
                      onClick={() => remove(index)}
                    >
                      ×
                    </Button>
                  </div>
                  {(errors.options?.[index]?.rangeMin ||
                    errors.options?.[index]?.rangeMax) && (
                    <p className="ml-[4.5rem] text-xs text-destructive">
                      {errors.options[index]?.rangeMin?.message ??
                        errors.options[index]?.rangeMax?.message}
                    </p>
                  )}
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={handleAddOption}>
                + 구간 추가
              </Button>
              <p className="text-xs text-amber-700">
                ⚠ 구간이 겹치거나 비면 안 됩니다. 구간은 작은 값부터 순서대로 입력해 주세요.
              </p>
              {typeof errors.options?.message === "string" && (
                <p className="text-xs text-destructive">{errors.options.message}</p>
              )}
            </div>
          )}
        </div>
      </section>

      {/* 지역 범위 */}
      <section className="space-y-3">
        <h3 className="text-sm font-bold text-slate-700">지역 범위</h3>
        <div className="grid grid-cols-3 gap-2">
          {REGION_SCOPE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                setValue("regionScope", option.value);
                if (option.value !== "REGIONAL") {
                  setValue("regionSido", "");
                  setValue("regionSigu", "");
                }
              }}
              className={cn(
                "rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                regionScope === option.value
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border hover:bg-muted",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>

        {regionScope === "NON_REGIONAL" && (
          <p className="text-xs text-muted-foreground">지역 무관 마켓입니다.</p>
        )}
        {regionScope === "NATIONAL" && (
          <p className="text-xs text-muted-foreground">전국 단위 마켓입니다.</p>
        )}
        {regionScope === "REGIONAL" && (
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">시/도</label>
              <Controller
                control={control}
                name="regionSido"
                render={({ field }) => (
                  <Select
                    value={field.value || null}
                    onValueChange={(value) => {
                      field.onChange(value);
                      setValue("regionSigu", "");
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="시/도 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {SIDO_LIST.filter((sido) => sido !== NATIONAL_REGION_SIDO).map(
                        (sido) => (
                          <SelectItem key={sido} value={sido}>
                            {sido}
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.regionSido && (
                <p className="text-xs text-destructive">{errors.regionSido.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                시/군/구 <span className="font-normal text-muted-foreground">(선택)</span>
              </label>
              <Controller
                control={control}
                name="regionSigu"
                render={({ field }) => (
                  <Select
                    value={field.value || null}
                    onValueChange={field.onChange}
                    disabled={!selectedSido}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="시/군/구 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {sigunguOptions.map((sigu) => (
                        <SelectItem key={sigu} value={sigu}>
                          {sigu}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>
        )}
      </section>

      {/* 판정 정보 */}
      <section className="space-y-4">
        <h3 className="text-sm font-bold text-slate-700">판정 정보</h3>
        <div className="space-y-1.5">
          <label htmlFor="market-judge-data-source" className="text-xs font-bold text-slate-700">
            판정 데이터 출처
          </label>
          <Input
            id="market-judge-data-source"
            placeholder="예: 한국부동산원"
            aria-invalid={Boolean(errors.judgeDataSource)}
            {...register("judgeDataSource")}
          />
          {errors.judgeDataSource && (
            <p className="text-xs text-destructive">{errors.judgeDataSource.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <label htmlFor="market-judge-criteria" className="text-xs font-bold text-slate-700">
            판정 기준
          </label>
          <Textarea
            id="market-judge-criteria"
            rows={2}
            placeholder="예: 지정된 판정일의 변동률 기준"
            aria-invalid={Boolean(errors.judgeCriteria)}
            {...register("judgeCriteria")}
          />
          {errors.judgeCriteria && (
            <p className="text-xs text-destructive">{errors.judgeCriteria.message}</p>
          )}
        </div>
      </section>

      {/* 유동성 · 일정 */}
      <section className="space-y-4">
        <h3 className="text-sm font-bold text-slate-700">일정 · 정책</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label htmlFor="market-fee-rate" className="text-xs font-bold text-slate-700">
              수수료율(%)
            </label>
            <Input
              id="market-fee-rate"
              inputMode="decimal"
              aria-invalid={Boolean(errors.feeRate)}
              {...register("feeRate")}
            />
            {errors.feeRate && (
              <p className="text-xs text-destructive">{errors.feeRate.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <label htmlFor="market-judge-date" className="text-xs font-bold text-slate-700">
              판정일
            </label>
            <Input
              id="market-judge-date"
              type="date"
              aria-invalid={Boolean(errors.judgeDate)}
              {...register("judgeDate")}
            />
            {errors.judgeDate && (
              <p className="text-xs text-destructive">{errors.judgeDate.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label htmlFor="market-close-at" className="text-xs font-bold text-slate-700">
              마감 일시
            </label>
            <Input
              id="market-close-at"
              type="datetime-local"
              aria-invalid={Boolean(errors.closeAt)}
              {...register("closeAt")}
            />
            {errors.closeAt && (
              <p className="text-xs text-destructive">{errors.closeAt.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <label htmlFor="market-settle-due-at" className="text-xs font-bold text-slate-700">
              정산 예정일
            </label>
            <Input
              id="market-settle-due-at"
              type="datetime-local"
              aria-invalid={Boolean(errors.settleDueAt)}
              {...register("settleDueAt")}
            />
            {errors.settleDueAt && (
              <p className="text-xs text-destructive">{errors.settleDueAt.message}</p>
            )}
          </div>
        </div>
      </section>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "생성 중..." : "마켓 생성"}
      </Button>
    </form>
  );
}
