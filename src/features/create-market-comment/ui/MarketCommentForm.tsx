import type { ReactNode } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import type { MarketStatus } from "@/entities/market/model/market.types";
import { isApiError } from "@/shared/api/apiError";
import { Button } from "@/shared/ui/button";
import { Textarea } from "@/shared/ui/textarea";

import {
  MARKET_COMMENT_MAX_LENGTH,
  createMarketCommentSchema,
  type CreateMarketCommentFormValues,
} from "../model/createMarketComment.schema";
import { useCreateMarketCommentMutation } from "../model/useCreateMarketCommentMutation";

/** MARKET_API_SPEC.md §3-1 "허용 Market 상태" 기준. canPredict와는 별개 기준이라 여기서 별도로 판단한다. */
const COMMENTABLE_MARKET_STATUSES: MarketStatus[] = [
  "ACTIVE",
  "CLOSED",
  "DATA_PENDING",
  "SETTLEMENT_IN_PROGRESS",
  "SETTLED",
];

const MARKET_COMMENT_ERROR_MESSAGES: Record<string, string> = {
  UNAUTHORIZED: "로그인이 필요합니다.",
  VALIDATION_FAILED: "댓글 내용을 확인해 주세요.",
  MARKET_COMMENT_TOO_LONG: "댓글은 500자까지 입력할 수 있습니다.",
  MARKET_COMMENT_NOT_ALLOWED: "현재 Market 상태에서는 댓글을 작성할 수 없습니다.",
  MARKET_NOT_FOUND: "마켓을 찾을 수 없습니다.",
};

type MarketCommentFormProps = {
  marketId: number;
  marketStatus: MarketStatus;
  isAuthenticated: boolean;
  /** 비로그인 상태일 때 작성 폼 대신 보여줄 UI (로그인 이동 정책은 page에서 주입) */
  unauthenticatedFallback?: ReactNode;
};

export function MarketCommentForm({
  marketId,
  marketStatus,
  isAuthenticated,
  unauthenticatedFallback,
}: MarketCommentFormProps) {
  const createComment = useCreateMarketCommentMutation(marketId);
  const canComment = COMMENTABLE_MARKET_STATUSES.includes(marketStatus);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<CreateMarketCommentFormValues>({
    resolver: zodResolver(createMarketCommentSchema),
    defaultValues: { content: "" },
  });

  const contentValue = useWatch({ control, name: "content" }) ?? "";

  if (!isAuthenticated) {
    return <>{unauthenticatedFallback}</>;
  }

  if (!canComment) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-muted/20 px-4 py-5 text-center text-sm text-muted-foreground">
        현재 Market 상태에서는 댓글을 작성할 수 없습니다.
      </div>
    );
  }

  const onSubmit = (values: CreateMarketCommentFormValues) => {
    createComment.mutate(
      { content: values.content },
      {
        onSuccess: () => {
          reset({ content: "" });
          toast.success("댓글이 작성되었습니다.");
        },
        onError: (error) => {
          const message = isApiError(error)
            ? MARKET_COMMENT_ERROR_MESSAGES[error.errorCode] ?? error.message
            : "댓글 작성 중 문제가 발생했습니다.";
          toast.error(message);
        },
      },
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
      <Textarea
        {...register("content")}
        placeholder="이 마켓에 대한 의견을 남겨보세요."
        rows={3}
        maxLength={MARKET_COMMENT_MAX_LENGTH}
        disabled={createComment.isPending}
        aria-invalid={Boolean(errors.content)}
      />
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs text-muted-foreground">
          {errors.content ? (
            <span className="text-destructive">{errors.content.message}</span>
          ) : (
            `${contentValue.length}/${MARKET_COMMENT_MAX_LENGTH}`
          )}
        </span>
        <Button type="submit" size="sm" disabled={createComment.isPending}>
          {createComment.isPending ? "작성 중..." : "댓글 작성"}
        </Button>
      </div>
    </form>
  );
}
