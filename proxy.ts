import { NextResponse, type NextRequest } from "next/server";

const ADMIN_USER = "admin";

function unauthorized() {
  return new NextResponse("Authentication required", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Mesta admin"' },
  });
}

export function proxy(request: NextRequest) {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    // No password configured — fail closed rather than leave /admin open by accident.
    return new NextResponse("ADMIN_PASSWORD is not set — see .env.example", { status: 500 });
  }

  const header = request.headers.get("authorization");
  if (!header?.startsWith("Basic ")) return unauthorized();

  const decoded = atob(header.slice(6));
  const separatorIndex = decoded.indexOf(":");
  const user = separatorIndex === -1 ? decoded : decoded.slice(0, separatorIndex);
  const pass = separatorIndex === -1 ? "" : decoded.slice(separatorIndex + 1);

  if (user !== ADMIN_USER || pass !== adminPassword) {
    return unauthorized();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
