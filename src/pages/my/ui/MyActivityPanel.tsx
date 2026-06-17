import { MyMarketPredictionListSection } from "@/features/my-market-predictions/ui/MyMarketPredictionListSection";

/**
 * 마이페이지 활동 섹션 조립 책임을 담당한다.
 *
 * 현재는 내 마켓 예측 목록만 보여준다.
 * 추후 Battle 참여 목록이 추가되면 이 컴포넌트에서 Tabs 구조로 확장한다.
 */
export function MyActivityPanel() {
  return (
    <section>
      <MyMarketPredictionListSection />
    </section>
  );
}
