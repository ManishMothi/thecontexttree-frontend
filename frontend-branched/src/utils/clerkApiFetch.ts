import { useAuth } from "@clerk/nextjs";

/**
 * Custom hook to get a function that calls your FastAPI backend with the current Clerk session JWT as a Bearer token.
 * Usage:
 *   const clerkApiFetch = useClerkApiFetch();
 *   const res = await clerkApiFetch('http://localhost:8000/auth/clerk_jwt');
 */
export function useClerkApiFetch() {
  const { getToken } = useAuth();

  return async function clerkApiFetch(
    endpoint: string,
    options: RequestInit = {}
  ) {
    const token = await getToken();
    if (!token)
      throw new Error("No Clerk session token found. Are you signed in?");
    console.log("Clerk JWT token:", token);
    const headers = new Headers(options.headers || {});
    headers.set("Authorization", `Bearer ${token}`);
    return fetch(endpoint, {
      ...options,
      headers,
    });
  };
}
