import { apiJson } from "@/lib/apiClient";
import type { LoginData, LoginResponseData } from "@/types/Login";
import { useMutation } from "@tanstack/react-query";

export const useLoginMutation = () => {
  return useMutation({
    mutationFn: async (form: LoginData): Promise<LoginResponseData> => {
      return apiJson<LoginResponseData>("/auth/login", {
        method: "POST",
        body: form,
      });
    }
  });
};

export interface RefreshTokenResponseData {
  access_token: string;
  refresh_token: string;
  session?: {
    access_token: string;
    refresh_token: string;
  };
}

export const useRefreshTokenMutation = () => {
  return useMutation({
    mutationFn: async (refreshToken: string): Promise<RefreshTokenResponseData> => {
      return apiJson<RefreshTokenResponseData>("/auth/refresh-token", {
        method: "POST",
        body: {
          refresh_token: refreshToken,
          token_refresh: refreshToken,
        },
      });
    }
  });
};

const QueryHooks = {
  useLoginMutation,
  useRefreshTokenMutation,
};

export default QueryHooks;