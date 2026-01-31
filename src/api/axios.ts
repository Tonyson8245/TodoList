import axios from "axios";

// Axios 인스턴스 생성
export const apiClient = axios.create({
  baseURL: "/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Authorization 헤더 자동 추가
apiClient.interceptors.request.use(
  (config) => {
    // localStorage에서 토큰 가져오기 (추후 구현)
    const token = localStorage.getItem("accessToken");
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: 에러 처리 기본 구조
apiClient.interceptors.response.use(
  (response) => {
    // 성공 응답은 그대로 반환
    return response;
  },
  (error) => {
    // 에러 처리
    if (error.response) {
      // 서버 응답이 있는 경우
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // 인증 실패
          console.error("인증 실패:", data.message);
          // TODO: 로그아웃 처리 또는 토큰 갱신
          break;
        case 403:
          // 권한 없음
          console.error("권한 없음:", data.message);
          break;
        case 404:
          // 리소스 없음
          console.error("리소스를 찾을 수 없음:", data.message);
          break;
        case 500:
          // 서버 에러
          console.error("서버 에러:", data.message);
          break;
        default:
          console.error("API 에러:", data.message);
      }
    } else if (error.request) {
      // 요청은 보냈으나 응답을 받지 못한 경우
      console.error("네트워크 에러: 서버로부터 응답이 없습니다.");
    } else {
      // 요청 설정 중 에러 발생
      console.error("요청 설정 에러:", error.message);
    }
    
    return Promise.reject(error);
  }
);
