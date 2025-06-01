"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { testimonials } from "@/lib/constants";
import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const testimonialsCount = testimonials.length;

  const handlePrevious = useCallback(() => {
    if (isAnimating) return;

    setIsAnimating(true);
    setDirection(-1);
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? testimonialsCount - 1 : prevIndex - 1
    );
  }, [isAnimating, testimonialsCount]);

  const handleNext = useCallback(() => {
    if (isAnimating) return;

    setIsAnimating(true);
    setDirection(1);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonialsCount);
  }, [isAnimating, testimonialsCount]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isAnimating) {
        handleNext();
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [currentIndex, handleNext, isAnimating]);

  const handleAnimationComplete = () => {
    setIsAnimating(false);
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.95,
      zIndex: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      zIndex: 1,
      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1], // Custom ease curve
      },
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -1000 : 1000,
      opacity: 0,
      scale: 0.95,
      zIndex: 0,
      transition: {
        duration: 0.5,
        ease: [0.16, 1, 0.3, 1],
      },
    }),
  };

  const progressVariants = {
    initial: { width: 0 },
    animate: {
      width: "100%",
      transition: {
        duration: 5,
        ease: "linear",
        repeat: isAnimating ? 0 : 1,
        repeatType: "loop" as const,
      },
    },
  };

  return (
    <section className='py-20 bg-background overflow-hidden'>
      <div className='container px-4 md:px-6'>
        <motion.div
          className='flex flex-col items-center justify-center space-y-4 text-center mb-16'
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}>
          <span className='inline-block px-3 py-1 text-sm font-medium text-primary border border-primary/30 rounded-full bg-primary/10'>
            Success Stories
          </span>
          <h2 className='text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl'>
            What Our Clients Say
          </h2>
          <p className='max-w-[700px] text-muted-foreground md:text-xl'>
            Discover how businesses are transforming their lead management with
            our AI-powered platform.
          </p>
        </motion.div>

        {/* Carousel Container */}
        <div className='relative max-w-4xl mx-auto px-4 mb-12'>
          {/* Carousel */}
          <div className='relative h-[400px] overflow-hidden rounded-xl border bg-muted/20 shadow-lg'>
            {/* Decorative elements */}
            <div className='absolute inset-0 pointer-events-none overflow-hidden'>
              <motion.div
                className='absolute top-10 right-10 w-32 h-32 rounded-full bg-primary/5 blur-xl'
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
                className='absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-primary/10 blur-xl'
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
              <motion.div
                className='absolute top-1/2 left-1/4 text-primary/10'
                animate={{
                  rotate: [0, 10, 0],
                  scale: [1, 1.1, 1],
                  opacity: [0.2, 0.3, 0.2],
                }}
                transition={{
                  duration: 12,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}>
                <Quote size={80} />
              </motion.div>
            </div>

            {/* Progress bar */}
            <motion.div
              className='absolute top-0 left-0 h-1 bg-primary/50 z-10'
              variants={progressVariants}
              initial='initial'
              animate={isAnimating ? "initial" : "animate"}
              key={`progress-${currentIndex}`}
            />

            {/* Use key to force re-render and create animation effect */}
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={slideVariants}
              initial='enter'
              animate='center'
              onAnimationComplete={handleAnimationComplete}
              className='absolute inset-0 flex items-center justify-center p-8'>
              <div className='w-full max-w-3xl bg-background/80 backdrop-blur-sm rounded-xl p-8 border shadow-sm'>
                <div className='space-y-6'>
                  <div className='relative'>
                    <svg
                      className='absolute -top-2 -left-2 h-8 w-8 text-primary/20'
                      xmlns='http://www.w3.org/2000/svg'
                      viewBox='0 0 24 24'
                      fill='currentColor'
                      aria-hidden='true'>
                      <path d='M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179z'></path>
                    </svg>
                    <p className='relative pt-6 text-xl text-center text-muted-foreground italic'>
                      "{testimonials[currentIndex].content}"
                    </p>
                  </div>

                  {testimonials[currentIndex].highlight && (
                    <motion.div
                      className='flex justify-center'
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3, duration: 0.4 }}>
                      <span className='px-4 py-2 bg-primary/10 text-primary border border-primary/20 rounded-md inline-block text-sm font-medium'>
                        {testimonials[currentIndex].highlight}
                      </span>
                    </motion.div>
                  )}

                  <div className='flex items-center justify-center gap-4 pt-4'>
                    <motion.div
                      className='h-16 w-16 rounded-full overflow-hidden border-2 border-primary/20 shadow-md'
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.2, duration: 0.4 }}>
                      <Image
                        src={testimonials[currentIndex].author.image || ""}
                        alt={testimonials[currentIndex].author.name}
                        width={64}
                        height={64}
                        className='h-full w-full object-cover'
                      />
                    </motion.div>
                    <div>
                      <motion.h4
                        className='font-bold text-lg'
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.4 }}>
                        {testimonials[currentIndex].author.name}
                      </motion.h4>
                      <motion.p
                        className='text-sm text-muted-foreground'
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.4 }}>
                        {testimonials[currentIndex].author.role},{" "}
                        {testimonials[currentIndex].author.company}
                      </motion.p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Navigation Buttons */}
            <button
              onClick={handlePrevious}
              disabled={isAnimating}
              className='absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background backdrop-blur-sm rounded-full p-2 border shadow-md z-10 transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed'
              aria-label='Previous testimonial'>
              <ChevronLeft className='h-6 w-6 text-primary' />
            </button>

            <button
              onClick={handleNext}
              disabled={isAnimating}
              className='absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background backdrop-blur-sm rounded-full p-2 border shadow-md z-10 transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed'
              aria-label='Next testimonial'>
              <ChevronRight className='h-6 w-6 text-primary' />
            </button>
          </div>

          {/* Carousel Indicators */}
          <div className='flex justify-center mt-6 gap-2'>
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  if (isAnimating) return;
                  setIsAnimating(true);
                  setDirection(index > currentIndex ? 1 : -1);
                  setCurrentIndex(index);
                }}
                disabled={isAnimating}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? "bg-primary w-6"
                    : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                } ${isAnimating ? "cursor-not-allowed" : ""}`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>

        <motion.div
          className='mt-16 p-8 rounded-xl border bg-muted/20 shadow-sm flex flex-col md:flex-row items-center gap-6 md:gap-12'
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.6 }}>
          <div className='md:w-1/3 flex justify-center'>
            <div className='relative h-24 w-auto'>
              <Image
                src='/images/stats-graph.svg'
                alt='Statistics'
                width={150}
                height={96}
                className='h-full w-auto'
              />
              <motion.div
                className='absolute -top-2 -right-2 h-6 w-6 rounded-full bg-green-500 flex items-center justify-center text-white text-xs'
                animate={{
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}>
                +40%
              </motion.div>
            </div>
          </div>
          <div className='md:w-2/3'>
            <h3 className='text-2xl font-bold mb-2'>
              Proven Results, Measurable Impact
            </h3>
            <p className='text-muted-foreground'>
              Our clients report an average of 40% increase in conversion rates,
              60% reduction in administrative tasks, and 25% faster sales cycles
              after implementing our AI-powered lead management platform.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
