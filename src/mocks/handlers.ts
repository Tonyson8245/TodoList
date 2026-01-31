import { http, HttpResponse } from "msw";

/**
 * 쿼리 파라미터로 mockError 확인
 * 예: ?mockError=401 → 401 응답 반환
 */
const checkMockError = (request: Request) => {
  const url = new URL(request.url);
  const mockError = url.searchParams.get("mockError");

  if (mockError) {
    const status = parseInt(mockError);
    return HttpResponse.json(
      { errorMessage: `Mock Error ${status}` },
      { status },
    );
  }

  return null;
};

// 가짜 사용자 데이터
const MOCK_USER = {
  id: "user-1",
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
const VALID_ACCESS_TOKENS = ["mock-access-token", "mock-access-token-renewed"];

// 유효한 refreshToken 목록
const VALID_REFRESH_TOKENS = [
  "mock-refresh-token",
  "mock-refresh-token-renewed",
];

// 테스트용 특수 이메일 패턴
const TEST_ERROR_EMAILS: { [key: string]: number } = {
  "error400@test.com": 400,
  "error401@test.com": 401,
  "error500@test.com": 500,
};

// 테스트용 특수 토큰 (항상 401 반환)
const EXPIRED_TOKEN = "expired-token";

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

  // 테스트용 만료 토큰 체크
  if (token === EXPIRED_TOKEN) {
    return false;
  }

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
    const mockErrorResponse = checkMockError(request);
    if (mockErrorResponse) return mockErrorResponse;

    const body = (await request.json()) as { email: string; password: string };

    // 특수 이메일 패턴 체크 (테스트용)
    if (TEST_ERROR_EMAILS[body.email]) {
      const status = TEST_ERROR_EMAILS[body.email];
      return HttpResponse.json(
        { errorMessage: `테스트용 에러: ${status}` },
        { status },
      );
    }

    if (
      body.email === MOCK_USER.email &&
      body.password === MOCK_USER.password
    ) {
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
    const mockErrorResponse = checkMockError(request);
    if (mockErrorResponse) return mockErrorResponse;

    const authHeader = request.headers.get("authorization");

    if (!isValidToken(authHeader)) {
      return unauthorizedResponse();
    }

    return HttpResponse.json({
      name: MOCK_USER.name,
      memo: MOCK_USER.memo,
    });
  }),

  /**
   * GET /api/dashboard - 대시보드 통계
   */
  http.get("/api/dashboard", ({ request }) => {
    const mockErrorResponse = checkMockError(request);
    if (mockErrorResponse) return mockErrorResponse;

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
    const mockErrorResponse = checkMockError(request);
    if (mockErrorResponse) return mockErrorResponse;

    const authHeader = request.headers.get("authorization");

    if (!isValidToken(authHeader)) {
      return unauthorizedResponse();
    }

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
    const mockErrorResponse = checkMockError(request);
    if (mockErrorResponse) return mockErrorResponse;

    const authHeader = request.headers.get("authorization");

    if (!isValidToken(authHeader)) {
      return unauthorizedResponse();
    }

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
