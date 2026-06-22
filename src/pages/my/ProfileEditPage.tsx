import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { PageContainer } from "@/shared/ui/page-container";
import { PageHeader } from "@/shared/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { Skeleton } from "@/shared/ui/skeleton";
import { ErrorState } from "@/shared/ui/error-state";
import { useMyProfileQuery, useUpdateProfileMutation } from "@/entities/member/model/member.queries";
import { useMyReputationQuery } from "@/entities/reputation/model/useMyReputationQuery";
import { useUpdateResidenceMutation } from "@/entities/reputation/model/useUpdateResidenceMutation";
import { useAuthStore } from "@/entities/auth/model/auth.store";
import { SIDO_LIST, SIGUNGU_MAP } from "@/shared/constants/regions";
import { formatKoreanMonthDay } from "@/shared/lib/formatDate";
import { toApiError } from "@/shared/api/apiError";
import { ROUTE_PATH } from "@/shared/constants/routePath";

const RESIDENCE_CHANGE_COOLDOWN_DAYS = 30;

const profileSchema = z.object({
  nickname: z.string().min(1, "닉네임을 입력해주세요.").max(50, "닉네임은 50자 이하로 입력해주세요."),
  residenceSido: z.string().optional(),
  residenceSigu: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfileEditPage() {
  const navigate = useNavigate();
  const profileQuery = useMyProfileQuery();
  const updateMutation = useUpdateProfileMutation();
  const profile = profileQuery.data;

  const { control, register, handleSubmit, watch, setValue, reset, formState: { errors } } =
    useForm<ProfileFormValues>({
      resolver: zodResolver(profileSchema),
      defaultValues: { nickname: "", residenceSido: "", residenceSigu: "" },
    });

  useEffect(() => {
    if (profile) {
      reset({
        nickname: profile.nickname ?? "",
        residenceSido: profile.residenceSido ?? "",
        residenceSigu: profile.residenceSigu ?? "",
      });
    }
  }, [profile, reset]);

  const selectedSido = watch("residenceSido");
  const sigunguOptions = selectedSido ? SIGUNGU_MAP[selectedSido] ?? [] : [];

  const cooldown = useMemo(() => {
    if (!profile?.residenceChangedAt) return null;

    const changedAt = new Date(profile.residenceChangedAt);
    if (isNaN(changedAt.getTime())) return null;

    const nextEligibleAt = new Date(changedAt);
    nextEligibleAt.setDate(nextEligibleAt.getDate() + RESIDENCE_CHANGE_COOLDOWN_DAYS);

    if (new Date() < nextEligibleAt) {
      return { nextEligibleAt: nextEligibleAt.toISOString() };
    }
    return null;
  }, [profile?.residenceChangedAt]);

  const isResidenceLocked = !!cooldown;

  const onSubmit = (values: ProfileFormValues) => {
    if (!profile) return;

    const payload: { nickname?: string; residenceSido?: string; residenceSigu?: string } = {};

    if (values.nickname !== profile.nickname) {
      payload.nickname = values.nickname;
    }

    if (!isResidenceLocked) {
      if (values.residenceSido && values.residenceSido !== profile.residenceSido) {
        payload.residenceSido = values.residenceSido;
      }
      if (values.residenceSigu && values.residenceSigu !== profile.residenceSigu) {
        payload.residenceSigu = values.residenceSigu;
      }
    }

    if (Object.keys(payload).length === 0) {
      toast.info("변경된 내용이 없습니다.");
      return;
    }

    updateMutation.mutate(payload, {
      onSuccess: (data) => {
        if (data.nickname) {
          useAuthStore.getState().updateProfile(data.nickname);
        }
        toast.success("내 정보가 수정되었습니다.");
        navigate(ROUTE_PATH.MY);
      },
      onError: (error) => {
        const apiError = toApiError(error);
        if (apiError.errorCode === "MEMBER_NICKNAME_DUPLICATE") {
          toast.error("이미 사용 중인 닉네임입니다.");
        } else if (apiError.errorCode === "MEMBER_RESIDENCE_CHANGE_COOLDOWN") {
          toast.error("거주지는 30일마다 한 번만 변경할 수 있습니다.");
        } else {
          toast.error(apiError.message);
        }
      },
    });
  };

  if (profileQuery.isError) {
    return (
      <PageContainer>
        <PageHeader title="내 정보 수정" />
        <ErrorState />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader title="내 정보 수정" description="닉네임, 거주지 프로필과 신뢰도 거주지 선언을 관리하세요." />

      <div className="mx-auto flex w-full max-w-lg flex-col gap-6">
      <Card className="rounded-2xl border-slate-200 bg-white">
        <CardHeader>
          <CardTitle className="text-base font-bold">기본 정보</CardTitle>
          <CardDescription className="text-xs">
            거주지는 변경 후 {RESIDENCE_CHANGE_COOLDOWN_DAYS}일 동안 다시 변경할 수 없습니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {profileQuery.isPending ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-1.5">
                <label htmlFor="nickname" className="text-xs font-bold text-slate-700">
                  닉네임
                </label>
                <Input id="nickname" {...register("nickname")} placeholder="닉네임을 입력하세요" />
                {errors.nickname && (
                  <p className="text-xs text-destructive">{errors.nickname.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">시/도</label>
                  <Controller
                    control={control}
                    name="residenceSido"
                    render={({ field }) => (
                      <Select
                        value={field.value ?? null}
                        onValueChange={(value) => {
                          field.onChange(value);
                          setValue("residenceSigu", "");
                        }}
                        disabled={isResidenceLocked}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="시/도 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          {SIDO_LIST.map((sido) => (
                            <SelectItem key={sido} value={sido}>
                              {sido}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">시/군/구</label>
                  <Controller
                    control={control}
                    name="residenceSigu"
                    render={({ field }) => (
                      <Select
                        value={field.value ?? null}
                        onValueChange={field.onChange}
                        disabled={isResidenceLocked || !selectedSido}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="시/군/구 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          {sigunguOptions.map((sigu) => (
                            <SelectItem key={sigu} value={sigu}>
                              {sigu}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>

              {isResidenceLocked && cooldown && (
                <p className="text-xs text-slate-500">
                  거주지는 {formatKoreanMonthDay(cooldown.nextEligibleAt)} 이후에 다시 변경할 수 있습니다.
                </p>
              )}

              <Button type="submit" className="w-full" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "저장 중..." : "저장하기"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      <ResidenceDeclarationCard />
      </div>
    </PageContainer>
  );
}

const REPUTATION_COOLDOWN_DAYS = 30;

function ResidenceDeclarationCard() {
  const reputationQuery = useMyReputationQuery();
  const updateMutation = useUpdateResidenceMutation();
  const reputation = reputationQuery.data;

  const [sido, setSido] = useState("");
  const [sigu, setSigu] = useState("");

  useEffect(() => {
    if (reputation) {
      setSido(reputation.residenceSido ?? "");
      setSigu(reputation.residenceSigu ?? "");
    }
  }, [reputation]);

  const cooldown = useMemo(() => {
    if (!reputation?.residenceChangedAt) return null;
    const changedAt = new Date(reputation.residenceChangedAt);
    if (isNaN(changedAt.getTime())) return null;
    const nextEligibleAt = new Date(changedAt);
    nextEligibleAt.setDate(nextEligibleAt.getDate() + REPUTATION_COOLDOWN_DAYS);
    return new Date() < nextEligibleAt ? { nextEligibleAt: nextEligibleAt.toISOString() } : null;
  }, [reputation?.residenceChangedAt]);

  const isLocked = !!cooldown;
  const sigunguOptions = sido ? SIGUNGU_MAP[sido] ?? [] : [];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!sido || !sigu) {
      toast.error("시/도와 시/군/구를 모두 선택해주세요.");
      return;
    }
    updateMutation.mutate(
      { residenceSido: sido, residenceSigu: sigu },
      {
        onSuccess: () => toast.success("거주지역이 선언되었습니다."),
        onError: (error) => {
          const apiError = toApiError(error);
          if (apiError.errorCode === "RESIDENCE_CHANGE_COOLDOWN") {
            const dateStr = cooldown
              ? formatKoreanMonthDay(cooldown.nextEligibleAt)
              : `${REPUTATION_COOLDOWN_DAYS}일 후`;
            toast.error(`${dateStr} 이후 변경 가능합니다.`);
          } else {
            toast.error(apiError.message);
          }
        },
      },
    );
  }

  return (
    <Card className="rounded-2xl border-slate-200 bg-white">
      <CardHeader>
        <CardTitle className="text-base font-bold">거주지역 신뢰도 선언</CardTitle>
        <CardDescription className="text-xs">
          선언한 지역은 AI 분석 및 신뢰도 점수에 반영됩니다.
          변경 후 {REPUTATION_COOLDOWN_DAYS}일 동안 재변경할 수 없습니다.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {reputationQuery.isPending ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">시/도</label>
                <Select
                  value={sido || undefined}
                  onValueChange={(value) => {
                    setSido(value);
                    setSigu("");
                  }}
                  disabled={isLocked}
                >
                  <SelectTrigger className="w-full">
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

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">시/군/구</label>
                <Select
                  value={sigu || undefined}
                  onValueChange={setSigu}
                  disabled={isLocked || !sido}
                >
                  <SelectTrigger className="w-full">
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

            {isLocked && cooldown && (
              <p className="text-xs text-slate-500">
                거주지 신뢰도 선언은 {formatKoreanMonthDay(cooldown.nextEligibleAt)} 이후에 다시 변경할 수 있습니다.
              </p>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isLocked || updateMutation.isPending}
            >
              {updateMutation.isPending ? "저장 중..." : "거주지 선언하기"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
