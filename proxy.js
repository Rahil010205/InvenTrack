import { NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/auth';

export async function proxy(request) {
  const { pathname } = request.nextUrl;
  const protectedRoutes = ['/dashboard', '/products', '/receipts', '/deliveries', '/transfers', '/adjustments', '/ledger'];
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

  if (isProtectedRoute) {
    const token = request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    const payload = await verifyJWT(token);

    if (!payload) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
