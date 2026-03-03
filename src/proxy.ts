import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const cookies = request.cookies;

  const maintenance = process.env.NEXT_PUBLIC_MAINTENANCE || process.env.MAINTENANCE;

  // Check for Maintenance Mode Bypass
  const isAdminParam = searchParams.get('admin') === 'true';
  const isPreviewParam = searchParams.get('preview') === 'true';
  const hasBypassCookie = cookies.get('maintenance_bypass')?.value === 'true';

  if (maintenance === 'true') {
    // 1. If we see the admin bypass param AND we haven't set the cookie yet, set it and redirect
    if (isAdminParam && !hasBypassCookie) {
      const targetUrl = isPreviewParam ? '/?admin=true&preview=true' : '/admin?admin=true';
      const response = NextResponse.redirect(new URL(targetUrl, request.url));
      response.cookies.set('maintenance_bypass', 'true', { path: '/', maxAge: 3600 });
      return response;
    }

    // 2. If already bypassed (cookie or param), allow the request (including API calls)
    if (isAdminParam || hasBypassCookie) {
      return NextResponse.next();
    }

    // 3. Normal maintenance redirection
    if (
      !pathname.startsWith('/maintenance') &&
      !pathname.startsWith('/api') && // Exclude API to avoid sending HTML to JSON requests
      !pathname.startsWith('/_next') &&
      !pathname.startsWith('/favicon.ico') &&
      !pathname.includes('.') // Static assets
    ) {
      return NextResponse.redirect(new URL('/maintenance', request.url));
    }
  }

  // Clear bypass cookie if maintenance is turned off and it still exists
  if (maintenance !== 'true' && hasBypassCookie) {
    const response = NextResponse.next();
    response.cookies.delete('maintenance_bypass');
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/((?!_next/static|_next/image|favicon.ico).*)',
};
