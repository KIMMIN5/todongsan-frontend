import { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { ROUTE_PATH } from "@/shared/constants/routePath";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";
import { useAuth } from "@/entities/auth/model/useAuth";
import { logout as logoutFromServer } from "@/entities/auth/api/authApi";
import { LoginModal } from "@/features/login-modal/ui/LoginModal";

const navItems = [
  { label: "홈", to: ROUTE_PATH.HOME },
  { label: "마켓", to: ROUTE_PATH.MARKETS },
  { label: "배틀", to: ROUTE_PATH.BATTLES },
  { label: "마이페이지", to: ROUTE_PATH.MY },
];

export function AppShell() {
  const navigate = useNavigate();
  const { isAuthenticated, nickname, logout } = useAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logoutFromServer();
    } catch {
      // 서버 호출 실패와 무관하게 로컬 인증 정보는 항상 정리한다.
    } finally {
      logout();
      navigate(ROUTE_PATH.LOGIN);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 flex flex-col font-sans antialiased">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 h-16 border-b border-slate-200 bg-white/95 backdrop-blur-md">
        <div className="mx-auto max-w-[1440px] h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">

          {/* Logo Section */}
          <div className="flex items-center gap-8">
            <Link to={ROUTE_PATH.HOME} className="flex items-center gap-2 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm transition-transform group-hover:scale-105">
                <span className="text-lg font-bold">토</span>
              </div>
              <div className="flex flex-col justify-center">
                <span className="text-base font-bold leading-tight text-slate-900 group-hover:text-emerald-700 transition-colors">
                  토동산
                </span>
                <span className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase leading-none">
                  Todongsan
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                      isActive
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    )
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                {nickname && (
                  <span className="text-xs font-semibold text-slate-600">{nickname}님</span>
                )}
                <Button variant="ghost" size="sm" className="text-xs font-semibold" onClick={handleLogout}>
                  로그아웃
                </Button>
              </>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs font-semibold"
                onClick={() => setIsLoginModalOpen(true)}
              >
                로그인
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-auto">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            &copy; {new Date().getFullYear()} 토동산. All rights reserved.
          </div>
          <div className="flex gap-4">
            <a href="#" className="hover:underline">이용약관</a>
            <a href="#" className="hover:underline">개인정보처리방침</a>
          </div>
        </div>
      </footer>

      <LoginModal open={isLoginModalOpen} onOpenChange={setIsLoginModalOpen} />
    </div>
  );
}
