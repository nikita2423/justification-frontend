"use client";

import { useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { accessToken, isLoading } = useAuth();

  console.log("ProtectedRoute - accessToken:", accessToken);

  useEffect(() => {
    if (!isLoading && !accessToken) {
      router.push("/login");
    }
  }, [accessToken, isLoading]);

  console.log(
    "ProtectedRoute - isLoading:",
    isLoading,
    "accessToken:",
    accessToken,
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!accessToken) {
    return null;
  }

  return <>{children}</>;
}
