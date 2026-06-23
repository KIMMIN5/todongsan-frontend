import { z } from "zod";

export const MARKET_COMMENT_MAX_LENGTH = 500;

export const createMarketCommentSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "댓글을 입력해 주세요.")
    .max(
      MARKET_COMMENT_MAX_LENGTH,
      `댓글은 최대 ${MARKET_COMMENT_MAX_LENGTH}자까지 입력할 수 있습니다.`,
    ),
});

export type CreateMarketCommentFormValues = z.infer<
  typeof createMarketCommentSchema
>;
