import { Metadata } from "next";
import { Card } from "@/components/ui/card";
import {
  Bot,
  BarChart3,
  Users,
  MessageSquare,
  Calendar,
  Zap,
  LineChart,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { features } from "@/lib/constants";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Features | Vike",
  description:
    "Explore all the powerful features of Vike's AI-powered CRM platform",
};

const FeatureIcon = ({ name }: { name: string }) => {
  const icons = {
    Bot,
    BarChart3,
    Users,
    MessageSquare,
    Calendar,
    Zap,
    LineChart,
    Mail,
    ShieldCheck,
  };
  const Icon = icons[name as keyof typeof icons];
  return Icon ? <Icon className='w-6 h-6 text-primary' /> : null;
};

export default function Features() {
  return (
    <div className='max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8'>
      <div className='text-center mb-16'>
        <h1 className='text-4xl font-bold mb-4'>
          Powerful Features for Modern Businesses
        </h1>
        <p className='text-xl text-muted-foreground max-w-3xl mx-auto'>
          Discover how Vike's comprehensive suite of AI-powered features can
          transform your customer relationships.
        </p>
      </div>

      <div className='space-y-24'>
        {features.map((feature, index) =>
          feature.size === "large" || feature.size === "wide" ? (
            <section
              key={feature.title}
              className='grid grid-cols-1 lg:grid-cols-2 gap-12 items-center'>
              <div className={index % 2 === 0 ? "order-1 lg:order-none" : ""}>
                <h2 className='text-3xl font-bold mb-4'>{feature.title}</h2>
                <p className='text-muted-foreground mb-6'>
                  {feature.description}
                </p>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                  <Card className='p-4'>
                    <h3 className='font-medium mb-2'>Smart Learning</h3>
                    <p className='text-sm text-muted-foreground'>
                      AI agents learn from every interaction to provide better
                      responses over time.
                    </p>
                  </Card>
                  <Card className='p-4'>
                    <h3 className='font-medium mb-2'>Customizable</h3>
                    <p className='text-sm text-muted-foreground'>
                      Tailor responses and actions to match your brand voice and
                      business rules.
                    </p>
                  </Card>
                </div>
              </div>
              <div className='relative aspect-video'>
                <Image
                  src={feature.image?.src || "/placeholder.svg"}
                  alt={feature.image?.alt || feature.title}
                  className='rounded-lg shadow-lg'
                />
              </div>
            </section>
          ) : (
            <section key={feature.title} className='border-t pt-12'>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
                <Card className='p-6'>
                  <div className='mb-4'>
                    <FeatureIcon name={feature.icon} />
                  </div>
                  <h3 className='text-xl font-semibold mb-2'>
                    {feature.title}
                  </h3>
                  <p className='text-muted-foreground'>{feature.description}</p>
                </Card>
              </div>
            </section>
          )
        )}
      </div>

      <section className='mt-24 text-center'>
        <h2 className='text-3xl font-bold mb-4'>
          Ready to Transform Your Customer Relationships?
        </h2>
        <p className='text-xl text-muted-foreground mb-8'>
          Join thousands of businesses already using Vike to automate and
          enhance their customer interactions.
        </p>
        <div className='space-x-4'>
          <a
            href='/signup'
            className='inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2'>
            Get Started
          </a>
          <a
            href='/contact'
            className='inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2'>
            Contact Sales
          </a>
        </div>
      </section>
    </div>
  );
}
