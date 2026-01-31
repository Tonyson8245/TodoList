import { apiClient } from "../axios";
import { API_ENDPOINTS } from "../endpoints";
import type { Task, TaskDetail } from "../../types/api";

export const getTasks = async (page: number = 1): Promise<Task[]> => {
  const response = await apiClient.get<Task[]>(API_ENDPOINTS.TASK_LIST, {
    params: { page },
  });
  return response.data;
};

export const getTaskDetail = async (id: string): Promise<TaskDetail> => {
  const response = await apiClient.get<TaskDetail>(
    API_ENDPOINTS.TASK_DETAIL(id),
  );
  return response.data;
};
