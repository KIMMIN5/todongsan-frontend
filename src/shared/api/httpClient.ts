import axios from "axios";
import { ROUTE_PATH } from "@/shared/constants/routePath";
import { toApiError } from "./apiError";

type HttpClientAuthConfig = {
  getAccessToken: () => string | null;
  clearAuth: () => void;
};

let authConfig: HttpClientAuthConfig = {
  getAccessToken: () => null,
  clearAuth: () => {},
};

export function configureHttpClientAuth(config: HttpClientAuthConfig) {
  authConfig = config;
}

// Guard variable to prevent multiple simultaneous redirects
let isRedirecting = false;

export const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:9000",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor
httpClient.interceptors.request.use(
  (config) => {
    // 1. Inject Authorization: Bearer {accessToken}
    const token = authConfig.getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 2. Inject development headers if dev member ID / role are set (DEV environment only)
    if (import.meta.env.DEV) {
      const devMemberId = import.meta.env.VITE_DEV_MEMBER_ID;
      const devMemberRole = import.meta.env.VITE_DEV_MEMBER_ROLE;
      if (devMemberId && config.headers) {
        config.headers["X-Member-Id"] = devMemberId;
      }
      if (devMemberRole && config.headers) {
        config.headers["X-Member-Role"] = devMemberRole;
      }
    }

    // 3. Preserve external Idempotency-Key
    // (Ensure it's not overridden if already set in request config)
    if (config.headers && config.headers["Idempotency-Key"]) {
      // Keep it as is
    }

    return config;
  },
  (error) => {
    return Promise.reject(toApiError(error));
  }
);

// Response Interceptor
httpClient.interceptors.response.use(
  (response) => {
    // Do not unwrap response.data.data globally as per user request.
    // Return AxiosResponse<ApiResponse<T>> directly.
    return response;
  },
  (error) => {
    const apiError = toApiError(error);

    // 401 Unauthorized handling
    if (apiError.status === 401 || apiError.errorCode === "UNAUTHORIZED") {
      // 1. Clear auth state
      authConfig.clearAuth();

      // 2. Prevent infinite redirect loop and duplicate redirect calls
      const currentPath = window.location.pathname;
      const isLoginOrCallbackPath =
        currentPath === ROUTE_PATH.LOGIN ||
        currentPath === ROUTE_PATH.KAKAO_CALLBACK;

      if (!isLoginOrCallbackPath && !isRedirecting) {
        isRedirecting = true;
        window.location.assign(ROUTE_PATH.LOGIN);
      }
    }

    return Promise.reject(apiError);
  }
);