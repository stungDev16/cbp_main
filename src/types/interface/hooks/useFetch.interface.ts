/* eslint-disable @typescript-eslint/no-explicit-any */
export interface ApiResponseData<T = any> {
  data: T;
  success: boolean;
  message: string;
  isError?: boolean;
}

type RESTMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface FetchArgs {
  url?: string;
  search?: {
    [key: string]: string;
  };
  method?: RESTMethod;
  body?: Record<string, any>;
  options?: RequestInit;
  headers?: HeadersInit;
  refetchOnConnect?: boolean;
  refetchOnFocus?: boolean;
  refetchInterval?: string;
}

export interface FetchResponse<T> {
  data: T;
  success: boolean;
  message: string;
  rawData: ApiResponseData;
  isError: boolean;
  refetch: () => void;
  isLoading: boolean;
}
