import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useVirtualizer } from "@tanstack/react-virtual";
import { isAxiosError } from "axios";
import { useAuthStore } from "../store/authStore";
import { getTasks } from "../api/services";
import type { Task, ErrorResponse } from "../types/api";

function TaskListPage() {
  // 상태
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [showErrorModal, setShowErrorModal] = useState(false);

  const navigate = useNavigate();

  const logout = useAuthStore((state) => state.logout);

  // 가상 스크롤링을 위한 부모 ref
  const parentRef = useRef<HTMLDivElement>(null);

  // API 호출 함수
  const fetchTasksData = useCallback(async (pageNum: number) => {
    if (pageNum > 1) {
      setIsFetchingMore(true);
    }

    try {
      const result = await getTasks(pageNum);

      if (result.length === 0) {
        // 더 이상 데이터가 없음
        setHasMore(false);
      } else {
        // 기존 목록에 추가 (페이지 1이면 교체)
        setTasks((prev) => (pageNum === 1 ? result : [...prev, ...result]));
      }
    } catch (err) {
      if (isAxiosError<ErrorResponse>(err)) {
        // 401 에러: 로그아웃 후 로그인 페이지로 이동
        if (err.response?.status === 401) {
          setIsLoading(false);
          setIsFetchingMore(false);
          logout();
          navigate("/sign-in?redirect=/task");
          return;
        }

        // 400 에러: 에러 모달 표시
        if (err.response?.status === 400) {
          const errorMessage =
            err.response?.data.errorMessage || "잘못된 요청입니다.";
          setError(errorMessage);
          setShowErrorModal(true);
          setIsLoading(false);
          setIsFetchingMore(false);
          return;
        }

        // 기타 에러
        const errorMessage =
          err.response?.data.errorMessage || "할 일 목록을 불러올 수 없습니다.";
        setError(errorMessage);
      } else {
        setError("알 수 없는 오류가 발생했습니다.");
      }
      console.error(err);
    } finally {
      setIsLoading(false);
      setIsFetchingMore(false);
    }
  }, []);

  // 초기 로드
  useEffect(() => {
    fetchTasksData(1);
  }, [fetchTasksData]);

  // 가상 스크롤러 설정
  const rowVirtualizer = useVirtualizer({
    count: hasMore ? tasks.length + 1 : tasks.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100,
    overscan: 1,
  });

  // 무한 스크롤
  const items = rowVirtualizer.getVirtualItems();
  const lastItem = items[items.length - 1];

  useEffect(() => {
    if (!lastItem) return;

    if (
      lastItem.index >= tasks.length - 1 &&
      hasMore &&
      !isFetchingMore &&
      !isLoading
    ) {
      const nextPage = Math.floor(tasks.length / 10) + 1;
      fetchTasksData(nextPage);
    }
  }, [
    lastItem,
    hasMore,
    isFetchingMore,
    isLoading,
    tasks.length,
    fetchTasksData,
  ]);

  // 카드 클릭 핸들러
  const handleTaskClick = (id: string) => {
    navigate(`/task/${id}`);
  };

  // 로딩
  if (isLoading) {
    return (
      <div className="bg-gray-50 p-8 flex items-center justify-center min-h-[400px]">
        <p className="text-gray-600">로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">할 일 목록</h1>

        {tasks.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <p className="text-gray-500">할 일이 없습니다.</p>
          </div>
        )}

        {tasks.length > 0 && (
          <div ref={parentRef} className="h-[calc(100vh-200px)] overflow-auto">
            <div
              style={{
                height: `${rowVirtualizer.getTotalSize()}px`,
                width: "100%",
                position: "relative",
              }}
            >
              {rowVirtualizer.getVirtualItems().map((virtualItem) => {
                const task = tasks[virtualItem.index];
                const isLoaderRow = virtualItem.index > tasks.length - 1;

                return (
                  <div
                    key={virtualItem.key}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: `${virtualItem.size}px`,
                      transform: `translateY(${virtualItem.start}px)`,
                    }}
                    className="px-4 py-2"
                  >
                    {isLoaderRow ? (
                      <div className="bg-white rounded-lg shadow p-4">
                        <p className="text-gray-400 text-center">로딩 중...</p>
                      </div>
                    ) : (
                      <div
                        onClick={() => handleTaskClick(task.id)}
                        className="bg-white rounded-lg shadow p-4 hover:shadow-md transition cursor-pointer"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                              {task.title}
                            </h3>
                            <p className="text-gray-600 text-sm">{task.memo}</p>
                          </div>

                          {/* 상태 배지 */}
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              task.status === "DONE"
                                ? "bg-green-100 text-green-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {task.status === "DONE" ? "완료" : "진행중"}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            {!hasMore && tasks.length > 0 && (
              <div className="py-4 text-center">
                <p className="text-gray-400">모든 할 일을 불러왔습니다.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 400 에러 모달 */}
      {showErrorModal && error && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">오류</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => {
                setShowErrorModal(false);
                setError(null);
                navigate("/task");
              }}
              className="w-full py-2 px-4 bg-primary text-white rounded-lg hover:bg-blue-700 transition"
            >
              목록으로 돌아가기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default TaskListPage;
