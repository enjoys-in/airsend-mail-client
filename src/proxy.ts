import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtDecode, JwtPayload } from 'jwt-decode'
import { IUser, ROLE } from './lib/types/user.interface';
import { validateTokenExpiry } from './lib/utils';

const regex = /^\/u\/(.+)/;
const hPanelRegex = /^\/h-panel\/(.+)/;

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const access_token = request.cookies.get('access_token')?.value;
    const isValidToken = access_token ? validateTokenExpiry(access_token) : false;

    const isLoginPage = pathname === '/v2';
    const isProtectedPath = pathname.startsWith('/v2/u');

    // Case 1: Logged in user with VALID token accessing login page — redirect to dashboard
    if (isValidToken && isLoginPage) {
        return NextResponse.redirect(new URL('/v2/u/mail', request.url));
    }

    // Case 2: No token OR expired token, accessing protected page — redirect to login
    if (!isValidToken && isProtectedPath) {
        const response = NextResponse.redirect(new URL('/v2', request.url));
        // Clear the expired cookie server-side to prevent redirect loop
        if (access_token) {
            response.cookies.delete('access_token');
        }
        return response;
    }

    if (isValidToken && isProtectedPath) {
        return NextResponse.next();
    }

    const hPanelPath = ['/h-panel'];
    // if (pathname.startsWith("/h-panel")) {
    //     return NextResponse.redirect(new URL("/maintainance", request.nextUrl));
    // }

    const admin_access_token = request.cookies.get('admin_access_token')?.value || undefined;

    const admin = admin_access_token ? (jwtDecode(admin_access_token as string) as IUser & JwtPayload) || undefined : undefined;

    if ((!admin_access_token || admin?.role !== ROLE.ADMIN) && hPanelRegex.test(pathname)) {
        return NextResponse.redirect(new URL('/h-panel', request.nextUrl));
    }
    if (admin_access_token && validateTokenExpiry(admin_access_token) && admin?.role === ROLE.ADMIN && hPanelPath.includes(pathname)) {
        return NextResponse.redirect(new URL('/h-panel/dashboard', request.nextUrl));
    }

    return NextResponse.next();
}

// Configure the middleware to match only routes that need auth checks
export const config = {
    matcher: [
        '/u/:path*',
        '/v2/:path*',
        '/h-panel/:path*',
    ],
}
