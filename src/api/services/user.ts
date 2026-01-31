import { apiClient } from "../axios";
import { API_ENDPOINTS } from "../endpoints";
import type { UserResponse } from "../../types/api";

export const getUser = async (): Promise<UserResponse> => {
  const response = await apiClient.get<UserResponse>(API_ENDPOINTS.USER);
  return response.data;
};
