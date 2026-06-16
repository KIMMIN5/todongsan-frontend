import { z } from "zod";

// 댓글 정책: content 필수, 최대 500자 (BATTLE_API_SPEC 1-4)
export const COMMENT_MAX_LENGTH = 500;

export const commentSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "댓글을 입력해 주세요.")
    .max(COMMENT_MAX_LENGTH, `댓글은 최대 ${COMMENT_MAX_LENGTH}자까지 입력할 수 있습니다.`),
});

export type CommentFormValues = z.infer<typeof commentSchema>;
