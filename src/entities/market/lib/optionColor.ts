/**
 * 옵션 색상 단일 소스(Single Source of Truth).
 *
 * 핵심 원칙: 색(hue)은 옵션의 "고정 정체성"이다.
 * - 색은 optionId 오름차순(= 옵션 생성 순서)으로 팔레트 index를 배정한다.
 * - 절대 currentPrice(가격)순으로 배정하지 않는다. (가격순이면 순위가 바뀔 때 색이 바뀜)
 * - 우세/약세는 색이 아니라 막대 길이 + 1위 강조로 표현한다.
 *
 * 차트/최신가/버튼 등 모든 옵션 시각 요소가 이 파일을 공유한다.
 */

export type OptionColor = {
  /** 막대/점/라인 색 */
  base: string;
  /** colored 배경 위 텍스트/강조 색 */
  darker: string;
};

/** 고정 팔레트 (이 순서 그대로). 최대 6색, 초과 시 index % 6으로 순환. */
export const OPTION_COLOR_PALETTE: readonly OptionColor[] = [
  { base: "#378ADD", darker: "#185FA5" }, // 0 블루
  { base: "#BA7517", darker: "#854F0B" }, // 1 앰버
  { base: "#1D9E75", darker: "#0F6E56" }, // 2 틸
  { base: "#7F77DD", darker: "#534AB7" }, // 3 퍼플
  { base: "#D4537E", darker: "#993556" }, // 4 핑크
  { base: "#888780", darker: "#5F5E5A" }, // 5 그레이
] as const;

/** 색 index로 단일 색을 조회한다. (음수/초과 index도 안전하게 순환) */
export function getOptionColor(colorIndex: number): OptionColor {
  const size = OPTION_COLOR_PALETTE.length;
  const normalized = ((colorIndex % size) + size) % size;
  return OPTION_COLOR_PALETTE[normalized];
}

/**
 * optionId 배열을 받아 각 optionId에 고정 색을 매핑한다.
 * 반드시 optionId 오름차순 기준으로 index를 배정한다(응답 순서 흔들림 방지).
 */
export function getOptionColorMap(
  optionIds: number[],
): Record<number, OptionColor & { index: number }> {
  const sortedUniqueIds = [...new Set(optionIds)].sort((a, b) => a - b);

  const map: Record<number, OptionColor & { index: number }> = {};
  sortedUniqueIds.forEach((optionId, index) => {
    const color = getOptionColor(index);
    map[optionId] = { base: color.base, darker: color.darker, index };
  });
  return map;
}
