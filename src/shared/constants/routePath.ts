export const ROUTE_PATH = {
  HOME: "/",
  LOGIN: "/login",
  KAKAO_CALLBACK: "/auth/kakao/callback",

  BATTLES: "/battles",
  BATTLE_CREATE: "/battles/new",
  BATTLE_DETAIL: "/battles/:battleId",

  MARKETS: "/markets",
  MARKET_DETAIL: "/markets/:marketId",
  MARKET_REPORT: "/markets/:marketId/report",

  MY: "/my",
  MY_PROFILE: "/my/profile",
  MY_POINTS: "/my/points",
  MY_VISIT_CERTIFICATIONS: "/my/visit-certifications",

  REPUTATION_DETAIL: "/reputations/:memberId",

  ADMIN: "/admin",
  ADMIN_MARKETS: "/admin/markets",
  ADMIN_MARKET_CREATE: "/admin/markets/new",
  ADMIN_MARKET_DETAIL: "/admin/markets/:marketId",
  ADMIN_MARKET_RESULT: "/admin/markets/:marketId/result",

  ADMIN_BATTLES: "/admin/battles",
  ADMIN_BATTLE_DETAIL: "/admin/battles/:battleId",
  ADMIN_BATTLE_ANALYSIS: "/admin/battles/:battleId/analysis",
  ADMIN_BATTLE_REPORT: "/admin/battles/:battleId/report",

  // Admin Insights
  ADMIN_INSIGHTS_OVERVIEW: "/admin/insights/overview",
  ADMIN_INSIGHTS_ACTIVITY: "/admin/insights/activity",
  ADMIN_INSIGHTS_REGION_MAP: "/admin/insights/regions/price-map",
  ADMIN_MARKET_DASHBOARD: "/admin/markets/:marketId/dashboard",
} as const;
