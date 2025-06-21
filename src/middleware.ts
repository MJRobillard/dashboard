import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const authCookie = request.cookies.get('auth');
  const isAuthPage = request.nextUrl.pathname.startsWith('/auth');
  const isMainPage = request.nextUrl.pathname === '/';
  const isPublicPage = isMainPage || request.nextUrl.pathname.startsWith('/api');

  // If trying to access auth page while logged in, redirect to home
  if (isAuthPage && authCookie) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Allow access to main page and API routes without authentication
  if (isPublicPage) {
    return NextResponse.next();
  }

  // If trying to access protected page while logged out, redirect to auth
  if (!authCookie) {
    return NextResponse.redirect(new URL('/auth', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 