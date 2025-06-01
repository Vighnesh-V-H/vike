"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { motion } from "motion/react";

export default function Hero() {
  return (
    <section className='py-20 md:py-28 bg-gradient-to-b from-background to-muted/30 dark:from-background dark:to-background/80 overflow-hidden'>
      <div className='container px-4 md:px-6 relative'>
        {/* Abstract background shapes */}
        <div className='absolute inset-0 overflow-hidden pointer-events-none'>
          <motion.div
            className='absolute top-10 right-10 w-64 h-64 rounded-full bg-primary/5 blur-3xl'
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className='absolute bottom-10 left-10 w-96 h-96 rounded-full bg-primary/10 blur-3xl'
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.4, 0.6, 0.4],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>

        <div className='grid gap-6 lg:grid-cols-2 lg:gap-12 items-center relative z-10'>
          <motion.div
            className='flex flex-col justify-center space-y-6'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}>
            <div className='space-y-4'>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}>
                <span className='inline-block px-3 py-1 text-sm font-medium text-primary border border-primary/30 rounded-full bg-primary/10 mb-4'>
                  AI-Powered Workflow Management
                </span>
              </motion.div>

              <motion.h1
                className='text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none'
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}>
                Intelligent <span className='text-primary'>Agents</span> for{" "}
                <br />
                Smarter Lead Management
              </motion.h1>

              <motion.p
                className='max-w-[600px] text-muted-foreground md:text-xl'
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}>
                Transform your workflow with AI agents that autonomously handle
                lead nurturing, task management, and provide actionable insights
                through an intuitive dashboard.
              </motion.p>
            </div>

            <motion.div
              className='flex flex-col gap-3 min-[400px]:flex-row'
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}>
              <Button
                size='lg'
                className='gap-1 group transition-all duration-300 hover:pr-6'>
                Get Started
                <ArrowRight className='h-4 w-4 group-hover:translate-x-1 transition-transform' />
              </Button>
              <Button
                size='lg'
                variant='outline'
                className='transition-all duration-300'>
                Book a Demo
              </Button>
            </motion.div>

            <motion.div
              className='flex items-center gap-3 text-sm'
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}>
              <div className='flex -space-x-3'>
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    className='h-8 w-8 rounded-full border-2 border-background bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center text-xs font-medium overflow-hidden'
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + i * 0.1, duration: 0.4 }}>
                    {i < 3 && (
                      <span className='text-xs'>
                        {String.fromCharCode(65 + i)}
                      </span>
                    )}
                    {i >= 3 && i === 3 && <span className='text-xs'>+</span>}
                  </motion.div>
                ))}
              </div>
              <div className='text-muted-foreground'>
                Trusted by
                <span className='font-medium text-foreground ml-1'>2,500+</span>
                <span className='ml-1'>businesses worldwide</span>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            className='mx-auto lg:ml-auto flex items-center justify-center'
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.7 }}>
            <div className='relative w-full max-w-[560px] aspect-[4/3]'>
              {/* Dashboard preview with floating elements */}
              <motion.div
                className='absolute inset-0 rounded-xl overflow-hidden border shadow-lg bg-background'
                animate={{ y: [0, -5, 0] }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}>
                <div className='absolute top-0 left-0 right-0 h-10 bg-muted/50 border-b flex items-center px-4'>
                  <div className='flex space-x-2'>
                    <div className='w-3 h-3 rounded-full bg-red-400'></div>
                    <div className='w-3 h-3 rounded-full bg-yellow-400'></div>
                    <div className='w-3 h-3 rounded-full bg-green-400'></div>
                  </div>
                </div>
                <div className='pt-10 p-4'>
                  <Image
                    src='/images/dashboard.svg'
                    width={800}
                    height={500}
                    alt='AI Lead Management Dashboard'
                    className='w-full h-full object-cover rounded-md'
                    priority
                  />
                </div>
              </motion.div>

              {/* Floating notification card */}
              <motion.div
                className='absolute -top-6 -right-6 bg-background rounded-lg shadow-lg border p-3 w-64'
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                whileHover={{
                  y: -5,
                  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                }}>
                <div className='flex items-start gap-3'>
                  <div className='w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary'>
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      width='16'
                      height='16'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='currentColor'
                      strokeWidth='2'
                      strokeLinecap='round'
                      strokeLinejoin='round'>
                      <path d='M22 12h-4l-3 9L9 3l-3 9H2'></path>
                    </svg>
                  </div>
                  <div>
                    <h4 className='font-medium text-sm'>Lead Activity</h4>
                    <p className='text-xs text-muted-foreground'>
                      5 new leads qualified today
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Floating task card */}
              <motion.div
                className='absolute -bottom-6 -left-6 bg-background rounded-lg shadow-lg border p-3 w-64'
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.5 }}
                whileHover={{
                  y: -5,
                  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                }}>
                <div className='flex items-start gap-3'>
                  <div className='w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-500'>
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      width='16'
                      height='16'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='currentColor'
                      strokeWidth='2'
                      strokeLinecap='round'
                      strokeLinejoin='round'>
                      <path d='M22 11.08V12a10 10 0 1 1-5.93-9.14'></path>
                      <polyline points='22 4 12 14.01 9 11.01'></polyline>
                    </svg>
                  </div>
                  <div>
                    <h4 className='font-medium text-sm'>Agent Task</h4>
                    <p className='text-xs text-muted-foreground'>
                      Follow-up emails sent automatically
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
