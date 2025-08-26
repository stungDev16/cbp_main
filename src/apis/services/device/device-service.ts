/* eslint-disable @typescript-eslint/no-explicit-any */
import Client, { type ApiResponse } from "@/apis/client";

class DeviceService {
  readonly #config: string = "/api/v1";
  get_phone(): Promise<ApiResponse<any>> {
    return Client.get<any>(`${this.#config}/get-phone`);
  }
}

export const deviceService = new DeviceService();
