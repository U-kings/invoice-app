import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyAuthToken } from './lib/auth';

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const token = request.cookies.get('token')?.value;
  const verifiedToken = await verifyAuthToken(token);
  
  const { pathname } = request.nextUrl;

  // 1. Define routes that should NOT be accessible to logged-in users
  const isAuthPage = pathname === '/login' || pathname === '/api/auth/login';

  if (isAuthPage) {
    // If they are logged in and trying to access login page -> Send to dashboard
    if (verifiedToken) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    // If they are not logged in, let them access the login page
    return NextResponse.next();
  }

  // 2. Guarding Dashboard Routes: If no valid token, boot them to login
  if (!verifiedToken) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname); // Remembers where they wanted to go
    return NextResponse.redirect(loginUrl);
  }

  // 3. Token is verified and they are trying to access a dashboard route -> Proceed
  return NextResponse.next();
}

// 4. Update the matcher array to watch both auth pages and dashboard pages
export const config = {
  matcher: [
    '/login',
    '/api/auth/login',
    '/dashboard/:path*', 
  ],
};
