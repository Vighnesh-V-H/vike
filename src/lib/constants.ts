import {
  BookOpen,
  Bot,
  BotIcon,
  LayoutDashboardIcon,
  LineChart,
  Mail,
  MessageSquare,
  Settings,
  Settings2,
  Shield,
  Sparkles,
  SquareTerminal,
  Target,
  Users,
  Workflow,
  Zap,
  Github,
  Twitter,
  Slack,
  Database,
  Cloud,
  CreditCard,
  BarChart,
  FileText,
  HardDrive,
} from "lucide-react";

import {
  FAQItem,
  Integration,
  FeatureItem,
  NavItem,
  PricingPlan,
  Testimonial,
} from "./types";

export const faqItems: FAQItem[] = [
  {
    question: "How does the AI agent automation work?",
    answer:
      "Our AI agents use natural language processing and machine learning to understand customer inquiries, provide relevant responses, and take appropriate actions. They learn from each interaction to continuously improve their performance and can be customized to match your brand voice and business rules.",
  },
  {
    question: "Can I integrate AutoCRM with my existing tools?",
    answer:
      "Yes, AutoCRM offers seamless integration with popular business tools including Salesforce, HubSpot, Slack, Microsoft Teams, Google Workspace, and many more. We also provide an API for custom integrations with your proprietary systems.",
  },
  {
    question: "Is my customer data secure?",
    answer:
      "Absolutely. We implement bank-level encryption, regular security audits, and comply with GDPR, CCPA, and other data protection regulations. Your data is stored in SOC 2 compliant data centers, and we offer data residency options for businesses with specific geographic requirements.",
  },
  {
    question: "How long does it take to implement AutoCRM?",
    answer:
      "Most customers are up and running within 1-2 weeks. Our onboarding team will guide you through the setup process, help with data migration, and provide training for your team. For enterprise customers with complex requirements, we offer custom implementation plans.",
  },
  {
    question: "Do you offer a free trial?",
    answer:
      "Yes, we offer a 14-day free trial with full access to all features. No credit card is required to start your trial. You can also request a personalized demo to see how AutoCRM can address your specific business needs.",
  },
  {
    question: "How does billing work?",
    answer:
      "We offer monthly and annual billing options, with a 20% discount for annual plans. You can upgrade, downgrade, or cancel your subscription at any time. We also offer custom enterprise pricing for large organizations with specific requirements.",
  },
];

export const features: FeatureItem[] = [
  {
    title: "AI Agent Automation",
    description:
      "Our intelligent agents handle routine customer interactions, schedule follow-ups, and provide personalized responses based on customer history and preferences.",
    icon: "Bot",
    size: "large",
    image: {
      src: "/placeholder.svg?height=300&width=600",
      alt: "AI Agent Dashboard",
    },
  },
  {
    title: "Advanced Analytics",
    description:
      "Gain insights from customer data with powerful analytics and visualization tools.",
    icon: "BarChart3",
  },
  {
    title: "Customer Segmentation",
    description:
      "Automatically segment customers based on behavior, preferences, and engagement.",
    icon: "Users",
  },
  {
    title: "Smart Conversations",
    description:
      "AI-powered chat that understands context and customer history for better interactions.",
    icon: "MessageSquare",
  },
  {
    title: "Automated Scheduling",
    description:
      "Let AI handle appointment scheduling and follow-ups with smart calendar integration.",
    icon: "Calendar",
  },
  {
    title: "Workflow Automation",
    description:
      "Create custom workflows that automate repetitive tasks, trigger actions based on customer behavior, and ensure consistent follow-up. Our drag-and-drop workflow builder makes it easy to design complex automation without coding.",
    icon: "Zap",
    size: "wide",
    image: {
      src: "/placeholder.svg?height=200&width=500",
      alt: "Workflow Automation",
    },
  },
  {
    title: "Predictive Insights",
    description:
      "Forecast customer needs and identify opportunities with AI-powered predictions.",
    icon: "LineChart",
  },
  {
    title: "Email Campaigns",
    description:
      "Create and automate personalized email campaigns with AI-generated content.",
    icon: "Mail",
  },
  {
    title: "Enterprise Security",
    description:
      "Bank-level encryption and compliance features to keep your customer data safe.",
    icon: "ShieldCheck",
  },
];

export const navItems: NavItem[] = [
  {
    title: "Features",
    href: "#features",
  },
  {
    title: "Pricing",
    href: "#pricing",
  },
  {
    title: "Testimonials",
    href: "#testimonials",
  },
  {
    title: "Contact",
    href: "#contact",
  },
];

export const footerNavigation = {
  product: [
    { title: "Features", href: "#features" },
    { title: "Pricing", href: "#pricing" },
    { title: "Integrations", href: "#integrations" },
    { title: "Changelog", href: "#changelog" },
    { title: "Roadmap", href: "#roadmap" },
  ],
  company: [
    { title: "About", href: "#about" },
    { title: "Blog", href: "#blog" },
    { title: "Careers", href: "#careers" },
    { title: "Customers", href: "#customers" },
    { title: "Contact", href: "#contact" },
  ],
  legal: [
    { title: "Privacy Policy", href: "#privacy" },
    { title: "Terms of Service", href: "#terms" },
    { title: "Cookie Policy", href: "#cookies" },
  ],
  social: [
    { title: "Facebook", href: "#", icon: "Facebook" },
    { title: "Twitter", href: "#", icon: "Twitter" },
    { title: "Instagram", href: "#", icon: "Instagram" },
    { title: "LinkedIn", href: "#", icon: "Linkedin" },
    { title: "GitHub", href: "#", icon: "Github" },
  ],
};

export const pricingPlans: PricingPlan[] = [
  {
    name: "Starter",
    description: "For small businesses",
    price: 49,
    features: [
      "1 AI agent",
      "Up to 500 contacts",
      "Basic analytics",
      "Email support",
      "5 automation workflows",
    ],
    buttonText: "Get Started",
    buttonVariant: "outline",
  },
  {
    name: "Professional",
    description: "For growing teams",
    price: 99,
    popular: true,
    features: [
      "3 AI agents",
      "Up to 2,500 contacts",
      "Advanced analytics",
      "Priority support",
      "20 automation workflows",
      "Custom integrations",
    ],
    buttonText: "Get Started",
  },
  {
    name: "Enterprise",
    description: "For large organizations",
    price: 249,
    features: [
      "Unlimited AI agents",
      "Unlimited contacts",
      "Custom reporting",
      "24/7 dedicated support",
      "Unlimited automation workflows",
      "Advanced security features",
      "Custom AI training",
    ],
    buttonText: "Contact Sales",
    buttonVariant: "outline",
  },
];

export const testimonials: Testimonial[] = [
  {
    content:
      "AutoCRM has transformed how we manage customer relationships. The AI agents have saved our team countless hours on routine tasks, allowing us to focus on strategic initiatives.",
    author: {
      name: "Sarah Johnson",
      role: "Head of Customer Success",
      company: "TechGrowth Inc.",
      image: "/placeholder.svg?height=100&width=100",
    },
  },
  {
    content:
      "The predictive insights feature has been a game-changer for our sales team. We're now able to anticipate customer needs before they even express them.",
    author: {
      name: "Michael Chen",
      role: "Sales Director",
      company: "Innovate Solutions",
      image: "/placeholder.svg?height=100&width=100",
    },
  },
  {
    content:
      "Implementation was seamless, and the ROI was evident within the first month. Our customer satisfaction scores have increased by 35% since adopting AutoCRM.",
    author: {
      name: "Emily Rodriguez",
      role: "CTO",
      company: "FutureTech",
      image: "/placeholder.svg?height=100&width=100",
    },
  },
  {
    content:
      "The workflow automation capabilities are incredibly intuitive. We've been able to create complex customer journeys without writing a single line of code.",
    author: {
      name: "David Wilson",
      role: "Marketing Manager",
      company: "Growth Ventures",
      image: "/placeholder.svg?height=100&width=100",
    },
  },
];

export const sideBarOptions = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboardIcon,
    },

    {
      title: "Leads",
      url: "/leads",
      icon: Mail,
    },
    {
      title: "Tasks",
      url: "#",
      icon: BookOpen,
    },
    {
      title: "Settings",
      url: "/settings",
      icon: Settings,
    },
    {
      title: "Integrations",
      url: "/integrations",
      icon: Workflow,
    },
    {
      title: "Agent",
      url: "/agent",
      icon: BotIcon,
      isActive: true,
    },
  ],
};

export const integrations: Integration[] = [
  {
    name: "Google Drive",
    description: "Connect to Google Drive for document storage and sharing.",
    icon: HardDrive,
    redirectUrl: "https://accounts.google.com/o/oauth2/auth",
    color: "bg-blue-500",
  },
  {
    name: "GitHub",
    description: "Connect your GitHub repositories for seamless integration.",
    icon: Github,
    redirectUrl: "https://github.com/login/oauth/authorize",
    color: "bg-gray-900",
  },
  {
    name: "Twitter",
    description: "Share updates and connect with your audience on Twitter.",
    icon: Twitter,
    redirectUrl: "https://twitter.com/oauth",
    color: "bg-blue-400",
  },
  {
    name: "Slack",
    description:
      "Get notifications and updates directly in your Slack workspace.",
    icon: Slack,
    redirectUrl: "https://slack.com/oauth/authorize",
    color: "bg-purple-500",
  },

  {
    name: "Notion",
    description:
      "Integrate with Notion for notes, documents, and project management.",
    icon: FileText,
    redirectUrl: "https://api.notion.com/v1/oauth/authorize",
    color: "bg-gray-800",
  },
];
