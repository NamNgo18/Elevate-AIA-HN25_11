/**
 * Custom React hook for API calls with built-in loading, error handling, and state management.
 * Provides a consistent pattern for all API interactions across the application.
 */

import { useState, useCallback } from "react";
import { toast } from "sonner";

export interface ApiState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

export interface UseApiOptions {
  /** Show toast notification on error */
  showErrorToast?: boolean;
  /** Custom error message prefix */
  errorPrefix?: string;
  /** Show toast notification on success */
  showSuccessToast?: boolean;
  /** Custom success message */
  successMessage?: string;
}

const defaultOptions: UseApiOptions = {
  showErrorToast: true,
  errorPrefix: "Error",
  showSuccessToast: false,
  successMessage: "Operation completed successfully",
};

/**
 * A hook for making API calls with automatic state management
 * @template T The expected response data type
 */
export function useApi<T = unknown>() {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    isLoading: false,
    error: null,
  });

  const execute = useCallback(
    async (
      asyncFn: () => Promise<T>,
      options: UseApiOptions = {}
    ): Promise<T | null> => {
      const opts = { ...defaultOptions, ...options };

      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const result = await asyncFn();
        setState({ data: result, isLoading: false, error: null });

        if (opts.showSuccessToast) {
          toast.success(opts.successMessage);
        }

        return result;
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.error ||
          err?.response?.data?.message ||
          err?.message ||
          "An unexpected error occurred";

        const fullErrorMessage = `${opts.errorPrefix}: ${errorMessage}`;

        setState({ data: null, isLoading: false, error: fullErrorMessage });

        if (opts.showErrorToast) {
          toast.error(fullErrorMessage);
        }

        console.error(`API Error: ${fullErrorMessage}`, err);
        return null;
      }
    },
    []
  );

  const reset = useCallback(() => {
    setState({ data: null, isLoading: false, error: null });
  }, []);

  return {
    ...state,
    execute,
    reset,
    setData: (data: T | null) => setState((prev) => ({ ...prev, data })),
  };
}

/**
 * A simpler hook for one-off API calls that just returns loading state
 */
export function useApiCall() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(
    async <T>(
      asyncFn: () => Promise<T>,
      options: UseApiOptions = {}
    ): Promise<T | null> => {
      const opts = { ...defaultOptions, ...options };

      setIsLoading(true);
      setError(null);

      try {
        const result = await asyncFn();

        if (opts.showSuccessToast) {
          toast.success(opts.successMessage);
        }

        return result;
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.error ||
          err?.response?.data?.message ||
          err?.message ||
          "An unexpected error occurred";

        const fullErrorMessage = `${opts.errorPrefix}: ${errorMessage}`;
        setError(fullErrorMessage);

        if (opts.showErrorToast) {
          toast.error(fullErrorMessage);
        }

        console.error(`API Error: ${fullErrorMessage}`, err);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return { isLoading, error, execute };
}
