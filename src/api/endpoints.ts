export const API_ENDPOINTS = {
  // 인증
  SIGN_IN: "/api/sign-in",
  REFRESH_TOKEN: "/api/refresh",

  // 사용자
  USER: "/api/user",

  // 대시보드
  DASHBOARD: "/api/dashboard",

  // 할일
  TASK_LIST: "/api/task",
  TASK_DETAIL: (id: string) => `/api/task/${id}`,
} as const;
