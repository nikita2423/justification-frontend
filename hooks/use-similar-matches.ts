import { useState, useCallback } from "react";

interface SimilarMatchItem {
  PA_Cat?: string;
  desc?: string;
  [key: string]: any;
}

interface SimilarMatchesOptions {
  item: SimilarMatchItem;
  srcField: string;
  datasetName: string;
  datasetType?: string;
  dstField?: string;
  descriptionField?: string;
}

interface SimilarMatch {
  id: string;
  name: string;
  similarity: number;
  category: string;
  description?: string;
}

interface UseSimilarMatchesReturn {
  matches: SimilarMatch[];
  loading: boolean;
  error: string | null;
  fetchSimilarMatches: (options: SimilarMatchesOptions) => Promise<void>;
}

export function useSimilarMatches(): UseSimilarMatchesReturn {
  const [matches, setMatches] = useState<SimilarMatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSimilarMatches = useCallback(
    async (options: SimilarMatchesOptions) => {
      setLoading(true);
      setError(null);
      setMatches([]);

      try {
        const token = localStorage.getItem("authToken") || "";
        const response = await fetch("/api/datasets/match", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(options),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.error ||
              `Failed to fetch similar matches: ${response.statusText}`,
          );
        }

        const data = await response.json();

        // Transform backend response to expected format
        // Use similarMatches array from the API response
        const similarMatchesArray = data?.similarMatches || [];
        const transformedMatches: SimilarMatch[] = similarMatchesArray.map(
          (item: any, index: number) => {
            const dataset = item.dataset || {};
            const metadata = dataset.metadata || {};
            return {
              id: dataset.id || `match-${index}`,
              name: metadata.Prod_Name || metadata.Company || "Unknown",
              similarity: item.score || 0,
              category: metadata.RefL_Cat || metadata.PA_Cat || "",
              description: metadata.Justify || metadata.RefL_Des || "",
              approvalStatus: metadata.Q12a_T4 || "",
              metadata: metadata,
              modelCode: item?.Model_Code || "",
            };
          },
        );

        setMatches(transformedMatches);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error occurred";
        setError(errorMessage);
        console.error("Similar matches error:", err);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return {
    matches,
    loading,
    error,
    fetchSimilarMatches,
  };
}
