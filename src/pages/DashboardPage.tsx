import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { isAxiosError } from "axios";
import { useAuthStore } from "../store/authStore";
import { getDashboard } from "../api/services";
import type { DashboardResponse, ErrorResponse } from "../types/api";

function DashboardPage() {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const result = await getDashboard();
        setData(result);
      } catch (err) {
        if (isAxiosError<ErrorResponse>(err)) {
          // 401 에러: 로그아웃 후 로그인 페이지로 이동
          if (err.response?.status === 401) {
            setIsLoading(false);
            logout();
            navigate("/sign-in?redirect=/");
            return;
          }

          const errorMessage =
            err.response?.data.errorMessage || "데이터를 불러올 수 없습니다.";
          setError(errorMessage);
        } else {
          setError("알 수 없는 오류가 발생했습니다.");
        }
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // 로딩 중
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
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">대시보드</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-gray-600 text-sm mb-2">일</h2>
            <p className="text-3xl font-bold text-primary">
              {data?.numOfTask ?? 0}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-gray-600 text-sm mb-2">해야할 일</h2>
            <p className="text-3xl font-bold text-primary">
              {data?.numOfRestTask ?? 0}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-gray-600 text-sm mb-2">한 일</h2>
            <p className="text-3xl font-bold text-primary">
              {data?.numOfDoneTask ?? 0}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
