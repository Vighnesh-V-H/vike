import type { LucideIcon } from "lucide-react";

export type FAQItem = {
  question: string;
  answer: string;
};

export interface Integration {
  name: string;
  description: string;
  icon: LucideIcon;
  redirectUrl: string;
  color: string;
}

export type FeatureItem = {
  title: string;
  description: string;
  icon: string;
  size?: "small" | "large" | "wide";
  image?: {
    src: string;
    alt: string;
    width?: number;
    height?: number;
  };
};

export type NavItem = {
  title: string;
  href: string;
  external?: boolean;
};

export type PricingPlan = {
  name: string;
  description: string;
  price: number;
  popular?: boolean;
  features: string[];
  buttonText: string;
  buttonVariant?: "default" | "outline";
};

export type Testimonial = {
  content: string;
  author: {
    name: string;
    role: string;
    company: string;
    image?: string;
  };
};
