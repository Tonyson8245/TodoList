import { http, HttpResponse } from "msw";

// 가짜 사용자 데이터
const MOCK_USER = {
  email: "test@test.com",
  password: "test1234",
  name: "홍길동",
  memo: "테스트 사용자입니다.",
};

// fake JWT token
const MOCK_TOKENS = {
  accessToken: "mock-access-token",
  refreshToken: "mock-refresh-token",
};

// 유효한 accessToken 목록 (로그인 시 발급된 토큰들)
const VALID_ACCESS_TOKENS = [
  "mock-access-token",
  "mock-access-token-renewed",
  "test400-token",
  "test401-token",
  "test404-token",
];

// 유효한 refreshToken 목록
const VALID_REFRESH_TOKENS = [
  "mock-refresh-token",
  "mock-refresh-token-renewed",
  "test400-refresh-token",
  "test401-refresh-token",
  "test404-refresh-token",
];

// 테스트용 특수 이메일 패턴 (로그인 단계에서 에러 발생)
const TEST_ERROR_EMAILS: { [key: string]: number } = {
  "error400@test.com": 400,
  "error500@test.com": 500,
};

// 현재 로그인한 사용자의 이메일을 저장 (토큰 -> 이메일 매핑)
const TOKEN_TO_EMAIL_MAP = new Map<string, string>();

// 테스트 계정별 에러 설정
const getTestAccountError = (email: string | undefined, endpoint: string) => {
  if (!email) return null;

  const errorMap: Record<
    string,
    Record<string, { status: number; message: string }>
  > = {
    "test400@test.com": {
      "/api/task": { status: 400, message: "잘못된 요청입니다." },
    },
    "test401@test.com": {
      "/api/task": { status: 401, message: "인증이 만료되었습니다." },
      "/api/task/:id": { status: 401, message: "인증이 만료되었습니다." },
      "/api/user": { status: 401, message: "인증이 만료되었습니다." },
    },
    "test404@test.com": {
      "/api/task": { status: 404, message: "할 일 목록을 찾을 수 없습니다." },
      "/api/task/:id": { status: 404, message: "할 일을 찾을 수 없습니다." },
    },
  };

  const accountErrors = errorMap[email];
  if (!accountErrors) return null;

  // 정확한 매칭
  if (accountErrors[endpoint]) {
    const errorConfig = accountErrors[endpoint];
    return HttpResponse.json(
      { errorMessage: errorConfig.message },
      { status: errorConfig.status },
    );
  }

  // :id 패턴 매칭 (예: /api/task/task-1 → /api/task/:id)
  const patternMatch = Object.entries(accountErrors).find(
    ([key]) => key.includes(":id") && endpoint.startsWith(key.split(":")[0]),
  );

  if (patternMatch) {
    const errorConfig = patternMatch[1];
    return HttpResponse.json(
      { errorMessage: errorConfig.message },
      { status: errorConfig.status },
    );
  }

  return null;
};

const isValidToken = (authHeader: string | null): boolean => {
  if (!authHeader) {
    return false;
  }

  // Bearer 형식 체크
  if (!authHeader.startsWith("Bearer ")) {
    return false;
  }

  // 토큰 추출
  const token = authHeader.replace("Bearer ", "");

  // 유효한 토큰 목록에 있는지 확인
  return VALID_ACCESS_TOKENS.includes(token);
};

/**
 * 401 Unauthorized 응답 생성
 */
const unauthorizedResponse = () => {
  return HttpResponse.json(
    { errorMessage: "인증이 필요합니다." },
    { status: 401 },
  );
};

export const handlers = [
  /**
k   * POST /api/sign-in - 로그인
   */
  http.post("/api/sign-in", async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string };

    // 특수 이메일 패턴 체크 (테스트용)
    if (TEST_ERROR_EMAILS[body.email]) {
      const status = TEST_ERROR_EMAILS[body.email];
      return HttpResponse.json(
        { errorMessage: `테스트용 에러: ${status}` },
        { status },
      );
    }

    // test400@test.com 계정 처리
    if (body.email === "test400@test.com" && body.password === "test1234") {
      const tokens = {
        accessToken: "test400-token",
        refreshToken: "test400-refresh-token",
      };
      TOKEN_TO_EMAIL_MAP.set("test400-token", body.email);
      return HttpResponse.json(tokens, { status: 200 });
    }

    // test401@test.com 계정 처리
    if (body.email === "test401@test.com" && body.password === "test1234") {
      const tokens = {
        accessToken: "test401-token",
        refreshToken: "test401-refresh-token",
      };
      TOKEN_TO_EMAIL_MAP.set("test401-token", body.email);
      return HttpResponse.json(tokens, { status: 200 });
    }

    // test404@test.com 계정 처리
    if (body.email === "test404@test.com" && body.password === "test1234") {
      const tokens = {
        accessToken: "test404-token",
        refreshToken: "test404-refresh-token",
      };
      TOKEN_TO_EMAIL_MAP.set("test404-token", body.email);
      return HttpResponse.json(tokens, { status: 200 });
    }

    if (
      body.email === MOCK_USER.email &&
      body.password === MOCK_USER.password
    ) {
      TOKEN_TO_EMAIL_MAP.set(MOCK_TOKENS.accessToken, body.email);
      return HttpResponse.json(MOCK_TOKENS, { status: 200 });
    }

    return HttpResponse.json(
      { errorMessage: "이메일 또는 비밀번호가 잘못되었습니다." },
      { status: 400 },
    );
  }),

  /**
   * GET /api/user - 회원정보
   */
  http.get("/api/user", ({ request }) => {
    const authHeader = request.headers.get("authorization");

    if (!isValidToken(authHeader)) {
      return unauthorizedResponse();
    }

    const token = authHeader?.replace("Bearer ", "") || "";
    const email = TOKEN_TO_EMAIL_MAP.get(token);

    const testError = getTestAccountError(email, "/api/user");
    if (testError) return testError;

    return HttpResponse.json({
      name: MOCK_USER.name,
      memo: MOCK_USER.memo,
    });
  }),

  /**
   * GET /api/dashboard - 대시보드 통계
   */
  http.get("/api/dashboard", ({ request }) => {
    const authHeader = request.headers.get("authorization");

    if (!isValidToken(authHeader)) {
      return unauthorizedResponse();
    }

    return HttpResponse.json({
      numOfTask: 10,
      numOfRestTask: 3,
      numOfDoneTask: 7,
    });
  }),

  /**
   * GET /api/task - 할일 목록 (페이지네이션 지원)
   */
  http.get("/api/task", ({ request }) => {
    const authHeader = request.headers.get("authorization");

    if (!isValidToken(authHeader)) {
      return unauthorizedResponse();
    }

    const token = authHeader?.replace("Bearer ", "") || "";
    const email = TOKEN_TO_EMAIL_MAP.get(token);

    const testError = getTestAccountError(email, "/api/task");
    if (testError) return testError;

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const pageSize = 10;

    const totalTasks = 50;
    const startIndex = (page - 1) * pageSize;

    if (startIndex >= totalTasks) {
      return HttpResponse.json([]);
    }

    const tasks = Array.from(
      { length: Math.min(pageSize, totalTasks - startIndex) },
      (_, i) => {
        const taskNum = startIndex + i + 1;
        return {
          id: `task-${taskNum}`,
          title: `할일 ${taskNum}`,
          memo: `할일 ${taskNum}의 메모입니다.`,
          status: taskNum % 3 === 0 ? "DONE" : "TODO",
        };
      },
    );

    return HttpResponse.json(tasks);
  }),

  /**
   * GET /api/task/:id - 할일 상세
   */
  http.get("/api/task/:id", ({ params, request }) => {
    const authHeader = request.headers.get("authorization");

    if (!isValidToken(authHeader)) {
      return unauthorizedResponse();
    }

    const token = authHeader?.replace("Bearer ", "") || "";
    const email = TOKEN_TO_EMAIL_MAP.get(token);

    const url = new URL(request.url);
    const testError = getTestAccountError(email, url.pathname);
    if (testError) return testError;

    const { id } = params;

    // task-999는 404 테스트용 (존재하지 않음)
    if (id === "task-999") {
      return HttpResponse.json(
        { errorMessage: "할 일을 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    // task-1~50 범위 체크 (목록에 있는 것들만 허용)
    const taskMatch = String(id).match(/^task-(\d+)$/);
    if (taskMatch) {
      const taskNum = parseInt(taskMatch[1]);
      if (taskNum < 1 || taskNum > 50) {
        // 범위 밖의 ID는 403 (접근 권한 없음)
        return HttpResponse.json(
          { errorMessage: "접근 권한이 없습니다." },
          { status: 403 },
        );
      }
    } else {
      // task-{숫자} 형식이 아니면 403
      return HttpResponse.json(
        { errorMessage: "접근 권한이 없습니다." },
        { status: 403 },
      );
    }

    return HttpResponse.json({
      id,
      title: `할일 ${id}`,
      memo: `할일 ${id}의 상세 메모입니다.`,
      registerDatetime: new Date().toISOString(),
    });
  }),

  /**
   * POST /api/refresh - 토큰 재발급
   */
  http.post("/api/refresh", ({ request }) => {
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return HttpResponse.json(
        { errorMessage: "인증 토큰이 필요합니다." },
        { status: 401 },
      );
    }

    const token = authHeader.replace("Bearer ", "");

    if (VALID_REFRESH_TOKENS.includes(token)) {
      return HttpResponse.json({
        accessToken: "mock-access-token-renewed",
        refreshToken: "mock-refresh-token-renewed",
      });
    }

    return HttpResponse.json(
      { errorMessage: "유효하지 않은 리프레시 토큰입니다." },
      { status: 401 },
    );
  }),
];
