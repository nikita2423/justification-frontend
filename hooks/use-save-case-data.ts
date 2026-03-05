import { useState } from "react";
import type { SaveCaseDataDto } from "@/app/api/cases/types";

interface UseSaveCaseDataResponse {
  saveCaseData: (
    caseId: string,
    data: SaveCaseDataDto,
  ) => Promise<{ success: boolean; case?: any; error?: string }>;
  isLoading: boolean;
  error: string | null;
}

export function useSaveCaseData(): UseSaveCaseDataResponse {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveCaseData = async (
    caseId: string,
    data: SaveCaseDataDto,
  ): Promise<{ success: boolean; case?: any; error?: string }> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/cases/${caseId}/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        const errorMessage = result.error || "Failed to save case data";
        setError(errorMessage);
        return {
          success: false,
          error: errorMessage,
        };
      }

      console.log("Case data saved successfully:", result);
      return {
        success: true,
        case: result.case,
      };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to save case data";
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
    saveCaseData,
    isLoading,
    error,
  };
}
