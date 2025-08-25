import { apiClient } from "../../client";
import qs from "qs";

class MetaService {
  #endpoint = "meta";

  getAll(params?: Record<string, unknown>) {
    const querystring = qs.stringify(params, { encode: false });
    const url = `/${this.#endpoint}/get-all?${querystring}`;
    return apiClient.get(url);
  }
}

export const metaService = new MetaService();
