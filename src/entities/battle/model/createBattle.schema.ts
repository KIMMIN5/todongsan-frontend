import { z } from "zod";

// 배틀 생성 정책 (BATTLE_API_SPEC 1-4)
export const BATTLE_TITLE_MAX_LENGTH = 255;
export const BATTLE_OPTION_MAX_LENGTH = 100;
// description 최대 길이는 스펙 미정 → 합의 전까지 보수적 기본값
export const BATTLE_DESCRIPTION_MAX_LENGTH = 1000;

export const createBattleSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "제목을 입력해 주세요.")
      .max(
        BATTLE_TITLE_MAX_LENGTH,
        `제목은 최대 ${BATTLE_TITLE_MAX_LENGTH}자까지 입력할 수 있습니다.`,
      ),
    optionA: z
      .string()
      .trim()
      .min(1, "선택지 A를 입력해 주세요.")
      .max(
        BATTLE_OPTION_MAX_LENGTH,
        `선택지는 최대 ${BATTLE_OPTION_MAX_LENGTH}자까지 입력할 수 있습니다.`,
      ),
    optionB: z
      .string()
      .trim()
      .min(1, "선택지 B를 입력해 주세요.")
      .max(
        BATTLE_OPTION_MAX_LENGTH,
        `선택지는 최대 ${BATTLE_OPTION_MAX_LENGTH}자까지 입력할 수 있습니다.`,
      ),
    description: z
      .string()
      .trim()
      .max(
        BATTLE_DESCRIPTION_MAX_LENGTH,
        `설명은 최대 ${BATTLE_DESCRIPTION_MAX_LENGTH}자까지 입력할 수 있습니다.`,
      )
      .optional(),
    sido: z.string().optional(),
    sigu: z.string().optional(),
    startAt: z.string().min(1, "시작 일시를 선택해 주세요."),
    endAt: z.string().min(1, "마감 일시를 선택해 주세요."),
  })
  .refine((values) => values.optionA.trim() !== values.optionB.trim(), {
    message: "선택지 A와 B는 서로 달라야 합니다.",
    path: ["optionB"],
  })
  .refine((values) => Boolean(values.sido) === Boolean(values.sigu), {
    message: "시/도와 시/군/구를 모두 선택해 주세요.",
    path: ["sigu"],
  })
  .refine(
    (values) => new Date(values.startAt).getTime() < new Date(values.endAt).getTime(),
    {
      message: "마감 일시는 시작 일시보다 뒤여야 합니다.",
      path: ["endAt"],
    },
  );

export type CreateBattleFormValues = z.infer<typeof createBattleSchema>;
