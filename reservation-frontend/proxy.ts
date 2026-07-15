import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import { isPathAllowed } from "@/config/permissions";

const secret = process.env.NEXTAUTH_SECRET;

const PUBLIC_PATHS = ["/login", "/forget_password", "/reset-password", "/unauthorized", "/api/auth"];

function redirectToLogin(req: NextRequest, pathname: string) {
  const loginUrl = new URL("/login", req.url);
  loginUrl.searchParams.set("redirect", pathname);
  const response = NextResponse.redirect(loginUrl);

  // ล้าง cookie session ที่ใช้ไม่ได้แล้วทิ้งไปเลย ไม่ปล่อยค้างในเบราว์เซอร์
  // (ชื่อ cookie เปลี่ยนเป็น __Secure- prefix อัตโนมัติเมื่อ NEXTAUTH_URL เป็น https)
  response.cookies.delete("next-auth.session-token");
  response.cookies.delete("__Secure-next-auth.session-token");

  return response;
}

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

  let token: Awaited<ReturnType<typeof getToken>> = null;
  try {
    token = await getToken({ req, secret });
  } catch (error) {
    // cookie เสีย/ถอดรหัสไม่ได้ (เช่น secret เปลี่ยน, cookie ค้างจากก่อนสลับ http เป็น https)
    // ต้องจับไว้ ไม่งั้น middleware จะ throw ไม่ตอบ request เลย ทำให้หน้าเว็บค้างโหลดตลอด
    console.error("[proxy] getToken failed:", error);
    return redirectToLogin(req, pathname);
  }

  // token หมดอายุ → authOptions.jwt() คืน {} แต่ NextAuth ยังเข้ารหัสเป็น JWE ที่ valid อยู่ดี
  // (มี iat/exp/jti มาตรฐานติดมา) ดังนั้น token จะไม่ใช่ null/ว่างเปล่า แค่ไม่มี UserID
  // ต้องเช็ค UserID ร่วมกับ token ว่างเปล่า ไม่งั้นจะหลุดไปเข้าเงื่อนไข "ไม่มีสิทธิ์" แทน "ยังไม่ login"
  if (!token || Object.keys(token).length === 0 || !token.UserID) {
    return redirectToLogin(req, pathname);
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
