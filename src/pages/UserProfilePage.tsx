import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { isAxiosError } from "axios";
import { useAuthStore } from "../store/authStore";
import { getUser } from "../api/services";
import type { UserResponse, ErrorResponse } from "../types/api";

function UserProfilePage() {
  // 상태
  const [user, setUser] = useState<UserResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Router & Auth
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  // API 호출
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const data = await getUser();
        setUser(data);
      } catch (err) {
        if (isAxiosError<ErrorResponse>(err)) {
          if (err.response?.status === 401) {
            setIsLoading(false);
            logout();
            navigate("/sign-in?redirect=/profile");
            return;
          } else {
            const errorMessage =
              err.response?.data.errorMessage || "오류가 발생했습니다.";
            setError(errorMessage);
          }
        } else {
          setError("알 수 없는 오류가 발생했습니다.");
        }
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [navigate, logout]);

  // 로딩
  if (isLoading) {
    return (
      <div className="bg-gray-50 p-8 flex items-center justify-center min-h-[400px]">
        <p className="text-gray-600">로딩 중...</p>
      </div>
    );
  }

  // 에러
  if (error) {
    return (
      <div className="bg-gray-50 p-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // 데이터 없음
  if (!user) {
    return null;
  }

  return (
    <div className="bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">회원정보</h1>

        <div className="bg-white rounded-lg shadow p-8">
          <div className="mb-6">
            <p className="text-sm text-gray-500 mb-2">이름</p>
            <p className="text-xl font-semibold text-gray-900">{user.name}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500 mb-2">메모</p>
            <p className="text-gray-700 whitespace-pre-wrap">{user.memo}</p>
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={() => navigate("/")}
            className="text-gray-600 hover:text-gray-900 transition"
          >
            ← 대시보드로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
}

export default UserProfilePage;
