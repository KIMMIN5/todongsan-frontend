import { useState } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { marketKeys } from "@/entities/market/model/market.keys";
import { isApiError } from "@/shared/api/apiError";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";

import { useDeleteMarketCommentMutation } from "../model/useDeleteMarketCommentMutation";

type DeleteMarketCommentButtonProps = {
  marketId: number;
  commentId: number;
  /** 삭제(또는 이미 삭제된 댓글 확인) 후 목록 쪽 후처리. 예: 빈 page면 이전 page로 이동 */
  onDeleted?: () => void;
};

export function DeleteMarketCommentButton({
  marketId,
  commentId,
  onDeleted,
}: DeleteMarketCommentButtonProps) {
  const queryClient = useQueryClient();
  const deleteComment = useDeleteMarketCommentMutation(marketId);
  const [open, setOpen] = useState(false);

  const handleConfirmDelete = () => {
    deleteComment.mutate(commentId, {
      onSuccess: () => {
        setOpen(false);
        toast.success("댓글이 삭제되었습니다.");
        onDeleted?.();
      },
      onError: (error) => {
        setOpen(false);

        // 이미 삭제된 댓글이면 실패로 보지 않고 목록을 다시 조회해 삭제 상태를 반영한다.
        if (isApiError(error) && error.errorCode === "MARKET_COMMENT_NOT_FOUND") {
          queryClient.invalidateQueries({
            queryKey: marketKeys.commentsRoot(marketId),
          });
          toast.info("이미 삭제된 댓글입니다.");
          onDeleted?.();
          return;
        }

        toast.error(
          isApiError(error) ? error.message : "댓글 삭제 중 문제가 발생했습니다.",
        );
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="댓글 삭제"
        onClick={() => setOpen(true)}
      >
        <Trash2 className="text-muted-foreground" />
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>댓글 삭제</DialogTitle>
          <DialogDescription>
            이 댓글을 삭제하시겠어요? 삭제한 댓글은 복구할 수 없습니다.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose
            render={<Button variant="outline" disabled={deleteComment.isPending} />}
          >
            취소
          </DialogClose>
          <Button
            variant="destructive"
            onClick={handleConfirmDelete}
            disabled={deleteComment.isPending}
          >
            {deleteComment.isPending ? "삭제 중..." : "삭제"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
