import type { ApiResponse } from "@/shared/api/apiResponse";
import { httpClient } from "@/shared/api/httpClient";

import type {
  CreateVisitCertCommentRequest,
  CreateVisitCertGPSRequest,
  Reputation,
  UpdateResidenceRequest,
  VisitCertification,
} from "../model/reputation.types";

export async function getMyReputation(): Promise<Reputation> {
  const response = await httpClient.get<ApiResponse<Reputation>>(
    "/api/v1/reputations/me",
  );

  return response.data.data;
}

export async function getReputationByMemberId(
  memberId: number,
): Promise<Reputation> {
  const response = await httpClient.get<ApiResponse<Reputation>>(
    `/api/v1/reputations/${memberId}`,
  );

  return response.data.data;
}

export async function createVisitCertification(
  request: CreateVisitCertGPSRequest | CreateVisitCertCommentRequest,
): Promise<VisitCertification> {
  const response = await httpClient.post<ApiResponse<VisitCertification>>(
    "/api/v1/reputations/visit-certifications",
    request,
  );

  return response.data.data;
}

export async function getMyVisitCertifications(): Promise<VisitCertification[]> {
  const response = await httpClient.get<ApiResponse<VisitCertification[]>>(
    "/api/v1/reputations/visit-certifications/mine",
  );

  return response.data.data;
}

export async function updateResidence(
  request: UpdateResidenceRequest,
): Promise<Reputation> {
  const response = await httpClient.put<ApiResponse<Reputation>>(
    "/api/v1/reputations/me/residence",
    request,
  );

  return response.data.data;
}
