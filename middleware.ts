import { NextResponse, type NextRequest } from "next/server";

function isPublicPath(pathname: string) {
  // Login ve statik dosyalar herkese açık
  if (pathname === "/login") return true;
  if (pathname.startsWith("/_next")) return true;
  if (pathname.startsWith("/favicon")) return true;
  if (pathname.startsWith("/public")) return true;
  if (pathname.startsWith("/api/auth/login")) return true;
  if (pathname.startsWith("/api/auth/logout")) return true;
  return false;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // API dışındaki her sayfayı oturumla koru
  const session = req.cookies.get("nt_session")?.value;
  if (!session) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    const response = NextResponse.redirect(url);
    // Vercel / Next.js önbelleğinin "Giriş sayfasına atma" (307) işlemini hafızaya almasını tamamen engelle.
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    return response;
  }

  // Admin sayfasına sadece admin role ile girilsin
  if (pathname.startsWith("/admin")) {
    const role = req.cookies.get("nt_role")?.value;
    if (role !== "admin") {
      const url = req.nextUrl.clone();
      url.pathname = "/";
      const response = NextResponse.redirect(url);
      response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
      API isteklerini bozmayalım; sadece sayfaları koruyalım.
    */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};

