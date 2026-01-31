import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

interface MainLayoutProps {
  children: React.ReactNode;
}

function MainLayout({ children }: MainLayoutProps) {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/sign-in");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link
              to="/"
              className="flex items-center gap-2 text-gray-700 hover:text-blue-600"
            >
              📊 대시보드
            </Link>
            <Link
              to="/task"
              className="flex items-center gap-2 text-gray-700 hover:text-blue-600"
            >
              ✓ 할 일
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <>
                <Link
                  to="/profile"
                  className="flex items-center gap-2 text-gray-700 hover:text-blue-600"
                >
                  👤 회원정보
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-gray-700 hover:text-blue-600"
                >
                  🚪 로그아웃
                </button>
              </>
            ) : (
              <Link
                to="/sign-in"
                className="flex items-center gap-2 text-gray-700 hover:text-blue-600"
              >
                🔑 로그인
              </Link>
            )}
          </div>
        </div>
      </nav>

      <main className="flex-1">{children}</main>
    </div>
  );
}

export default MainLayout;
