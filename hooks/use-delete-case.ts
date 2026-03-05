import { useState } from "react";

interface UseDeleteCaseResponse {
  deleteCase: (caseId: string) => Promise<{ success: boolean; error?: string }>;
  isLoading: boolean;
  error: string | null;
}

export function useDeleteCase(): UseDeleteCaseResponse {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteCase = async (
    caseId: string,
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/cases/${caseId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (!response.ok) {
        const errorMessage = result.error || "Failed to delete case";
        setError(errorMessage);
        return {
          success: false,
          error: errorMessage,
        };
      }

      console.log("Case deleted successfully:", result);
      return {
        success: true,
      };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete case";
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    deleteCase,
    isLoading,
    error,
  };
}
