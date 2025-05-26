export class IntegrationError extends Error {
  constructor(
    message: string,
    public code: string = "INTEGRATION_ERROR",
    public redirectPath: string = "/integrations"
  ) {
    super(message);
    this.name = "IntegrationError";
  }
}

export class AuthenticationError extends Error {
  constructor(
    message: string = "Authentication required",
    public code: string = "AUTHENTICATION_ERROR",
    public redirectPath: string = "/signin"
  ) {
    super(message);
    this.name = "AuthenticationError";
  }
}

export function isIntegrationError(error: unknown): error is IntegrationError {
  return error instanceof IntegrationError;
}

export function isAuthenticationError(
  error: unknown
): error is AuthenticationError {
  return error instanceof AuthenticationError;
}
