import { createBrowserRouter } from "react-router-dom";
import { AppShell } from "@/app/layout/AppShell";

// Pages
import { HomePage } from "@/pages/home/HomePage";
import { LoginPage } from "@/pages/auth/LoginPage";
import { KakaoCallbackPage } from "@/pages/auth/KakaoCallbackPage";
import { BattleListPage } from "@/pages/battle/BattleListPage";
import { BattleCreatePage } from "@/pages/battle/BattleCreatePage";
import { MarketListPage } from "@/pages/market/MarketListPage";
import { MyPage } from "@/pages/my/MyPage";
import ProfileEditPage from "@/pages/my/ProfileEditPage";
import PointHistoryPage from "@/pages/my/PointHistoryPage";
import VisitCertificationPage from "@/pages/my/VisitCertificationPage";
import MarketReportPage from "@/pages/market/MarketReportPage";
import ReputationDetailPage from "@/pages/reputation/ReputationDetailPage";
import AdminBattleReportPage from "@/pages/admin/battle/AdminBattleReportPage";
import { AdminDashboardPage } from "@/pages/admin/AdminDashboardPage";
import AdminInsightsOverviewPage from "@/pages/admin/insights/AdminInsightsOverviewPage";
import AdminInsightsActivityPage from "@/pages/admin/insights/AdminInsightsActivityPage";
import AdminInsightsRegionMapPage from "@/pages/admin/insights/AdminInsightsRegionMapPage";
import AdminMarketDashboardPage from "@/pages/admin/insights/AdminMarketDashboardPage";
import AdminBattleListPage from "@/pages/admin/battle/AdminBattleListPage";
import AdminBattleDetailPage from "@/pages/admin/battle/AdminBattleDetailPage";
import AdminBattleAnalysisPage from "@/pages/admin/battle/AdminBattleAnalysisPage";
import AdminMarketListPage from "@/pages/admin/market/AdminMarketListPage";
import AdminMarketCreatePage from "@/pages/admin/market/AdminMarketCreatePage";
import AdminMarketDetailPage from "@/pages/admin/market/AdminMarketDetailPage";
import AdminMarketResultPage from "@/pages/admin/market/AdminMarketResultPage";
import AdminMarketProblemListPage from "@/pages/admin/market/AdminMarketProblemListPage";
import { NotFoundPage } from "@/pages/NotFoundPage";

// Route Guards
import ProtectedRoute from "./ProtectedRoute";
import AdminRoute from "./AdminRoute";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      // Public Routes
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "login",
        element: <LoginPage />,
      },
      {
        path: "auth/kakao/callback",
        element: <KakaoCallbackPage />,
      },

      // Battle Routes
      {
        path: "battles",
        element: <BattleListPage />,
      },
      {
        path: "battles/new",
        element: (
          <ProtectedRoute>
            <BattleCreatePage />
          </ProtectedRoute>
        ),
      },
      {
        path: "battles/:battleId",
        lazy: () => import("@/pages/battle/BattleDetailPage"),
      },

      // Market Routes
      {
        path: "markets",
        element: <MarketListPage />,
      },
      {
        path: "markets/:marketId",
        lazy: () => import("@/pages/market/MarketDetailPage"),
      },
      {
        path: "markets/:marketId/report",
        element: (
          <ProtectedRoute>
            <MarketReportPage />
          </ProtectedRoute>
        ),
      },

      // Protected Routes
      {
        path: "my",
        element: (
          <ProtectedRoute>
            <MyPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "my/profile",
        element: (
          <ProtectedRoute>
            <ProfileEditPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "my/points",
        element: (
          <ProtectedRoute>
            <PointHistoryPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "my/visit-certifications",
        element: (
          <ProtectedRoute>
            <VisitCertificationPage />
          </ProtectedRoute>
        ),
      },

      // Reputation Routes
      {
        path: "reputations/:memberId",
        element: <ReputationDetailPage />,
      },

      // Admin Routes
      {
        path: "admin",
        element: (
          <AdminRoute>
            <AdminDashboardPage />
          </AdminRoute>
        ),
      },
      {
        path: "admin/battles",
        element: (
          <AdminRoute>
            <AdminBattleListPage />
          </AdminRoute>
        ),
      },
      {
        path: "admin/battles/:battleId",
        element: (
          <AdminRoute>
            <AdminBattleDetailPage />
          </AdminRoute>
        ),
      },
      {
        path: "admin/battles/:battleId/analysis",
        element: (
          <AdminRoute>
            <AdminBattleAnalysisPage />
          </AdminRoute>
        ),
      },
      {
        path: "admin/battles/:battleId/report",
        element: (
          <AdminRoute>
            <AdminBattleReportPage />
          </AdminRoute>
        ),
      },
      {
        path: "admin/markets",
        element: (
          <AdminRoute>
            <AdminMarketListPage />
          </AdminRoute>
        ),
      },
      {
        path: "admin/markets/new",
        element: (
          <AdminRoute>
            <AdminMarketCreatePage />
          </AdminRoute>
        ),
      },
      {
        path: "admin/markets/problems",
        element: (
          <AdminRoute>
            <AdminMarketProblemListPage />
          </AdminRoute>
        ),
      },
      {
        path: "admin/markets/:marketId",
        element: (
          <AdminRoute>
            <AdminMarketDetailPage />
          </AdminRoute>
        ),
      },
      {
        path: "admin/markets/:marketId/result",
        element: (
          <AdminRoute>
            <AdminMarketResultPage />
          </AdminRoute>
        ),
      },
      {
        path: "admin/markets/:marketId/dashboard",
        element: (
          <AdminRoute>
            <AdminMarketDashboardPage />
          </AdminRoute>
        ),
      },
      {
        path: "admin/insights/overview",
        element: (
          <AdminRoute>
            <AdminInsightsOverviewPage />
          </AdminRoute>
        ),
      },
      {
        path: "admin/insights/activity",
        element: (
          <AdminRoute>
            <AdminInsightsActivityPage />
          </AdminRoute>
        ),
      },
      {
        path: "admin/insights/regions/price-map",
        element: (
          <AdminRoute>
            <AdminInsightsRegionMapPage />
          </AdminRoute>
        ),
      },

      // 404 Page
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
]);
