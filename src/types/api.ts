// 로그인 요청/응답
export interface SignInRequest {
  email: string;
  password: string;
}

export interface SignInResponse {
  accessToken: string;
  refreshToken: string;
}

// 토큰 재발급 요청/응답
export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

// 회원정보
export interface UserResponse {
  name: string;
  memo: string;
}

// 대시보드
export interface DashboardResponse {
  numOfTask: number;
  numOfRestTask: number;
  numOfDoneTask: number;
}

// 할일
export interface Task {
  id: string;
  title: string;
  memo: string;
  status: "TODO" | "DONE";
}

export interface TaskDetail {
  id: string;
  title: string;
  memo: string;
  registerDatetime: string;
}

// 에러 응답
export interface ErrorResponse {
  errorMessage: string;
}
