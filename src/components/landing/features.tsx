"use client";

import type React from "react";
import * as LucideIcons from "lucide-react";
import { features } from "@/lib/constants";
import Image from "next/image";
import { motion } from "motion/react";
import { useState, useRef } from "react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

export default function Features() {
  return (
    <section className='py-20 bg-muted/30'>
      <div className='container px-4 md:px-6'>
        <motion.div
          className='flex flex-col items-center justify-center space-y-4 text-center mb-16'
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}>
          <span className='inline-block px-3 py-1 text-sm font-medium text-primary border border-primary/30 rounded-full bg-primary/10'>
            Key Features
          </span>
          <h2 className='text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl'>
            Transforming Lead Management <br /> with Intelligent Automation
          </h2>
          <p className='max-w-[700px] text-muted-foreground md:text-xl'>
            Our platform combines AI and automation to streamline your workflow
            and improve conversion rates.
          </p>
        </motion.div>

        <div className='grid grid-cols-1 md:grid-cols-12 gap-6'>
          {features.map((feature, index) => {
            const IconComponent = LucideIcons[
              feature.icon as keyof typeof LucideIcons
            ] as React.FC<LucideIcons.LucideProps>;

            // Define grid spans based on feature size
            const colSpan =
              feature.size === "large"
                ? "md:col-span-8"
                : feature.size === "wide"
                ? "md:col-span-12"
                : "md:col-span-4";

            return (
              <FeatureCard
                key={index}
                feature={feature}
                colSpan={colSpan}
                index={index}
                IconComponent={IconComponent}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({
  feature,
  colSpan,
  index,
  IconComponent,
}: {
  feature: any;
  colSpan: string;
  index: number;
  IconComponent: React.FC<LucideIcons.LucideProps>;
}) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      setMousePosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  // Create a URL-friendly slug from the feature title
  const featureSlug = feature.title.toLowerCase().replace(/\s+/g, "-");

  return (
    <motion.div
      className={`${colSpan} group`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}>
      <div
        ref={cardRef}
        className={`h-full rounded-xl border border-white/10 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group-hover:border-primary/50 relative bg-black/40 backdrop-blur-md ${
          feature.size === "large" || feature.size === "wide" ? "p-8" : "p-6"
        }`}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}>
        {/* Light effect following mouse */}
        <div
          className='pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-300 overflow-hidden rounded-xl'
          aria-hidden='true'>
          <div
            className='absolute inset-0 bg-gradient-to-r from-primary/5 to-primary/10 backdrop-blur-sm'
            aria-hidden='true'
          />
          <div
            style={{
              left: `${mousePosition.x}px`,
              top: `${mousePosition.y}px`,
              transform: "translate(-50%, -50%)",
            }}
            className={`absolute h-32 w-32 rounded-full bg-white/20 blur-xl transition-opacity duration-300 ${
              isHovering ? "opacity-100" : "opacity-0"
            }`}
            aria-hidden='true'
          />
        </div>

        {feature.size === "large" ? (
          <div className='h-full flex flex-col relative z-10'>
            <div className='flex items-center gap-4 mb-6'>
              <div className='bg-primary/10 p-3 rounded-full w-fit'>
                <IconComponent className='h-8 w-8 text-primary' />
              </div>
              <h3 className='text-2xl font-bold'>{feature.title}</h3>
            </div>
            <p className='text-muted-foreground mb-8'>{feature.description}</p>
            {feature.image && (
              <div className='mt-auto bg-black/30 dark:bg-black/50 rounded-lg p-4 border border-white/10 group-hover:border-primary/20 transition-colors duration-300 relative overflow-hidden'>
                <div className='absolute inset-0 bg-gradient-to-r from-transparent to-black/40 dark:to-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none' />
                <Image
                  src={feature.image.src}
                  alt={feature.image.alt}
                  width={600}
                  height={300}
                  className='w-full h-auto rounded-md transform group-hover:scale-[1.02] transition-transform duration-500'
                />
              </div>
            )}
          </div>
        ) : feature.size === "wide" ? (
          <div className='flex flex-col md:flex-row gap-8 items-center relative z-10'>
            <div className='flex-1'>
              <div className='flex items-center gap-4 mb-4'>
                <div className='bg-primary/10 p-3 rounded-full w-fit'>
                  <IconComponent className='h-8 w-8 text-primary' />
                </div>
                <h3 className='text-2xl font-bold'>{feature.title}</h3>
              </div>
              <p className='text-muted-foreground'>{feature.description}</p>
            </div>
            {feature.image && (
              <div className='flex-1 bg-black/30 dark:bg-black/50 rounded-lg p-4 border border-white/10 group-hover:border-primary/20 transition-colors duration-300 overflow-hidden'>
                <Image
                  src={feature.image.src || "/images/workflow.png"}
                  alt={feature.image.alt}
                  height={300}
                  width={500}
                  className='w-full h-auto rounded-lg transform group-hover:scale-[1.02] transition-transform duration-500'
                />
              </div>
            )}
          </div>
        ) : (
          <div className='h-full flex flex-col relative z-10'>
            <div className='bg-primary/10 p-3 rounded-full w-fit mb-4 group-hover:bg-primary/20 transition-colors duration-300'>
              <IconComponent className='h-6 w-6 text-primary' />
            </div>
            <h3 className='text-xl font-bold mb-3'>{feature.title}</h3>
            <p className='text-muted-foreground'>{feature.description}</p>

            {/* Add a subtle arrow icon that appears on hover */}
            <div className='mt-auto pt-6 flex justify-end'>
              <div className='text-primary opacity-0 transform translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300'>
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
                  <path d='M5 12h14'></path>
                  <path d='m12 5 7 7-7 7'></path>
                </svg>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
