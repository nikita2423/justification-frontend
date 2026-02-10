import { useState, useCallback, useEffect } from "react";
import type { Case, CaseFilters, GetCasesResponse } from "@/app/api/cases/types";

export function useGetCases(initialFilters?: CaseFilters) {
    const [cases, setCases] = useState<Case[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState<CaseFilters>(initialFilters || {});

    const fetchCases = useCallback(async (customFilters?: CaseFilters) => {
        setIsLoading(true);
        setError(null);

        try {
            const filtersToUse = customFilters || filters;

            // Build query string
            const queryParams = new URLSearchParams();

            if (filtersToUse.status) queryParams.append('status', filtersToUse.status);
            if (filtersToUse.caseNumber) queryParams.append('caseNumber', filtersToUse.caseNumber);
            if (filtersToUse.recdEG !== undefined) queryParams.append('recdEG', String(filtersToUse.recdEG));
            if (filtersToUse.categoryId) queryParams.append('categoryId', filtersToUse.categoryId);
            if (filtersToUse.userId) queryParams.append('userId', filtersToUse.userId);

            const queryString = queryParams.toString();
            const url = `/api/cases${queryString ? `?${queryString}` : ''}`;

            console.log("Fetching cases from:", url);

            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const result: GetCasesResponse = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.error || "Failed to fetch cases");
            }

            console.log("Cases fetched successfully:", result.cases?.length || 0);
            setCases(result.cases || []);
            return result.cases || [];
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "An error occurred while fetching cases";
            console.error("Error fetching cases:", err);
            setError(errorMessage);
            setCases([]);
            return [];
        } finally {
            setIsLoading(false);
        }
    }, [filters]);

    const updateFilters = useCallback((newFilters: CaseFilters) => {
        setFilters(newFilters);
    }, []);

    const refetch = useCallback(() => {
        return fetchCases();
    }, [fetchCases]);

    // Auto-fetch on mount and when filters change
    useEffect(() => {
        fetchCases();
    }, [fetchCases]);

    return {
        cases,
        setCases,
        isLoading,
        error,
        filters,
        updateFilters,
        refetch,
        fetchCases,
    };
}
