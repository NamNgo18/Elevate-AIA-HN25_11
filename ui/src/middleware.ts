import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // If visiting the root `/`, redirect to your default page
  if (pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/cv"; // Change to your desired default page
    return NextResponse.redirect(url);
  }

  // Otherwise, continue normally
  return NextResponse.next();
}

// Only run middleware for pages (not static files or APIs)
export const config = {
  matcher: [
    // Match everything except _next/static, _next/image, favicon, etc.
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
