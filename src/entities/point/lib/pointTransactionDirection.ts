import type { PointTransactionType } from "../model/point.types";

// amount는 항상 양수(절대값)로 내려오므로, 증감 방향은 type prefix로 판단한다.
export function isIncreaseType(type: PointTransactionType): boolean {
  return type.startsWith("EARN") || type.startsWith("SETTLE") || type.startsWith("REFUND");
}
