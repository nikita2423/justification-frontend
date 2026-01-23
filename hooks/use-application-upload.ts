import { useState, useCallback } from "react";

export function useApplicationUpload() {
  const [applicationFormData, setApplicationFormData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadApplicationForm = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/extract/application", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload application form");
      }

      const data = await response.json();
      setApplicationFormData(data);
      console.log("Application form data:", data);

      return data;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      setError(errorMessage);
      console.error("Error uploading application form:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    applicationFormData,
    isLoading,
    error,
    uploadApplicationForm,
  };
}
