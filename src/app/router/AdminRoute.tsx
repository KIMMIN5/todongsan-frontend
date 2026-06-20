import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/entities/auth/model/useAuth';

interface AdminRouteProps {
  children: ReactNode;
}

export default function AdminRoute({ children }: AdminRouteProps) {
  const { isAuthenticated, role } = useAuth();

  const isDevBypass =
    import.meta.env.DEV &&
    Boolean(import.meta.env.VITE_DEV_MEMBER_ID) &&
    import.meta.env.VITE_DEV_MEMBER_ROLE === 'ADMIN';

  if (!isAuthenticated && !isDevBypass) {
    return <Navigate to="/login" replace />;
  }

  if (!isDevBypass && role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}