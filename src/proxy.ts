import { NextResponse, type NextRequest } from "next/server";

const USER_SESSION_COOKIE = "earlyn_session";
const SUPERADMIN_SESSION_COOKIE = "earlyn_superadmin_session";
const SESSION_VALUE = "authenticated";

const isUserDashboardPath = (pathname: string) =>
  pathname === "/dashboard" ||
  pathname.startsWith("/dashboard/") ||
  pathname === "/investee-dashboard" ||
  pathname.startsWith("/investee-dashboard/");

const isSuperadminDashboardPath = (pathname: string) =>
  pathname === "/superadmin/dashboard" || pathname.startsWith("/superadmin/dashboard/");

const buildLoginRedirect = (request: NextRequest, loginPath: string) => {
  const url = request.nextUrl.clone();
  url.pathname = loginPath;
  url.search = "";
  url.searchParams.set("redirect", `${request.nextUrl.pathname}${request.nextUrl.search}`);
  return NextResponse.redirect(url);
};

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (isUserDashboardPath(pathname) && request.cookies.get(USER_SESSION_COOKIE)?.value !== SESSION_VALUE) {
    return buildLoginRedirect(request, "/login");
  }

  if (
    isSuperadminDashboardPath(pathname) &&
    request.cookies.get(SUPERADMIN_SESSION_COOKIE)?.value !== SESSION_VALUE
  ) {
    return buildLoginRedirect(request, "/superadmin/auth/login");
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/investee-dashboard/:path*", "/superadmin/dashboard/:path*"],
};
