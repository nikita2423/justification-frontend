import { useState, useCallback } from "react";

export function useEGUpload() {
  const [egFormData, setEGFormData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadEGForm = useCallback(async (file: File, tranche: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("tranche", tranche);

      const response = await fetch("/api/extract/eg", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload EG form");
      }

      const data = await response.json();
      data.data["Tranche"] = tranche; // Attach tranche info
      setEGFormData(data);
      console.log("EG form data:", data);

      return data;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      setError(errorMessage);
      console.error("Error uploading EG form:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    egFormData,
    isLoading,
    error,
    uploadEGForm,
  };
}
