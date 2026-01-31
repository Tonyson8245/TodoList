import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getTasks } from "../api/services/task";
import type { Task } from "../types/api";

const TaskListPage = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // 초기 데이터 로드
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const result = await getTasks(1); // 첫 페이지 요청
        setTasks(result);
      } catch (error) {
        console.error("할 일 목록 조회 실패:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, []);

  // 카드 클릭 핸들러
  const handleTaskClick = (id: string) => {
    navigate(`/task/${id}`);
  };

  // 로딩 중
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

        {tasks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">할 일이 없습니다.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {tasks.map((task) => (
              <div
                key={task.id}
                onClick={() => handleTaskClick(task.id)}
                className="bg-white rounded-lg shadow p-4 hover:shadow-md transition cursor-pointer border border-gray-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {task.title}
                    </h3>
                    <p className="text-gray-600 text-sm">{task.memo}</p>
                  </div>

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
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskListPage;
