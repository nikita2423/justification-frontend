import { useState, useCallback } from "react";
import type { UpdateCaseStatusAndJustificationDto, UpdateCaseResponse } from "@/app/api/cases/types";

export function useUpdateCaseStatus() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const updateCaseStatus = useCallback(
        async (
            caseId: string,
            data: UpdateCaseStatusAndJustificationDto
        ): Promise<UpdateCaseResponse | null> => {
            setIsLoading(true);
            setError(null);

            try {
                console.log(`Updating case ${caseId}:`, data);

                const response = await fetch(`/api/cases/${caseId}/status-justification`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(data),
                });

                const result: UpdateCaseResponse = await response.json();

                if (!response.ok || !result.success) {
                    throw new Error(result.error || "Failed to update case");
                }

                console.log("Case updated successfully:", result);
                return result;
            } catch (err) {
                const errorMessage =
                    err instanceof Error
                        ? err.message
                        : "An error occurred while updating the case";
                console.error("Error updating case:", err);
                setError(errorMessage);
                return null;
            } finally {
                setIsLoading(false);
            }
        },
        []
    );

    return {
        updateCaseStatus,
        isLoading,
        error,
    };
}
