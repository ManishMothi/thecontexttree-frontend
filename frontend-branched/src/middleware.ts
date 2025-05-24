import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// public routes
const isPublicRoute = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)", "/"]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: ["/((?!_next/|favicon.ico).*)", "/"],
};
