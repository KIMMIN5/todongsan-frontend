import type { ReactNode } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { isApiError } from "@/shared/api/apiError";
import { Button } from "@/shared/ui/button";
import { Textarea } from "@/shared/ui/textarea";

import {
  COMMENT_MAX_LENGTH,
  commentSchema,
  type CommentFormValues,
} from "../model/comment.schema";
import { useCreateComment } from "../model/useCreateComment";

type BattleCommentFormProps = {
  battleId: number;
  isAuthenticated: boolean;
  /** 종료/취소된 배틀이면 댓글 작성 불가 */
  disabled?: boolean;
  /** 비로그인 상태일 때 보여줄 UI (로그인 이동 정책은 page/feature에서 주입) */
  unauthenticatedFallback?: ReactNode;
  /** 댓글 작성 성공 후 page 레벨 후처리 (예: 포인트 잔액 무효화) */
  onCommentSuccess?: () => void;
};

export function BattleCommentForm({
  battleId,
  isAuthenticated,
  disabled,
  unauthenticatedFallback,
  onCommentSuccess,
}: BattleCommentFormProps) {
  const createComment = useCreateComment(battleId);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<CommentFormValues>({
    resolver: zodResolver(commentSchema),
    defaultValues: { content: "" },
  });

  const contentValue = useWatch({ control, name: "content" }) ?? "";

  if (!isAuthenticated) {
    return <>{unauthenticatedFallback}</>;
  }

  if (disabled) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-muted/20 px-4 py-5 text-center text-sm text-muted-foreground">
        종료된 배틀에는 댓글을 작성할 수 없습니다.
      </div>
    );
  }

  const onSubmit = (values: CommentFormValues) => {
    createComment.mutate(
      { content: values.content },
      {
        onSuccess: () => {
          reset({ content: "" });
          toast.success("댓글이 작성되었습니다.");
          onCommentSuccess?.();
        },
        onError: (error) => {
          toast.error(
            isApiError(error)
              ? error.message
              : "댓글 작성 중 문제가 발생했습니다.",
          );
        },
      },
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
      <Textarea
        {...register("content")}
        placeholder="이 배틀에 대한 의견을 남겨보세요."
        rows={3}
        maxLength={COMMENT_MAX_LENGTH}
        disabled={createComment.isPending}
        aria-invalid={Boolean(errors.content)}
      />
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs text-muted-foreground">
          {errors.content ? (
            <span className="text-destructive">{errors.content.message}</span>
          ) : (
            `${contentValue.length}/${COMMENT_MAX_LENGTH}`
          )}
        </span>
        <Button type="submit" size="sm" disabled={createComment.isPending}>
          {createComment.isPending ? "작성 중..." : "댓글 작성"}
        </Button>
      </div>
    </form>
  );
}
