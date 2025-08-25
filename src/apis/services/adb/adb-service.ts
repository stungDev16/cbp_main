/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiClient } from "../../client";
import qs from "qs";
import type { AxiosResponse } from "axios";

// Define interfaces for API responses
interface AdbLogResponse {
  logs: string[];
  errors: string[];
  finished: boolean;
}

interface MetainfoResponse {
  version: string;
  features: any[];
  devices: Array<{
    serial: string;
    displays: any[];
    encoders: any[];
  }>;
}

interface AdbParams {
  app?: string;
  device?: string | null;
  source?: string;
}

class AdbService {
  readonly #endpoint: string = "adb";

  metainfo(
    params?: Record<string, any>
  ): Promise<AxiosResponse<MetainfoResponse>> {
    const querystring = qs.stringify(params || {}, { encode: false });
    const url = `/${this.#endpoint}/metainfo?${querystring}`;
    return apiClient.get<MetainfoResponse>(url);
  }

  install(params: AdbParams): Promise<AxiosResponse<AdbLogResponse>> {
    const querystring = qs.stringify(params, { encode: false });
    const url = `/${this.#endpoint}/install?${querystring}`;
    return apiClient.post<AdbLogResponse>(url);
  }

  start(params: AdbParams): Promise<AxiosResponse<AdbLogResponse>> {
    const querystring = qs.stringify(params, { encode: false });
    const url = `/${this.#endpoint}/start?${querystring}`;
    return apiClient.post<AdbLogResponse>(url);
  }

  pin(params: AdbParams): Promise<AxiosResponse<AdbLogResponse>> {
    const querystring = qs.stringify(params, { encode: false });
    const url = `/${this.#endpoint}/pin?${querystring}`;
    return apiClient.post<AdbLogResponse>(url);
  }

  unpin(params: AdbParams): Promise<AxiosResponse<AdbLogResponse>> {
    const querystring = qs.stringify(params, { encode: false });
    const url = `/${this.#endpoint}/unpin?${querystring}`;
    return apiClient.post<AdbLogResponse>(url);
  }
}

export const adbService = new AdbService();
