import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";
import DashboardPage from "./pages/DashboardPage";
import SignInPage from "./pages/SignInPage";
import MainLayout from "./layouts/MainLayout";
import TaskListPage from "./pages/TaskListPage";
import TaskDetailPage from "./pages/TaskDetailPage";
import UserProfilePage from "./pages/UserProfilePage";

function LayoutWrapper() {
  return (
    <MainLayout>
      <Outlet /> {/* Vue의 <router-view /> */}
    </MainLayout>
  );
}

/**
 * 라우터 설정 (라우트 가드 제거)
 */
const router = createBrowserRouter([
  {
    element: <LayoutWrapper />,
    children: [
      {
        path: "/",
        element: <DashboardPage />,
      },
      {
        path: "/sign-in",
        element: <SignInPage />,
      },
      {
        path: "/task",
        element: <TaskListPage />,
      },
      {
        path: "/task/:id",
        element: <TaskDetailPage />,
      },
      {
        path: "/profile",
        element: <UserProfilePage />,
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
