import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { isAxiosError } from "axios";
import { useAuthStore } from "../store/authStore";
import { signIn } from "../api/services";
import type { SignInRequest, ErrorResponse } from "../types/api";

function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useAuthStore((state) => state.login);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/";

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isValidPassword = /^[a-zA-Z가-힣0-9]{8,24}$/.test(password);

  const isFormValid = isValidEmail && isValidPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await signIn({ email, password } as SignInRequest);
      login(data.accessToken, data.refreshToken);
      navigate(redirectPath);
    } catch (err) {
      if (isAxiosError<ErrorResponse>(err)) {
        const errorMessage =
          err.response?.data.errorMessage || "네트워크 오류가 발생했습니다.";
        setError(errorMessage);
      } else {
        setError("알 수 없는 오류가 발생했습니다.");
      }
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 flex items-center justify-center p-8 min-h-[calc(100vh-73px)]">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">로그인</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              이메일
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="email@example.com"
            />
            {email && !isValidEmail && (
              <p className="text-red-500 text-sm mt-1">
                올바른 이메일 형식이 아닙니다.
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              비밀번호
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="8-24자 영문/숫자"
            />
            {password && !isValidPassword && (
              <p className="text-red-500 text-sm mt-1">
                영문/한글/숫자 8-24자로 입력해주세요.
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={!isFormValid || isLoading}
            className={`w-full py-2 px-4 text-white rounded-lg transition ${
              isFormValid && !isLoading
                ? "bg-primary hover:bg-blue-700 cursor-pointer"
                : "bg-disabled cursor-not-allowed"
            }`}
          >
            {isLoading ? "로그인 중..." : "로그인"}
          </button>
        </form>

        {error && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
              <h2 className="text-lg font-bold text-gray-900 mb-2">
                로그인 실패
              </h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={() => setError(null)}
                className="w-full py-2 px-4 bg-primary text-white rounded-lg hover:bg-blue-700"
              >
                확인
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SignInPage;
