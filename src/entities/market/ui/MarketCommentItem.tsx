import type { ReactNode } from "react";

import { formatDateTime } from "@/shared/lib/formatDate";

import type { MarketComment } from "../model/market.types";

type MarketCommentItemProps = {
  comment: MarketComment;
  authorLabel: string;
  isMine: boolean;
  /** 본인 댓글에만 page에서 주입하는 삭제 버튼. entities가 features를 직접 import하지 않도록 슬롯으로 받는다. */
  deleteSlot?: ReactNode;
};

export function MarketCommentItem({
  comment,
  authorLabel,
  isMine,
  deleteSlot,
}: MarketCommentItemProps) {
  return (
    <li className="flex gap-3 py-3.5">
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">
            {authorLabel}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatDateTime(comment.createdAt)}
          </span>
        </div>
        <p className="text-sm whitespace-pre-wrap break-words text-foreground/90">
          {comment.content}
        </p>
      </div>
      {isMine && deleteSlot}
    </li>
  );
}
