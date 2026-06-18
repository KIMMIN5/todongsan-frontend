import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { SIDO_LIST, SIGUNGU_MAP } from "@/shared/constants/regions";
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
  BATTLE_DESCRIPTION_MAX_LENGTH,
  BATTLE_OPTION_MAX_LENGTH,
  BATTLE_TITLE_MAX_LENGTH,
  createBattleSchema,
  type CreateBattleFormValues,
} from "../model/createBattle.schema";
import type { CreateBattleRequest } from "../model/battle.types";

type BattleCreateFormProps = {
  /** 검증을 통과한 생성 요청을 page로 전달 (네비게이션/토스트는 page에서 처리) */
  onSubmit: (request: CreateBattleRequest) => void;
  isSubmitting: boolean;
};

// datetime-local 값("YYYY-MM-DDTHH:mm")을 LocalDateTime("...:ss")으로 보정
function toLocalDateTime(value: string): string {
  return value.length === 16 ? `${value}:00` : value;
}

export function BattleCreateForm({
  onSubmit,
  isSubmitting,
}: BattleCreateFormProps) {
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateBattleFormValues>({
    resolver: zodResolver(createBattleSchema),
    defaultValues: {
      title: "",
      optionA: "",
      optionB: "",
      description: "",
      sido: "",
      sigu: "",
      startAt: "",
      endAt: "",
    },
  });

  const selectedSido = watch("sido");
  const sigunguOptions = selectedSido ? SIGUNGU_MAP[selectedSido] ?? [] : [];

  const submit = (values: CreateBattleFormValues) => {
    const request: CreateBattleRequest = {
      title: values.title.trim(),
      optionA: values.optionA.trim(),
      optionB: values.optionB.trim(),
      startAt: toLocalDateTime(values.startAt),
      endAt: toLocalDateTime(values.endAt),
    };

    const description = values.description?.trim();
    if (description) request.description = description;
    if (values.sido) request.sido = values.sido;
    if (values.sigu) request.sigu = values.sigu;

    onSubmit(request);
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-5">
      <div className="space-y-1.5">
        <label htmlFor="battle-title" className="text-xs font-bold text-slate-700">
          제목
        </label>
        <Input
          id="battle-title"
          maxLength={BATTLE_TITLE_MAX_LENGTH}
          placeholder="예: 성수 vs 연남, 데이트하기 어디가 더 좋을까?"
          aria-invalid={Boolean(errors.title)}
          {...register("title")}
        />
        {errors.title && (
          <p className="text-xs text-destructive">{errors.title.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label htmlFor="battle-option-a" className="text-xs font-bold text-slate-700">
            선택지 A
          </label>
          <Input
            id="battle-option-a"
            maxLength={BATTLE_OPTION_MAX_LENGTH}
            placeholder="예: 성수"
            aria-invalid={Boolean(errors.optionA)}
            {...register("optionA")}
          />
          {errors.optionA && (
            <p className="text-xs text-destructive">{errors.optionA.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="battle-option-b" className="text-xs font-bold text-slate-700">
            선택지 B
          </label>
          <Input
            id="battle-option-b"
            maxLength={BATTLE_OPTION_MAX_LENGTH}
            placeholder="예: 연남"
            aria-invalid={Boolean(errors.optionB)}
            {...register("optionB")}
          />
          {errors.optionB && (
            <p className="text-xs text-destructive">{errors.optionB.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="battle-description" className="text-xs font-bold text-slate-700">
          설명 <span className="font-normal text-muted-foreground">(선택)</span>
        </label>
        <Textarea
          id="battle-description"
          rows={3}
          maxLength={BATTLE_DESCRIPTION_MAX_LENGTH}
          placeholder="배틀 주제를 설명해 주세요."
          aria-invalid={Boolean(errors.description)}
          {...register("description")}
        />
        {errors.description && (
          <p className="text-xs text-destructive">{errors.description.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700">
            시/도 <span className="font-normal text-muted-foreground">(선택)</span>
          </label>
          <Controller
            control={control}
            name="sido"
            render={({ field }) => (
              <Select
                value={field.value ?? null}
                onValueChange={(value) => {
                  field.onChange(value);
                  setValue("sigu", "");
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="시/도 선택" />
                </SelectTrigger>
                <SelectContent>
                  {SIDO_LIST.map((sido) => (
                    <SelectItem key={sido} value={sido}>
                      {sido}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700">시/군/구</label>
          <Controller
            control={control}
            name="sigu"
            render={({ field }) => (
              <Select
                value={field.value ?? null}
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
          {errors.sigu && (
            <p className="text-xs text-destructive">{errors.sigu.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label htmlFor="battle-start-at" className="text-xs font-bold text-slate-700">
            시작 일시
          </label>
          <Input
            id="battle-start-at"
            type="datetime-local"
            aria-invalid={Boolean(errors.startAt)}
            {...register("startAt")}
          />
          {errors.startAt && (
            <p className="text-xs text-destructive">{errors.startAt.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="battle-end-at" className="text-xs font-bold text-slate-700">
            마감 일시
          </label>
          <Input
            id="battle-end-at"
            type="datetime-local"
            aria-invalid={Boolean(errors.endAt)}
            {...register("endAt")}
          />
          {errors.endAt && (
            <p className="text-xs text-destructive">{errors.endAt.message}</p>
          )}
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "등록 중..." : "배틀 등록하기"}
      </Button>
    </form>
  );
}
