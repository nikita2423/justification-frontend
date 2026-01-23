"use client";

import { useState, useCallback } from "react";

interface UseApiOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  headers?: Record<string, string>;
}

interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

export function useApi<T = any>(url: string, options: UseApiOptions = {}) {
  const [state, setState] = useState<ApiResponse<T>>({
    data: null,
    error: null,
    loading: false,
  });

  const request = useCallback(
    async (body?: any) => {
      setState({ data: null, error: null, loading: true });

      try {
        const fetchOptions: RequestInit = {
          method: options.method || "GET",
          headers: {
            "Content-Type": "application/json",
            ...options.headers,
          },
        };

        if (body) {
          fetchOptions.body = JSON.stringify(body);
        }

        // Get auth token if available
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("accessToken")
            : null;

        if (token && !fetchOptions.headers?.Authorization) {
          (fetchOptions.headers as Record<string, string>).Authorization =
            `Bearer ${token}`;
        }

        const response = await fetch(url, fetchOptions);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.error || `Request failed with status ${response.status}`,
          );
        }

        const data: T = await response.json();
        setState({ data, error: null, loading: false });
        return data;
      } catch (err) {
        const error =
          err instanceof Error ? err.message : "An unexpected error occurred";
        setState({ data: null, error, loading: false });
        throw err;
      }
    },
    [url, options],
  );

  const reset = useCallback(() => {
    setState({ data: null, error: null, loading: false });
  }, []);

  return { ...state, request, reset };
}
