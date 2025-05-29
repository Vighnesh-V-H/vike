import { isAuthenticationError, isIntegrationError } from "@/lib/exceptions";
import { type NextRequest, NextResponse } from "next/server";

export async function errorHandler(
  request: NextRequest,
  error: unknown
): Promise<NextResponse> {
  if (isAuthenticationError(error)) {
    const redirectUrl = new URL(error.redirectPath, request.url);
    redirectUrl.searchParams.set("error", encodeURIComponent(error.message));
    return NextResponse.redirect(redirectUrl);
  }

  if (isIntegrationError(error)) {
    const redirectUrl = new URL(error.redirectPath, request.url);
    redirectUrl.searchParams.set("error", encodeURIComponent(error.message));
    return NextResponse.redirect(redirectUrl);
  }

  // Handle unknown errors
  const redirectUrl = new URL("/error", request.url);
  redirectUrl.searchParams.set(
    "error",
    encodeURIComponent("An unexpected error occurred")
  );
  return NextResponse.redirect(redirectUrl);
}
