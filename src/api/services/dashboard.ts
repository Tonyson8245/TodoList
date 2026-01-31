import { apiClient } from "../axios";
import { API_ENDPOINTS } from "../endpoints";
import type { DashboardResponse } from "../../types/api";

export const getDashboard = async (): Promise<DashboardResponse> => {
  const response = await apiClient.get<DashboardResponse>(
    API_ENDPOINTS.DASHBOARD,
  );
  return response.data;
};
