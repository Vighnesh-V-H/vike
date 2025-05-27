export const publicRoutes = [
  "/",
  "/privacy",
  "/terms",
  "/cookies",
  "/about",
  "/blog",
  "/careers",
  "/customers",
  "/contact",
  "/features",
  "/api/stripe/webhook",
];

export const authRoutes = [
  "/signin",
  "/signup",
  "/verify-mail",
  "/forgot-password",
  "/reset-password",
];

// Routes that require a Pro subscription
export const proRoutes = [
  "/dashboard/analytics",
  "/api/ai/advanced",
  "/settings/team",
  "/settings/api",
];

// Routes that require an Enterprise subscription
export const enterpriseRoutes = [
  "/settings/custom-models",
  "/api/ai/custom-models",
  "/settings/sla",
];

export const DEFAULT_LOGOUT_REDIRECT = "/signin";

export const DEFAULT_LOGIN_REDIRECT = "/integrations";
