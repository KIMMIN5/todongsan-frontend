// 사용자 역할
export type UserRole = 'USER' | 'ADMIN';

// 인증 상태
export interface AuthState {
  isAuthenticated: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  memberId: number | null;
  nickname: string | null;
  role: UserRole | null;
}

// 로그인 요청
export interface LoginRequest {
  code: string;
  redirectUri?: string;
}

// 로그인 응답
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  memberId: number;
  nickname: string;
  role: UserRole;
  isNewMember: boolean;
}

// 토큰 갱신 요청
export interface RefreshTokenRequest {
  refreshToken: string;
}

// 토큰 갱신 응답
export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

// 카카오 JS SDK 로그인 요청 (POST /api/v1/members/oauth/kakao)
export interface KakaoOAuthRequest {
  accessToken: string;
}

// 카카오 로그인 응답
export interface KakaoOAuthResponse {
  accessToken: string;
  refreshToken: string;
  memberId: number;
  nickname: string;
  role: UserRole;
  isNewMember: boolean;
}

// 카카오 로그인 관련
export interface KakaoAuthParams {
  code: string;
  state?: string;
}

// 로그인 히스토리
export interface LoginHistory {
  loginId: number;
  memberId: number;
  loginAt: string;
  ipAddress?: string;
  userAgent?: string;
  loginMethod: 'KAKAO' | 'ADMIN';
}

// 세션 정보
export interface SessionInfo {
  sessionId: string;
  memberId: number;
  issuedAt: string;
  expiresAt: string;
  lastAccessAt: string;
  ipAddress?: string;
}