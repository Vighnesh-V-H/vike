import NextAuth from "next-auth";
import {
  DEFAULT_LOGIN_REDIRECT,
  publicRoutes,
  authRoutes,
  proRoutes,
  enterpriseRoutes,
  DEFAULT_LOGOUT_REDIRECT,
} from "./routes";
import authConfig from "./auth.config";
import { NextResponse } from "next/server";
import { getUserSubscriptionPlan } from "./lib/subscription";

const { auth } = NextAuth(authConfig);

export default auth(async (req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);
  const isProRoute = proRoutes.includes(nextUrl.pathname);
  const isEnterpriseRoute = enterpriseRoutes.includes(nextUrl.pathname);

  if (isAuthRoute) {
    if (isLoggedIn) {
      return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
    }
    return undefined;
  }

  if (!isLoggedIn && !isPublicRoute) {
    return NextResponse.redirect(new URL(DEFAULT_LOGOUT_REDIRECT, nextUrl));
  }

  // Check subscription status for protected routes
  if (isLoggedIn && (isProRoute || isEnterpriseRoute)) {
    const subscriptionPlan = await getUserSubscriptionPlan();

    if (isProRoute && !subscriptionPlan.isSubscribed) {
      return NextResponse.redirect(
        new URL("/settings/billing?error=pro-required", nextUrl)
      );
    }

    if (isEnterpriseRoute && subscriptionPlan.name !== "Enterprise") {
      return NextResponse.redirect(
        new URL("/settings/billing?error=enterprise-required", nextUrl)
      );
    }
  }

  return undefined;
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
