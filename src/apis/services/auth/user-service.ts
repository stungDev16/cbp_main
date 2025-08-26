/* eslint-disable @typescript-eslint/no-explicit-any */
import Client, { type ApiResponse } from "@/apis/client";
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
class UserService {
  readonly #config: string = "/api/v1/auth";

  me(): Promise<ApiResponse<any>> {
    const url = `${this.#config}/me`;
    return Client.get<any>(url);
  }

  login(payload: LoginPayload): Promise<ApiResponse<any>> {
    const url = `${this.#config}/login`;
    return Client.post<any>(url, payload);
  }

  logout(): Promise<ApiResponse<void>> {
    const url = `${this.#config}/logout`;
    return Client.post<void>(url);
  }

  register(payload: RegisterPayload): Promise<ApiResponse<any>> {
    const url = `${this.#config}/register`;
    return Client.post<any>(url, payload);
  }

  get(id: string): Promise<ApiResponse<any>> {
    const url = `${this.#config}/get/${id}`;
    return Client.get<any>(url);
  }
}

export const userService = new UserService();
