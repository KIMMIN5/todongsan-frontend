import type { ApiError } from "@/shared/api/apiError";

const ADMIN_MARKET_ERROR_MESSAGES: Record<string, string> = {
  MARKET_OPTION_NOT_FOUND: "선택한 정답이 유효하지 않습니다.",
  MARKET_WINNING_OPTION_NOT_FOUND: "입력한 값에 매칭되는 구간이 없습니다.",
  MARKET_INVALID_SETTLEMENT_DATA:
    "입력한 값이 2개 이상의 구간에 매칭되거나 정산 데이터가 올바르지 않습니다.",
  FORBIDDEN: "관리자 권한이 없습니다.",
};

/** MARKET_INVALID_STATUS는 서버가 내려준 구체적 사유 메시지를 그대로 노출한다. */
export function getAdminMarketErrorMessage(error: ApiError): string {
  if (error.errorCode === "MARKET_INVALID_STATUS") {
    return error.message || "현재 상태에서는 처리할 수 없습니다.";
  }

  return ADMIN_MARKET_ERROR_MESSAGES[error.errorCode] ?? error.message;
}
