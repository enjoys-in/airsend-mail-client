import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtDecode, JwtPayload } from 'jwt-decode'
import { IUser, ROLE } from './lib/types/user.interface';
import { validateTokenExpiry } from './lib/utils';
 
const regex = /^\/u\/(.+)/;
const hPanelRegex = /^\/h-panel\/(.+)/;

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const access_token = request.cookies.get('access_token')?.value;

    const isLoginPage = pathname === '/v2';
    const isProtectedPath = pathname.startsWith('/v2/u');

    // Case 1: Logged in user accessing login page — redirect to dashboard
    if (access_token && isLoginPage) {
        return NextResponse.redirect(new URL('/v2/u/mail', request.url));
    }

    // Case 2: Not logged in and accessing a protected page — redirect to login
    if (!access_token && isProtectedPath) {
        return NextResponse.redirect(new URL('/v2', request.url));
    }
    if (access_token && isProtectedPath) {
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

// Configure the middleware to match specific paths
export const config = {
    matcher: [
        '/u/:path*', '/h-panel/:path*',
        '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|service-worker.js|.js|.css|.mp3|.svg).*)'],
}
