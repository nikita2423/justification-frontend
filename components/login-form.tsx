"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Package, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useLogin } from "@/hooks/use-login";

const LoginForm = () => {
  const router = useRouter();
  const { login, loading, error: loginError } = useLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");

      try {
        await login({ email, password });
        // Redirect to dashboard on successful login
        // router.push("/");
        window.location.href = "/";
      } catch (err) {
        // Error is already set by the hook
      }
    },
    [email, password, login, router],
  );

  const displayError = error || loginError;
  return (
    <div className="bg-card rounded-lg border p-8 space-y-6 shadow-lg">
      {/* Logo */}
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
          <Package className="w-6 h-6 text-primary" />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">
            Justification Suggestor
          </h1>
          <p className="text-sm text-muted-foreground">
            Data Management & Approval System
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleLogin} className="space-y-4">
        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            className="bg-background"
          />
        </div>

        {/* Password */}
        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium">
            Password
          </Label>
          <Input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            className="bg-background"
          />
        </div>

        {/* Error Alert */}
        {displayError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{displayError}</AlertDescription>
          </Alert>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={loading || !email || !password}
          className="w-full"
        >
          {loading ? "Logging in..." : "Login"}
        </Button>
      </form>

      {/* Demo Credentials */}
      <div className="pt-4 border-t">
        <p className="text-xs text-muted-foreground text-center mb-2">
          Demo Credentials:
        </p>
        <div className="text-xs bg-muted p-3 rounded-lg space-y-1">
          <p>
            <span className="font-semibold">Email:</span> user@test.com
          </p>
          <p>
            <span className="font-semibold">Password:</span>{" "}
            !CaseManagement@2025
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
