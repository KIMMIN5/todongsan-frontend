import { useState } from "react";
import { toast } from "sonner";

import { isApiError } from "@/shared/api/apiError";
import { useCreateVisitCertificationMutation } from "@/entities/reputation/model/useCreateVisitCertificationMutation";
import { useMyVisitCertificationsQuery } from "@/entities/reputation/model/useMyVisitCertificationsQuery";
import { VisitCertificationListItem } from "@/entities/reputation/ui/VisitCertificationListItem";
import { SIDO_LIST, SIGUNGU_MAP } from "@/shared/constants/regions";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { EmptyState } from "@/shared/ui/empty-state";
import { ErrorState } from "@/shared/ui/error-state";
import { Input } from "@/shared/ui/input";
import { PageContainer } from "@/shared/ui/page-container";
import { PageHeader } from "@/shared/ui/page-header";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { Skeleton } from "@/shared/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";

type CertMethod = "GPS" | "COMMENT";

export default function VisitCertificationPage() {
  return (
    <PageContainer>
      <PageHeader
        title="방문 인증"
        description="지역 방문을 인증하여 신뢰도를 쌓으세요."
      />
      <Tabs defaultValue="certify">
        <TabsList>
          <TabsTrigger value="certify">인증하기</TabsTrigger>
          <TabsTrigger value="history">인증 내역</TabsTrigger>
        </TabsList>

        <TabsContent value="certify">
          <CertifyTab />
        </TabsContent>

        <TabsContent value="history">
          <HistoryTab />
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}

function CertifyTab() {
  const [method, setMethod] = useState<CertMethod>("GPS");

  return (
    <div className="flex flex-col gap-4 pt-4">
      <Tabs value={method} onValueChange={(v) => setMethod(v as CertMethod)}>
        <TabsList>
          <TabsTrigger value="GPS">GPS 인증</TabsTrigger>
          <TabsTrigger value="COMMENT">댓글 인증</TabsTrigger>
        </TabsList>

        <TabsContent value="GPS">
          <GpsCertForm />
        </TabsContent>

        <TabsContent value="COMMENT">
          <CommentCertForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function GpsCertForm() {
  const [sido, setSido] = useState("");
  const [sigu, setSigu] = useState("");
  const [gpsStatus, setGpsStatus] = useState<"idle" | "loading" | "ready">("idle");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [certError, setCertError] = useState<string | null>(null);

  const mutation = useCreateVisitCertificationMutation();

  const sigunguOptions = sido ? (SIGUNGU_MAP[sido] ?? []) : [];

  function handleGetLocation() {
    if (!navigator.geolocation) {
      toast.error("이 기기에서는 GPS를 사용할 수 없습니다.");
      return;
    }
    setGpsStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGpsStatus("ready");
      },
      () => {
        setGpsStatus("idle");
        toast.error("위치 정보를 가져올 수 없습니다. 위치 권한을 허용해 주세요.");
      },
    );
  }

  function handleSubmit() {
    if (!coords || !sido || !sigu) return;
    setCertError(null);

    mutation.mutate(
      { sido, sigu, latitude: coords.lat, longitude: coords.lng },
      {
        onSuccess: () => {
          toast.success("방문 인증이 완료되었습니다.");
          setSido("");
          setSigu("");
          setCoords(null);
          setGpsStatus("idle");
        },
        onError: (error) => {
          if (isApiError(error)) {
            if (error.errorCode === "VISIT_CERT_COOLDOWN") {
              setCertError(error.message ?? "인증 대기 기간 중입니다. 잠시 후 다시 시도해 주세요.");
            } else if (error.errorCode === "VISIT_CERT_OUT_OF_RANGE") {
              setCertError("현재 위치가 인증 가능 반경을 벗어났습니다.");
            } else {
              setCertError(error.message ?? "인증 중 오류가 발생했습니다.");
            }
          } else {
            setCertError("인증 중 오류가 발생했습니다.");
          }
        },
      },
    );
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-base">GPS 방문 인증</CardTitle>
        <CardDescription>현재 위치를 사용하여 지역 방문을 인증합니다.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Button
          variant="outline"
          onClick={handleGetLocation}
          disabled={gpsStatus === "loading"}
        >
          {gpsStatus === "loading"
            ? "위치 가져오는 중..."
            : gpsStatus === "ready"
              ? `위치 확인됨 (${coords?.lat.toFixed(4)}, ${coords?.lng.toFixed(4)})`
              : "현재 위치 가져오기"}
        </Button>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-muted-foreground">시/도</label>
            <Select
              value={sido}
              onValueChange={(v) => {
                setSido(v);
                setSigu("");
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="시/도 선택" />
              </SelectTrigger>
              <SelectContent>
                {SIDO_LIST.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-muted-foreground">시/군/구</label>
            <Select
              value={sigu}
              onValueChange={setSigu}
              disabled={!sido}
            >
              <SelectTrigger>
                <SelectValue placeholder="시/군/구 선택" />
              </SelectTrigger>
              <SelectContent>
                {sigunguOptions.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {certError && (
          <p className="text-sm text-destructive">{certError}</p>
        )}

        <Button
          onClick={handleSubmit}
          disabled={gpsStatus !== "ready" || !sido || !sigu || mutation.isPending}
        >
          {mutation.isPending ? "인증 중..." : "GPS 인증 완료"}
        </Button>
      </CardContent>
    </Card>
  );
}

function CommentCertForm() {
  const [sido, setSido] = useState("");
  const [sigu, setSigu] = useState("");
  const [commentId, setCommentId] = useState("");
  const [certError, setCertError] = useState<string | null>(null);

  const mutation = useCreateVisitCertificationMutation();

  const sigunguOptions = sido ? (SIGUNGU_MAP[sido] ?? []) : [];
  const parsedCommentId = Number(commentId);
  const isValidCommentId = commentId.length > 0 && Number.isInteger(parsedCommentId) && parsedCommentId > 0;

  function handleSubmit() {
    if (!sido || !sigu || !isValidCommentId) return;
    setCertError(null);

    mutation.mutate(
      { sido, sigu, commentId: parsedCommentId },
      {
        onSuccess: () => {
          toast.success("방문 인증이 완료되었습니다.");
          setSido("");
          setSigu("");
          setCommentId("");
        },
        onError: (error) => {
          if (isApiError(error)) {
            if (error.errorCode === "VISIT_CERT_COOLDOWN") {
              setCertError(error.message ?? "인증 대기 기간 중입니다. 잠시 후 다시 시도해 주세요.");
            } else if (error.errorCode === "COMMENT_NOT_FOUND") {
              setCertError("댓글 ID를 찾을 수 없습니다. 다시 확인해 주세요.");
            } else {
              setCertError(error.message ?? "인증 중 오류가 발생했습니다.");
            }
          } else {
            setCertError("인증 중 오류가 발생했습니다.");
          }
        },
      },
    );
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-base">댓글 인증</CardTitle>
        <CardDescription>
          해당 지역 마켓에 작성한 댓글 ID로 방문을 인증합니다.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-muted-foreground">댓글 ID</label>
          <Input
            type="number"
            placeholder="댓글 ID를 입력하세요"
            value={commentId}
            onChange={(e) => setCommentId(e.target.value)}
            min={1}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-muted-foreground">시/도</label>
            <Select
              value={sido}
              onValueChange={(v) => {
                setSido(v);
                setSigu("");
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="시/도 선택" />
              </SelectTrigger>
              <SelectContent>
                {SIDO_LIST.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-muted-foreground">시/군/구</label>
            <Select
              value={sigu}
              onValueChange={setSigu}
              disabled={!sido}
            >
              <SelectTrigger>
                <SelectValue placeholder="시/군/구 선택" />
              </SelectTrigger>
              <SelectContent>
                {sigunguOptions.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {certError && (
          <p className="text-sm text-destructive">{certError}</p>
        )}

        <Button
          onClick={handleSubmit}
          disabled={!sido || !sigu || !isValidCommentId || mutation.isPending}
        >
          {mutation.isPending ? "인증 중..." : "댓글 인증 완료"}
        </Button>
      </CardContent>
    </Card>
  );
}

function HistoryTab() {
  const { data: certs, isLoading, isError, refetch } = useMyVisitCertificationsQuery();

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3 pt-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="pt-4">
        <ErrorState
          message="인증 내역을 불러오는 중 문제가 발생했습니다."
          action={<Button onClick={() => refetch()}>다시 시도</Button>}
        />
      </div>
    );
  }

  if (!certs || certs.length === 0) {
    return (
      <div className="pt-4">
        <EmptyState
          title="인증 내역이 없습니다"
          description="방문 인증을 완료하면 여기에 내역이 표시됩니다."
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 pt-4">
      {certs.map((cert) => (
        <VisitCertificationListItem key={cert.certificationId} cert={cert} />
      ))}
    </div>
  );
}
