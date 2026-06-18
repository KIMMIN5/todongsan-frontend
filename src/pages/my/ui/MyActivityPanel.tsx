import { MyMarketPredictionListSection } from "@/features/my-market-predictions/ui/MyMarketPredictionListSection";
import { MyBattleParticipationListSection } from "@/features/my-battle-participations/ui/MyBattleParticipationListSection";
import { MyCreatedBattleListSection } from "@/features/my-created-battles/ui/MyCreatedBattleListSection";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";

/**
 * 마이페이지 활동 섹션 조립 책임을 담당한다.
 *
 * 예측 마켓 / 참여한 배틀 / 내가 만든 배틀을 탭으로 분리해 보여준다.
 * 각 탭의 목록 구현은 해당 feature가 담당하고, 이 컴포넌트는 조립만 한다.
 */
export function MyActivityPanel() {
  return (
    <section>
      <Tabs defaultValue="market">
        <TabsList>
          <TabsTrigger value="market">예측 마켓</TabsTrigger>
          <TabsTrigger value="battle-participated">참여한 배틀</TabsTrigger>
          <TabsTrigger value="battle-created">내가 만든 배틀</TabsTrigger>
        </TabsList>

        <TabsContent value="market" className="pt-4">
          <MyMarketPredictionListSection />
        </TabsContent>

        <TabsContent value="battle-participated" className="pt-4">
          <MyBattleParticipationListSection />
        </TabsContent>

        <TabsContent value="battle-created" className="pt-4">
          <MyCreatedBattleListSection />
        </TabsContent>
      </Tabs>
    </section>
  );
}
