import axios from "axios";
import { apiClient } from "../axios";
import { API_ENDPOINTS } from "../endpoints";
import type {
  SignInRequest,
  SignInResponse,
  RefreshTokenResponse,
} from "../../types/api";

export const signIn = async (data: SignInRequest): Promise<SignInResponse> => {
  const response = await apiClient.post<SignInResponse>(
    API_ENDPOINTS.SIGN_IN,
    data,
  );
  return response.data;
};

export const refreshToken = async (
  token: string,
): Promise<RefreshTokenResponse> => {
  const response = await axios.post<RefreshTokenResponse>(
    API_ENDPOINTS.REFRESH_TOKEN,
    {},
    {
      headers: {
        authorization: `Bearer ${token}`,
      },
    },
  );
  return response.data;
};
