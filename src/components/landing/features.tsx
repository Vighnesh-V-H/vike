import type React from "react";
import * as LucideIcons from "lucide-react";
import { features } from "@/lib/constants";
import Image from "next/image";

export default function Features() {
  return (
    <section id='features' className='py-20 bg-background'>
      <div className='container px-4 md:px-6'>
        <div className='text-center mb-12'>
          <h2 className='text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl'>
            Powerful Features
          </h2>
          <p className='mt-4 text-xl text-muted-foreground max-w-[700px] mx-auto'>
            Our AI-powered CRM platform streamlines your workflow and enhances
            customer relationships
          </p>
        </div>

        {/* Bento Grid for Features */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          {features.map((feature, index) => {
            // Dynamically get the icon component
            const IconComponent = LucideIcons[
              feature.icon as keyof typeof LucideIcons
            ] as React.FC<LucideIcons.LucideProps>;

            // Determine the grid span based on feature size
            const colSpan =
              feature.size === "large"
                ? "md:col-span-2"
                : feature.size === "wide"
                ? "md:col-span-3"
                : "";
            const rowSpan = feature.size === "large" ? "md:row-span-2" : "";

            return (
              <div
                key={index}
                className={`bg-muted/50 dark:bg-muted/10 rounded-xl p-6 border shadow-sm hover:shadow-md transition-shadow ${colSpan} ${rowSpan} ${
                  feature.size === "large" || feature.size === "wide"
                    ? "p-8"
                    : "p-6"
                }`}>
                {feature.size === "large" ? (
                  <div className='h-full flex flex-col'>
                    <div className='bg-primary/10 p-3 rounded-full w-fit'>
                      <IconComponent className='h-8 w-8 text-primary' />
                    </div>
                    <h3 className='text-2xl font-bold mt-4'>{feature.title}</h3>
                    <p className='mt-2 text-muted-foreground flex-grow'>
                      {feature.description}
                    </p>
                    {feature.image && (
                      <div className='mt-6 bg-background dark:bg-muted/20 rounded-lg p-4 border'>
                        <Image
                          src={feature.image.src || "/placeholder.svg"}
                          alt={feature.image.alt}
                          className='w-full h-auto rounded-md'
                        />
                      </div>
                    )}
                  </div>
                ) : feature.size === "wide" ? (
                  <div className='flex flex-col md:flex-row gap-6 items-center'>
                    <div className='flex-1'>
                      <div className='bg-primary/10 p-3 rounded-full w-fit'>
                        <IconComponent className='h-8 w-8 text-primary' />
                      </div>
                      <h3 className='text-2xl font-bold mt-4'>
                        {feature.title}
                      </h3>
                      <p className='mt-2 text-muted-foreground'>
                        {feature.description}
                      </p>
                    </div>
                    {feature.image && (
                      <div className='flex-1'>
                        <Image
                          src={feature.image.src || "/placeholder.svg"}
                          alt={feature.image.alt}
                          className='w-full h-auto rounded-lg border'
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <div className='bg-primary/10 p-2 rounded-full w-fit'>
                      <IconComponent className='h-6 w-6 text-primary' />
                    </div>
                    <h3 className='text-xl font-bold mt-3'>{feature.title}</h3>
                    <p className='mt-2 text-muted-foreground'>
                      {feature.description}
                    </p>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
