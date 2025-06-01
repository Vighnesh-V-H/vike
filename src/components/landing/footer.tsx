"use client";

import { footerNavigation } from "@/lib/constants";
import { motion } from "motion/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Github, Twitter } from "lucide-react";

export default function Footer() {
  return (
    <footer className='bg-muted/30 border-t'>
      <div className='container px-4 md:px-6 py-16'>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-8'>
          <motion.div
            className='md:col-span-2'
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}>
            <div className='flex flex-col space-y-4'>
              <Link href='/' className='text-2xl font-bold'>
                Vike
              </Link>
              <p className='text-muted-foreground max-w-md'>
                AI-powered lead management platform that helps businesses
                automate workflows, nurture leads, and gain actionable insights
                through an intuitive dashboard.
              </p>
              <div className='flex space-x-4'>
                <Button variant='ghost' size='icon' asChild>
                  <Link href='#'>
                    <Github className='h-5 w-5' />
                    <span className='sr-only'>GitHub</span>
                  </Link>
                </Button>
                <Button variant='ghost' size='icon' asChild>
                  <Link href='#'>
                    <Twitter className='h-5 w-5' />
                    <span className='sr-only'>Twitter</span>
                  </Link>
                </Button>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.5 }}>
            <div className='space-y-4'>
              <h3 className='text-sm font-semibold'>Product</h3>
              <ul className='space-y-3'>
                {footerNavigation.product.map((item, i) => (
                  <motion.li
                    key={item.title}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + i * 0.05, duration: 0.3 }}>
                    <Link
                      href={item.href}
                      className='text-muted-foreground hover:text-foreground transition-colors'>
                      {item.title}
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.5 }}>
            <div className='space-y-4'>
              <h3 className='text-sm font-semibold'>Company</h3>
              <ul className='space-y-3'>
                {footerNavigation.company.map((item, i) => (
                  <motion.li
                    key={item.title}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + i * 0.05, duration: 0.3 }}>
                    <Link
                      href={item.href}
                      className='text-muted-foreground hover:text-foreground transition-colors'>
                      {item.title}
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>

        <motion.div
          className='mt-12 pt-8 border-t'
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.5 }}>
          <div className='flex flex-col md:flex-row justify-between items-center gap-6'>
            <div className='text-center md:text-left'>
              <p className='text-sm text-muted-foreground'>
                © {new Date().getFullYear()} Vike. All rights reserved.
              </p>
              <div className='flex flex-wrap gap-4 mt-2 justify-center md:justify-start'>
                {footerNavigation.legal.map((item) => (
                  <Link
                    key={item.title}
                    href={item.href}
                    className='text-xs text-muted-foreground hover:text-foreground'>
                    {item.title}
                  </Link>
                ))}
              </div>
            </div>
            <div className='flex gap-2 w-full md:w-auto max-w-sm'>
              <Input
                type='email'
                placeholder='Enter your email'
                className='max-w-xs'
              />
              <Button>Subscribe</Button>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
