"use client";

import { Button } from "@/components/ui/button";
import { Check, Sparkles } from "lucide-react";
import { pricingPlans } from "@/lib/constants";
import { motion } from "motion/react";
import Link from "next/link";

export default function Pricing() {
  return (
    <section className='py-20 bg-muted/30' id='pricing'>
      <div className='container px-4 md:px-6'>
        <motion.div
          className='flex flex-col items-center justify-center space-y-4 text-center mb-16'
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}>
          <span className='inline-block px-3 py-1 text-sm font-medium text-primary border border-primary/30 rounded-full bg-primary/10'>
            Pricing Plans
          </span>
          <h2 className='text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl'>
            Choose the Right Plan for Your Business
          </h2>
          <p className='max-w-[700px] text-muted-foreground md:text-xl'>
            All plans include a 14-day free trial. No credit card required.
          </p>
        </motion.div>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
          {pricingPlans.map((plan, index) => (
            <motion.div
              key={index}
              className={`rounded-xl overflow-hidden border ${
                plan.popular
                  ? "border-primary/50 bg-primary/5"
                  : "bg-background"
              } shadow-sm relative flex flex-col h-full`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{
                y: -5,
                transition: { duration: 0.3 },
              }}>
              {plan.popular && (
                <div className='absolute top-0 right-0'>
                  <div className='bg-primary text-primary-foreground text-xs font-medium py-1 px-3 rounded-bl-lg flex items-center gap-1'>
                    <Sparkles className='h-3 w-3' />
                    Most Popular
                  </div>
                </div>
              )}
              <div className='p-6 flex flex-col h-full'>
                <div className='mb-6'>
                  <h3 className='text-2xl font-bold'>{plan.name}</h3>
                  <p className='text-muted-foreground mt-1'>
                    {plan.description}
                  </p>
                </div>
                <div className='mb-6'>
                  <span className='text-4xl font-bold'>${plan.price}</span>
                  <span className='text-muted-foreground'>/month</span>
                  {plan.popular && (
                    <p className='text-sm text-primary mt-1'>
                      Save 20% with annual billing
                    </p>
                  )}
                </div>
                <ul className='space-y-3 mb-8 flex-grow'>
                  {plan.features.map((feature, i) => (
                    <motion.li
                      key={i}
                      className='flex items-start gap-2'
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 + i * 0.1 }}>
                      <Check className='h-5 w-5 text-primary shrink-0 mt-0.5' />
                      <span>{feature}</span>
                    </motion.li>
                  ))}
                </ul>
                <Link
                  href={
                    plan.name === "Enterprise"
                      ? "/contact?enterprise=true"
                      : "/signup"
                  }>
                  <Button
                    size='lg'
                    className={`w-full ${
                      plan.popular ? "" : "bg-primary/90 hover:bg-primary"
                    }`}
                    variant={plan.buttonVariant || "default"}>
                    {plan.buttonText}
                  </Button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          className='mt-16 text-center max-w-2xl mx-auto'
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.5 }}>
          <h3 className='text-xl font-bold mb-3'>Need a custom solution?</h3>
          <p className='text-muted-foreground mb-6'>
            Our enterprise plan can be tailored to meet your specific business
            needs. Contact our sales team for a personalized quote.
          </p>
          <Link href='/contact?enterprise=true'>
            <Button variant='outline' size='lg'>
              Contact Sales
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
