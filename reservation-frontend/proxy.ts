// proxy.ts — Next.js 16 rename of middleware.ts (same runtime behavior)
// ตรวจ session จาก JWT cookie ตรงๆ ด้วย NEXTAUTH_SECRET เดียวกับ Portal
// ไม่เรียก API ของ Portal เลย — ถ้า Portal ล่ม reservation ยังใช้งานต่อได้
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import { isPathAllowed } from "@/config/permissions";

const secret = process.env.NEXTAUTH_SECRET;

const PUBLIC_PATHS = ["/login", "/forget_password", "/reset-password", "/unauthorized", "/api/auth"];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (
    pathname.startsWith("/_next/static") ||
    pathname.startsWith("/_next/image") ||
    pathname === "/favicon.ico" ||
    pathname.endsWith(".png") ||
    pathname.endsWith(".jpg") ||
    pathname.endsWith(".jpeg") ||
    pathname.endsWith(".svg") ||
    pathname.endsWith(".ico")
  ) {
    return NextResponse.next();
  }

  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const token = await getToken({ req, secret });

  if (!token || Object.keys(token).length === 0) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const userId = token.UserID;
  if (!userId) {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  const roleId = Number(token.role_id);
  if (!isPathAllowed(pathname, roleId)) {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.svg|.*\\.ico).*)",
  ],
};
