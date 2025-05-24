"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useClerkApiFetch } from "@/utils/clerkApiFetch";

export default function AfterSignUp() {
  const clerkApiFetch = useClerkApiFetch();
  const router = useRouter();
  const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

  useEffect(() => {
    // Call backend to ensure user exists in DB
    clerkApiFetch(`${API_BASE}/api/v1/auth/clerk_jwt`, { method: "POST" })
      .then(() => {
        // Optionally handle errors here
        // Always redirect to dashboard after attempt
        router.replace("/dashboard");
      })
      .catch(() => {
        // On error, still redirect
        router.replace("/dashboard");
      });
  }, [clerkApiFetch, router, API_BASE]);

  return (
    <main className="flex min-h-screen items-center justify-center">
      <span className="text-muted-foreground">Setting up your account...</span>
    </main>
  );
}
