import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAdminPage = req.nextUrl.pathname.startsWith("/admin");

    // Om man försöker nå admin men inte är admin, skicka till startpage
    if (isAdminPage && token?.role !== "admin") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  },
  {
    callbacks: {
      // Returnera true här för att låta middleware-funktionen ovan hantera logiken,
      // eller kontrollera att token finns.
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  // Här definierar du exakt vilka stigar som ska trigga inloggningskravet
  matcher: ["/admin/:path*"],
};