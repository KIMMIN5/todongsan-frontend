import { createBrowserRouter } from 'react-router-dom';
import { AppShell } from '@/app/layout/AppShell';

// Pages
import { HomePage } from '@/pages/home/HomePage';
import { LoginPage } from '@/pages/auth/LoginPage';
import { KakaoCallbackPage } from '@/pages/auth/KakaoCallbackPage';
import { BattleListPage } from '@/pages/battle/BattleListPage';
import { MarketListPage } from '@/pages/market/MarketListPage';
import { MyPage } from '@/pages/my/MyPage';
import ProfileEditPage from '@/pages/my/ProfileEditPage';
import PointHistoryPage from '@/pages/my/PointHistoryPage';
import VisitCertificationPage from '@/pages/my/VisitCertificationPage';
import MarketReportPage from '@/pages/market/MarketReportPage';
import ReputationDetailPage from '@/pages/reputation/ReputationDetailPage';
import AdminBattleReportPage from '@/pages/admin/battle/AdminBattleReportPage';
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

// Route Guards
import ProtectedRoute from './ProtectedRoute';
import AdminRoute from './AdminRoute';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      // Public Routes
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'auth/kakao/callback',
        element: <KakaoCallbackPage />,
      },

      // Battle Routes
      {
        path: 'battles',
        element: <BattleListPage />,
      },
      {
        path: 'battles/:battleId',
        lazy: () => import('@/pages/battle/BattleDetailPage'),
      },

      // Market Routes
      {
        path: 'markets',
        element: <MarketListPage />,
      },
      {
        path: 'markets/:marketId',
        lazy: () => import('@/pages/market/MarketDetailPage'),
      },
      {
        path: 'markets/:marketId/report',
        element: (
          <ProtectedRoute>
            <MarketReportPage />
          </ProtectedRoute>
        ),
      },

      // Protected Routes
      {
        path: 'my',
        element: (
          <ProtectedRoute>
            <MyPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'my/profile',
        element: (
          <ProtectedRoute>
            <ProfileEditPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'my/points',
        element: (
          <ProtectedRoute>
            <PointHistoryPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'my/visit-certifications',
        element: (
          <ProtectedRoute>
            <VisitCertificationPage />
          </ProtectedRoute>
        ),
      },

      // Reputation Routes
      {
        path: 'reputations/:memberId',
        element: <ReputationDetailPage />,
      },

      // Admin Routes
      {
        path: 'admin',
        element: (
          <AdminRoute>
            <AdminDashboardPage />
          </AdminRoute>
        ),
      },
      {
        path: 'admin/battles',
        element: (
          <AdminRoute>
            <div>AdminBattleListPage</div>
          </AdminRoute>
        ),
      },
      {
        path: 'admin/battles/:battleId',
        element: (
          <AdminRoute>
            <div>AdminBattleDetailPage</div>
          </AdminRoute>
        ),
      },
      {
        path: 'admin/battles/:battleId/analysis',
        element: (
          <AdminRoute>
            <div>AdminBattleAnalysisPage</div>
          </AdminRoute>
        ),
      },
      {
        path: 'admin/battles/:battleId/report',
        element: (
          <AdminRoute>
            <AdminBattleReportPage />
          </AdminRoute>
        ),
      },
      {
        path: 'admin/markets',
        element: (
          <AdminRoute>
            <div>AdminMarketListPage</div>
          </AdminRoute>
        ),
      },
      {
        path: 'admin/markets/new',
        element: (
          <AdminRoute>
            <div>AdminMarketCreatePage</div>
          </AdminRoute>
        ),
      },
      {
        path: 'admin/markets/:marketId',
        element: (
          <AdminRoute>
            <div>AdminMarketDetailPage</div>
          </AdminRoute>
        ),
      },
      {
        path: 'admin/markets/:marketId/result',
        element: (
          <AdminRoute>
            <div>AdminMarketResultPage</div>
          </AdminRoute>
        ),
      },

      // 404 Page
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
]);