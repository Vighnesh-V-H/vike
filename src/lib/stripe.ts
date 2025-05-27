import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-04-30.basil",
  typescript: true,
});

export const PLANS = {
  FREE: {
    name: "Free",
    price: 0,
    interval: "month",
    features: [
      "10 AI chat messages per day",
      "Basic CRM features",
      "Email support",
      "Single user",
      "Monthly limit resets automatically",
    ],
  },
  PRO: {
    name: "Pro",
    price: 19.99,
    interval: "month",
    stripePriceId: process.env.STRIPE_PRO_PRICE_ID,
    features: [
      "Unlimited AI chat messages",
      "Advanced CRM features",
      "Priority support",
      "Up to 5 team members",
      "Custom workflows",
      "Analytics dashboard",
      "API access",
      "Cancel anytime",
    ],
  },
  ENTERPRISE: {
    name: "Enterprise",
    price: 49.99,
    interval: "month",
    stripePriceId: process.env.STRIPE_ENTERPRISE_PRICE_ID,
    features: [
      "Everything in Pro",
      "Unlimited team members",
      "Dedicated support",
      "Custom AI model training",
      "Advanced analytics",
      "SLA guarantees",
      "Custom integrations",
      "Cancel anytime",
    ],
  },
};
