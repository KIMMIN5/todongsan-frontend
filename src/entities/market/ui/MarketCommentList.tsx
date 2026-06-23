import type { ReactNode } from "react";

import type { MarketComment } from "../model/market.types";
import { MarketCommentItem } from "./MarketCommentItem";

type MarketCommentListProps = {
  comments: MarketComment[];
  currentMemberId: number | null;
  currentNickname: string | null;
  /** 본인 댓글에 주입할 삭제 버튼. entities가 features를 직접 import하지 않도록 page에서 렌더 함수로 주입한다. */
  renderDeleteSlot?: (comment: MarketComment) => ReactNode;
};

export function MarketCommentList({
  comments,
  currentMemberId,
  currentNickname,
  renderDeleteSlot,
}: MarketCommentListProps) {
  return (
    <ul className="divide-y divide-border">
      {comments.map((comment) => {
        const isMine =
          currentMemberId !== null && comment.memberId === currentMemberId;

        return (
          <MarketCommentItem
            key={comment.commentId}
            comment={comment}
            isMine={isMine}
            authorLabel={authorLabel(comment.memberId, currentMemberId, currentNickname)}
            deleteSlot={isMine ? renderDeleteSlot?.(comment) : undefined}
          />
        );
      })}
    </ul>
  );
}

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
