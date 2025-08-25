/* eslint-disable @typescript-eslint/no-explicit-any */
import { SERVER_URL } from "@config/site.config.ts";
import { dateToTime } from "@helpers/date.ts";
import {
  type FetchArgs,
  type FetchResponse,
  type ApiResponseData,
} from "@interface/hooks/useFetch.interface.ts";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

function useFetch<T = any>(path: string, args?: FetchArgs): FetchResponse<T> {
  const { t } = useTranslation();
  const [response, setResponse] = useState<FetchResponse<T> | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);

  const defaultErrorResponse: ApiResponseData = useMemo(
    () => ({
      message: t("response.error") || "An error occurred",
      data: null,
      success: false,
    }),
    [t]
  );

  const getUrl = useCallback(() => {
    const queryParams = new URLSearchParams(args?.search || {}).toString();
    return `${args?.url || SERVER_URL}${path}?${queryParams}`;
  }, [args?.url, path, args?.search]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    const method = args?.method || "GET";
    const body = args?.body || null;
    const options = args?.options || null;
    const headers = args?.headers || null;
    const fetchOptions: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: method !== "GET" ? JSON.stringify(body) : null,
      ...options,
    };

    try {
      const res = await fetch(getUrl(), fetchOptions);
      const json = (await res.json()) as ApiResponseData;
      const isError = json.success === false;
      const responseData = {
        data: json.data as T,
        message: json.message,
        timestamp: Date.now(),
        rawData: json,
        isError,
      };
      setResponse(responseData as unknown as FetchResponse<T>);
      setIsError(isError);
    } catch (error) {
      console.error("Fetch error:", error);
      setIsError(true);
      setResponse({
        success: false,
        message: t("response.error") || "An error occurred",
        data: null as T,
        rawData: defaultErrorResponse,
        isError: true,
        isLoading: false,
        refetch: fetchData,
      });
    } finally {
      setIsLoading(false);
    }
  }, [
    args?.method,
    args?.body,
    args?.options,
    args?.headers,
    defaultErrorResponse,
    getUrl,
    t,
  ]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    fetchData().then(() => {
      if (args?.refetchInterval) {
        const interval = dateToTime(args?.refetchInterval);
        intervalId = interval ? setInterval(fetchData, interval * 1000) : null;
      }
    });
    return () => {
      if (args?.refetchInterval && intervalId) {
        clearInterval(intervalId);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [args?.refetchInterval]);

  return {
    data: response?.data || (null as T),
    message: response?.message || "",
    success: response?.success || false,
    refetch: fetchData,
    isLoading,
    isError,
    rawData: response?.rawData || defaultErrorResponse,
  };
}

export default useFetch;
