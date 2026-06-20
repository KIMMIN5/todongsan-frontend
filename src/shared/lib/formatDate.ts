export function formatDate(value: string | null | undefined): string {
  if (!value) return "-";

  const date = new Date(value);
  if (isNaN(date.getTime())) {
    return value; // fallback for invalid date
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}.${month}.${day}`;
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return "-";

  const date = new Date(value);
  if (isNaN(date.getTime())) {
    return value; // fallback for invalid date
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}.${month}.${day} ${hours}:${minutes}`;
}

/**
 * 기준 시각(now) 대비 상대 날짜를 사람이 읽기 쉬운 한국어 문구로 변환합니다.
 * 예: "32일 후", "오늘", "3일 전"
 * 날짜 단위(0시 기준)로 비교하므로 같은 날이면 "오늘"을 반환합니다.
 */
export function formatRelativeDays(
  value: string | null | undefined,
  now: Date = new Date(),
): string {
  if (!value) return "-";

  const target = new Date(value);
  if (isNaN(target.getTime())) return value;

  const startOfDay = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

  const diffMs = startOfDay(target) - startOfDay(now);
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "오늘";
  if (diffDays > 0) return `${diffDays}일 후`;
  return `${Math.abs(diffDays)}일 전`;
}

/**
 * 마감 시각을 D-day 문구로 변환합니다. (날짜 단위, 0시 기준)
 * 예: 지난 경우 "마감", 당일 "오늘 마감", 그 외 "마감 D-N"
 */
export function formatDday(
  value: string | null | undefined,
  now: Date = new Date(),
): string {
  if (!value) return "-";

  const target = new Date(value);
  if (isNaN(target.getTime())) return value;

  const startOfDay = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

  const diffDays = Math.round(
    (startOfDay(target) - startOfDay(now)) / (1000 * 60 * 60 * 24),
  );

  if (diffDays < 0) return "마감";
  if (diffDays === 0) return "오늘 마감";
  return `마감 D-${diffDays}`;
}
