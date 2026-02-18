import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Redirect the root path "/" to "/trade"
export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === "/") {
    const url = new URL("/trade", request.url);
    
    // Preserve query parameters 
    request.nextUrl.searchParams.forEach((value, key) => {
      url.searchParams.set(key, value);
    });
    
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

// Only run this middleware on the root path
export const config = {
  matcher: ["/"],
};
