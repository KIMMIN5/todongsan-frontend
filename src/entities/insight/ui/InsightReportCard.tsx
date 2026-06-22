import { formatDateTime } from "@/shared/lib/formatDate";
import { formatPointAmount } from "@/shared/lib/formatDecimal";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";

import type { InsightReport } from "../model/insight.types";
import { InsightReportStatusBadge } from "./InsightReportStatusBadge";

type InsightReportCardProps = {
  report: InsightReport;
};

export function InsightReportCard({ report }: InsightReportCardProps) {
  return (
    <Card>
      <CardHeader className="gap-3">
        <div className="flex items-center justify-between gap-3">
          <InsightReportStatusBadge status={report.status} />
          {report.pointDeducted && (
            <span className="text-xs text-muted-foreground">
              {formatPointAmount(report.pointDeducted)} 차감
            </span>
          )}
        </div>
        {report.title && (
          <CardTitle className="text-base font-semibold">
            {report.title}
          </CardTitle>
        )}
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {report.summary && (
          <p className="text-sm text-muted-foreground">{report.summary}</p>
        )}
        <div className="flex flex-col gap-1 border-t border-border pt-3">
          {report.generatedAt && (
            <InfoRow
              label="생성 완료"
              value={formatDateTime(report.generatedAt)}
            />
          )}
          <InfoRow
            label="요청 일시"
            value={formatDateTime(report.requestedAt)}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}
