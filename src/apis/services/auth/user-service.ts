/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiClient } from "../../client";
import qs from "qs";
import { type AxiosResponse } from "axios";
import type { ApiResponseData } from "@/types/interface/hooks/useFetch.interface";

// Define interfaces for API payloads and responses
interface LoginPayload {
  email: string;
  password: string;
}

interface RegisterPayload {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

interface UpdatePayload {
  [key: string]: any;
}

interface UserData {
  id: string;
  username: string;
  email: string;
  display_name: string;
  [key: string]: any;
}

class UserService {
  readonly #endpoint: string = "users";
  readonly #auth: string = "auth";

  me(): Promise<AxiosResponse<ApiResponseData>> {
    const url = `/${this.#auth}/checkMe`;
    return apiClient.get<ApiResponseData>(url);
  }

  login(payload: LoginPayload): Promise<AxiosResponse<ApiResponseData>> {
    const url = `/${this.#auth}/login`;
    return apiClient.post<ApiResponseData>(url, payload);
  }

  logout(): Promise<AxiosResponse<void>> {
    const url = `/${this.#endpoint}/logout`;
    return apiClient.post<void>(url);
  }

  register(payload: RegisterPayload): Promise<AxiosResponse<ApiResponseData>> {
    const url = `/${this.#auth}/register`;
    return apiClient.post<ApiResponseData>(url, payload);
  }

  get(id: string): Promise<AxiosResponse<ApiResponseData>> {
    const url = `/${this.#endpoint}/get/${id}`;
    return apiClient.get<ApiResponseData>(url);
  }

  getAll(params?: Record<string, any>): Promise<AxiosResponse<UserData[]>> {
    const querystring = qs.stringify(params || {}, { encode: false });
    const url = `/${this.#endpoint}/get-all?${querystring}`;
    return apiClient.get<UserData[]>(url);
  }

  update(id: string, payload: UpdatePayload): Promise<AxiosResponse<UserData>> {
    const url = `/${this.#endpoint}/update/${id}`;
    return apiClient.patch<UserData>(url, payload);
  }

  delete(id: string): Promise<AxiosResponse<void>> {
    const url = `/${this.#endpoint}/delete/${id}`;
    return apiClient.delete<void>(url);
  }
}

export const userService = new UserService();
