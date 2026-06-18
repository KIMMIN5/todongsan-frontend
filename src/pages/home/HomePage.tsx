import { Link } from "react-router-dom";
import { ROUTE_PATH } from "@/shared/constants/routePath";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { buttonVariants } from "@/shared/ui/button";
import { PageContainer } from "@/shared/ui/page-container";
import { SectionTitle } from "@/shared/ui/section-title";
import { cn } from "@/shared/lib/utils";

// Mock data for display
const popularMarkets = [
  {
    id: "m-1",
    title: "이번 주 대구 수성구 아파트 매매가 상승률은 0.3% 이상일까요?",
    category: "대구 · 매매가",
    yesChance: 58,
    noChance: 42,
    volume: "12,450P",
    endTime: "2026-06-15",
  },
  {
    id: "m-2",
    title: "서울 강남구 전세가 지수는 다음 주 상승할까요?",
    category: "서울 · 전세가",
    yesChance: 71,
    noChance: 29,
    volume: "28,900P",
    endTime: "2026-06-18",
  },
  {
    id: "m-3",
    title: "부산 해운대구 거래량은 전월 대비 증가할까요?",
    category: "부산 · 거래량",
    yesChance: 45,
    noChance: 55,
    volume: "8,200P",
    endTime: "2026-06-20",
  },
];

const trendingBattles = [
  {
    id: "b-1",
    title: "실거주로 더 선호하는 단지는?",
    optionA: "마포 래미안 푸르지오",
    optionB: "송파 헬리오시티",
    votes: 342,
    comments: 48,
  },
  {
    id: "b-2",
    title: "역세권 vs 학군, 더 중요한 조건은?",
    optionA: "초역세권 (도보 3분)",
    optionB: "명문 학군지 (도보 15분)",
    votes: 512,
    comments: 89,
  },
  {
    id: "b-3",
    title: "신축 아파트 vs 구축 대단지, 당신의 선택은?",
    optionA: "신축 준식형 (24평)",
    optionB: "구축 대단지 리모델링 (34평)",
    votes: 289,
    comments: 31,
  },
];

export function HomePage() {
  return (
    <PageContainer>
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-800 text-white shadow-md">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0c_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0c_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="relative mx-auto px-6 py-12 sm:px-12 sm:py-16 md:py-20 lg:px-16 max-w-3xl space-y-6 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-200 backdrop-blur-md">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            실시간 부동산 이슈 분석 플랫폼
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl leading-tight">
            동네 이슈를 예측하고,<br />
            아파트 선호를 투표해보세요
          </h1>
          <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed font-light">
            토동산은 지역 부동산 이슈를 예측 시장과 커뮤니티 투표로 확인하는 서비스입니다.
            포인트를 베팅하여 예측의 정확도를 시험하고 다른 사용자와의 의견을 겨뤄보세요.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              to={ROUTE_PATH.MARKETS}
              className={cn(
                buttonVariants({ size: "lg" }),
                "bg-white text-emerald-800 hover:bg-emerald-50 font-bold border-none transition-transform active:scale-95 shadow"
              )}
            >
              마켓 둘러보기
            </Link>
            <Link
              to={ROUTE_PATH.BATTLES}
              className={cn(
                buttonVariants({ size: "lg" }),
                "bg-white text-emerald-800 hover:bg-emerald-50 font-bold border-none transition-transform active:scale-95 shadow"
              )}
            >
              배틀 참여하기
            </Link>
          </div>
        </div>
      </section>

      {/* Popular Markets Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <SectionTitle
            title="인기 예측 마켓"
            description="현재 가장 활발하게 베팅이 이루어지고 있는 이슈들입니다."
          />
          <Link
            to={ROUTE_PATH.MARKETS}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline"
          >
            전체 보기 &rarr;
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {popularMarkets.map((market) => (
            <Card key={market.id} className="rounded-2xl border-slate-200 bg-white hover:shadow-md transition-shadow flex flex-col justify-between">
              <CardHeader className="space-y-1.5 pb-4">
                <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider bg-emerald-50 self-start px-2 py-0.5 rounded">
                  {market.category}
                </span>
                <CardTitle className="text-sm font-semibold leading-snug text-slate-900 group-hover:text-emerald-700 line-clamp-2">
                  {market.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                {/* Bet Odds buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <button className="flex flex-col items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50/40 p-2 hover:bg-emerald-50 transition-colors">
                    <span className="text-[10px] font-medium text-slate-500">그렇다 (Yes)</span>
                    <span className="text-sm font-bold text-emerald-700">{market.yesChance}%</span>
                  </button>
                  <button className="flex flex-col items-center justify-center rounded-xl border border-slate-100 bg-slate-50/50 p-2 hover:bg-slate-50 transition-colors">
                    <span className="text-[10px] font-medium text-slate-500">아니다 (No)</span>
                    <span className="text-sm font-bold text-slate-700">{market.noChance}%</span>
                  </button>
                </div>
                {/* Stats */}
                <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-3">
                  <span>거래량: <strong className="text-slate-700 font-semibold">{market.volume}</strong></span>
                  <span>마감: {market.endTime}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Trending Battles Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <SectionTitle
            title="실시간 뜨거운 배틀"
            description="더 매력적인 부동산 입지와 주거 조건을 선택해주세요."
          />
          <Link
            to={ROUTE_PATH.BATTLES}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline"
          >
            전체 보기 &rarr;
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {trendingBattles.map((battle) => (
            <Card key={battle.id} className="rounded-2xl border-slate-200 bg-white hover:shadow-md transition-shadow flex flex-col justify-between">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-slate-900 line-clamp-1">
                  {battle.title}
                </CardTitle>
                <CardDescription className="text-xs">
                  현재 {battle.votes}명이 투표에 동참했습니다.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                <div className="space-y-2">
                  <div className="relative flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium hover:bg-slate-50 cursor-pointer transition-colors bg-white">
                    <span className="text-slate-800 font-semibold truncate max-w-[80%]">{battle.optionA}</span>
                    <span className="text-emerald-600 font-bold">A</span>
                  </div>
                  <div className="relative flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium hover:bg-slate-50 cursor-pointer transition-colors bg-white">
                    <span className="text-slate-800 font-semibold truncate max-w-[80%]">{battle.optionB}</span>
                    <span className="text-emerald-600 font-bold">B</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-slate-400 border-t border-slate-100 pt-3">
                  <span>투표 {battle.votes}</span>
                  <span>댓글 {battle.comments}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </PageContainer>
  );
}
