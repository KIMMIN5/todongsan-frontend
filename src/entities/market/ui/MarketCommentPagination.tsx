import { Button } from "@/shared/ui/button";

type MarketCommentPaginationProps = {
  page: number;
  totalPages: number;
  isFetching: boolean;
  onPrev: () => void;
  onNext: () => void;
};

export function MarketCommentPagination({
  page,
  totalPages,
  isFetching,
  onPrev,
  onNext,
}: MarketCommentPaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-3 pt-2">
      <Button
        variant="outline"
        size="sm"
        disabled={page === 0 || isFetching}
        onClick={onPrev}
      >
        이전
      </Button>
      <span className="text-sm text-muted-foreground">
        {page + 1} / {totalPages}
      </span>
      <Button
        variant="outline"
        size="sm"
        disabled={page >= totalPages - 1 || isFetching}
        onClick={onNext}
      >
        다음
      </Button>
    </div>
  );
}
