import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// public routes
const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/",
  "/docs",
  "/(images|fonts|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2|ttf|eot|otf))",
]);

export default clerkMiddleware(async (auth, req) => {
  // Skip middleware for public routes and static files
  if (isPublicRoute(req)) {
    return;
  }

  // For all other routes, require authentication
  await auth.protect();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2|ttf|eot|otf|json|txt)$).*)",
    "/",
  ],
};
