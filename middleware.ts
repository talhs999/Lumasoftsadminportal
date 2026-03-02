import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const ADMIN_ONLY_ROUTES = ["/dashboard/employees"];

export async function middleware(request: NextRequest) {
    const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
    });

    const { pathname } = request.nextUrl;

    // Redirect root to login
    if (pathname === "/") {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    // Protect /dashboard/* routes
    if (pathname.startsWith("/dashboard")) {
        if (!token) {
            return NextResponse.redirect(new URL("/login", request.url));
        }

        // Admin-only routes
        for (const route of ADMIN_ONLY_ROUTES) {
            if (pathname.startsWith(route) && token.role !== "admin") {
                return NextResponse.redirect(new URL("/dashboard", request.url));
            }
        }
    }

    // Redirect logged-in users away from login
    if (pathname === "/login" && token) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/", "/login", "/dashboard/:path*"],
};
