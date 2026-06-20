import { formatDateTime } from "@/shared/lib/formatDate";
import { Badge } from "@/shared/ui/badge";

import type { VisitCertification } from "../model/reputation.types";

type VisitCertificationListItemProps = {
  cert: VisitCertification;
};

export function VisitCertificationListItem({
  cert,
}: VisitCertificationListItemProps) {
  const region = `${cert.sido} ${cert.sigu}`;

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="font-medium text-foreground">{region}</span>
        <Badge variant={cert.method === "GPS" ? "info" : "neutral"}>
          {cert.method === "GPS" ? "GPS 인증" : "댓글 인증"}
        </Badge>
      </div>
      <div className="flex flex-col gap-1 text-xs text-muted-foreground">
        <div className="flex justify-between gap-3">
          <span>최근 인증</span>
          <span>{formatDateTime(cert.lastCertifiedAt)}</span>
        </div>
        <div className="flex justify-between gap-3">
          <span>다음 인증 가능</span>
          <span>{formatDateTime(cert.nextAvailableDate)}</span>
        </div>
      </div>
    </div>
  );
}
