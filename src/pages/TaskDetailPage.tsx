import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { isAxiosError } from "axios";
import { useAuthStore } from "../store/authStore";
import { getTaskDetail } from "../api/services";
import type { TaskDetail, ErrorResponse } from "../types/api";

function TaskDetailPage() {
  // 상태
  const [task, setTask] = useState<TaskDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState("");

  // Router & Auth
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  // API 호출
  useEffect(() => {
    const fetchTaskData = async () => {
      if (!id) return;

      try {
        const data = await getTaskDetail(id);
        setTask(data);
      } catch (err) {
        if (isAxiosError<ErrorResponse>(err)) {
          if (err.response?.status === 401) {
            // 로그아웃 후 로그인 페이지로 이동 (로그인 후 다시 돌아옴)
            setIsLoading(false);
            logout();
            navigate(`/sign-in?redirect=/task/${id}`);
            return;
          } else if (err.response?.status === 404) {
            setNotFound(true);
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

    fetchTaskData();
  }, [id, navigate, logout]);

  // 삭제 확인 모달 열기
  const handleDeleteClick = () => {
    setShowDeleteModal(true);
    setDeleteConfirmId("");
  };

  // 삭제 확인 모달 닫기
  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setDeleteConfirmId("");
  };

  // 삭제 실행
  const handleDeleteConfirm = () => {
    // 실제로는 DELETE API 호출
    // 여기서는 목록으로 이동만
    navigate("/task");
  };

  // ID 입력 확인 (제출 버튼 활성화 조건)
  const isDeleteConfirmValid = deleteConfirmId === id;

  // 로딩
  if (isLoading) {
    return (
      <div className="bg-gray-50 p-8 flex items-center justify-center min-h-[400px]">
        <p className="text-gray-600">로딩 중...</p>
      </div>
    );
  }

  // 404 Not Found
  if (notFound) {
    return (
      <div className="bg-gray-50 p-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
            <p className="text-xl text-gray-600 mb-6">
              할 일을 찾을 수 없습니다.
            </p>
            <button
              onClick={() => navigate("/task")}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              목록으로 돌아가기
            </button>
          </div>
        </div>
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
  if (!task) {
    return null;
  }

  return (
    <div className="bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => navigate("/task")}
            className="text-gray-600 hover:text-gray-900 transition"
          >
            ← 목록으로
          </button>
          <button
            onClick={handleDeleteClick}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            삭제
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {task.title}
          </h1>

          <div className="mb-6">
            <p className="text-sm text-gray-500 mb-2">메모</p>
            <p className="text-gray-700 whitespace-pre-wrap">{task.memo}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500 mb-2">등록일시</p>
            <p className="text-gray-700">
              {new Date(task.registerDatetime).toLocaleString("ko-KR")}
            </p>
          </div>
        </div>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">삭제 확인</h2>

            <p className="text-gray-600 mb-4">
              정말 삭제하시겠습니까? 삭제하려면 아래에 할 일 ID를 입력해주세요.
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                할 일 ID: <span className="text-blue-600">{id}</span>
              </label>
              <input
                type="text"
                value={deleteConfirmId}
                onChange={(e) => setDeleteConfirmId(e.target.value)}
                placeholder="ID를 입력하세요"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleDeleteCancel}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                취소
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={!isDeleteConfirmValid}
                className={`flex-1 px-4 py-2 rounded-lg transition ${
                  isDeleteConfirmValid
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                제출
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TaskDetailPage;
