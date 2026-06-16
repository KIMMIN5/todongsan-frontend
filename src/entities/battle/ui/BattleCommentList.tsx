import { useState } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

import { isApiError } from "@/shared/api/apiError";
import { formatDateTime } from "@/shared/lib/formatDate";
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

import type { BattleComment } from "../model/battle.types";
import { useDeleteComment } from "../model/useDeleteComment";

type BattleCommentListProps = {
  battleId: number;
  comments: BattleComment[];
  currentMemberId: number | null;
  currentNickname: string | null;
};

function authorLabel(
  memberId: number,
  currentMemberId: number | null,
  currentNickname: string | null,
): string {
  if (currentMemberId !== null && memberId === currentMemberId) {
    return currentNickname ?? "나";
  }
  // 백엔드 댓글 응답에 nickname이 없어 회원 식별자로 대체 표시
  return `회원 #${memberId}`;
}

export function BattleCommentList({
  battleId,
  comments,
  currentMemberId,
  currentNickname,
}: BattleCommentListProps) {
  const deleteComment = useDeleteComment(battleId);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

  const handleConfirmDelete = () => {
    if (deleteTargetId === null) return;
    deleteComment.mutate(deleteTargetId, {
      onSuccess: () => {
        setDeleteTargetId(null);
        toast.success("댓글이 삭제되었습니다.");
      },
      onError: (error) => {
        setDeleteTargetId(null);
        toast.error(
          isApiError(error) ? error.message : "댓글 삭제 중 문제가 발생했습니다.",
        );
      },
    });
  };

  return (
    <>
      <ul className="divide-y divide-border">
        {comments.map((comment) => {
          const isMine =
            currentMemberId !== null && comment.memberId === currentMemberId;

          return (
            <li key={comment.commentId} className="flex gap-3 py-3.5">
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">
                    {authorLabel(
                      comment.memberId,
                      currentMemberId,
                      currentNickname,
                    )}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDateTime(comment.createdAt)}
                  </span>
                </div>
                <p className="text-sm whitespace-pre-wrap break-words text-foreground/90">
                  {comment.content}
                </p>
              </div>
              {isMine && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="댓글 삭제"
                  onClick={() => setDeleteTargetId(comment.commentId)}
                >
                  <Trash2 className="text-muted-foreground" />
                </Button>
              )}
            </li>
          );
        })}
      </ul>

      <Dialog
        open={deleteTargetId !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTargetId(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>댓글 삭제</DialogTitle>
            <DialogDescription>
              이 댓글을 삭제하시겠어요? 삭제한 댓글은 복구할 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose
              render={
                <Button variant="outline" disabled={deleteComment.isPending} />
              }
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
    </>
  );
}
