import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/entities/auth/model/useAuth';

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  const isDevBypass =
    import.meta.env.DEV && Boolean(import.meta.env.VITE_DEV_MEMBER_ID);

  if (!isAuthenticated && !isDevBypass) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}