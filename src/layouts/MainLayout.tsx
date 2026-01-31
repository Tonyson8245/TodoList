import { Link } from "react-router-dom";

interface MainLayoutProps {
  children: React.ReactNode;
}

function MainLayout({ children }: MainLayoutProps) {
  // TODO: 나중에 실제 로그인 로직 구현 예정
  const isLoggedIn = false;

  return (
    <div className="min-h-screen flex flex-col">
      {/* GNB - 전역 네비게이션 */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* 왼쪽: 라우트 맵 */}
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

          {/* 오른쪽: 로그인/회원정보 */}
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
                  onClick={() => {}}
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

      {/* 페이지 콘텐츠 영역 */}
      <main className="flex-1">{children}</main>
    </div>
  );
}

export default MainLayout;
