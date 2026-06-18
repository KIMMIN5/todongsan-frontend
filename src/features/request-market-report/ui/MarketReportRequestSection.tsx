import { BrainCircuit } from "lucide-react";
import { useState } from "react";

import { isApiError } from "@/shared/api/apiError";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";

import { useRequestMarketReport } from "../model/useRequestMarketReport";

type MarketReportRequestSectionProps = {
  marketId: number;
  onRequested: () => void;
};

export function MarketReportRequestSection({
  marketId,
  onRequested,
}: MarketReportRequestSectionProps) {
  const [open, setOpen] = useState(false);
  const { requestReport, isPending, error } = useRequestMarketReport(marketId);

  const errorMessage = isApiError(error)
    ? error.message
    : error instanceof Error
      ? error.message
      : null;

  function handleConfirm() {
    requestReport();
    setOpen(false);
    onRequested();
  }

  return (
    <div className="flex flex-col items-center gap-6 rounded-xl border border-dashed border-border/80 bg-card/30 p-10 text-center">
      <div className="flex items-center justify-center rounded-full bg-violet-100 p-4 dark:bg-violet-950">
        <BrainCircuit className="size-10 text-violet-600 dark:text-violet-400" />
      </div>
      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-semibold">AI 리포트가 아직 없습니다</h3>
        <p className="max-w-sm text-sm text-muted-foreground">
          이 마켓의 AI 분석 리포트를 생성할 수 있습니다. 생성 시{" "}
          <span className="font-semibold text-foreground">80P</span>가 차감되며,
          마켓이 정산 완료된 이후에만 요청할 수 있습니다.
        </p>
        {errorMessage && (
          <p className="text-sm text-destructive">{errorMessage}</p>
        )}
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger
          render={
            <Button disabled={isPending}>
              {isPending ? "요청 중..." : "AI 리포트 요청"}
            </Button>
          }
        />
        <DialogContent>
          <DialogHeader>
            <DialogTitle>AI 리포트 생성</DialogTitle>
            <DialogDescription>
              AI 리포트 생성 시 <strong>80P</strong>가 차감됩니다.
              계속하시겠습니까?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              취소
            </Button>
            <Button onClick={handleConfirm}>확인</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
