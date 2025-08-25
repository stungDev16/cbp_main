import { apiClient } from "../../client";
import qs from "qs";

class FileUploadService {
  #endpoint = "file";

  upload(
    files: FileList | File[],
    params?: Record<string, unknown>,
    onProgress?: (progress: number) => void
  ) {
    const formData = new FormData();
    const list = Array.from(files as FileList) as File[];
    list.forEach((file: File, i: number) => {
      formData.append(`files[${i}]`, file);
    });

    const querystring = qs.stringify(params || {}, { encode: false });
    const query = querystring ? `?${querystring}` : "";
    const url = `/${this.#endpoint}/upload${query}`;

    return apiClient.post(url, formData, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress?.(percent); // Dùng callback thay vì dispatch
        }
      },
    });
  }

  getUploads(params?: Record<string, unknown>) {
    const querystring = qs.stringify(params || {}, { encode: false });
    const query = querystring ? `?${querystring}` : "";
    const url = `/${this.#endpoint}/get-uploads${query}`;
    return apiClient.get(url);
  }

  getApps(params?: Record<string, unknown>) {
    const querystring = qs.stringify(params || {}, { encode: false });
    const query = querystring ? `?${querystring}` : "";
    const url = `/${this.#endpoint}/get-apps${query}`;
    return apiClient.get(url);
  }
}

export const fileUploadService = new FileUploadService();
