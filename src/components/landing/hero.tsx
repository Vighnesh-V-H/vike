import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Image from "next/image";

export default function Hero() {
  return (
    <section className='py-20 md:py-28 bg-gradient-to-b from-background to-muted/30 dark:from-background dark:to-background/80'>
      <div className='container px-4 md:px-6'>
        <div className='grid gap-6 lg:grid-cols-2 lg:gap-12 items-center'>
          <div className='flex flex-col justify-center space-y-4'>
            <div className='space-y-2'>
              <h1 className='text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none'>
                Automate Your CRM <br />
                <span className='text-primary'>With AI Agents</span>
              </h1>
              <p className='max-w-[600px] text-muted-foreground md:text-xl'>
                Transform your customer relationships with intelligent
                automation. Our AI agents handle routine tasks, analyze customer
                data, and provide actionable insights.
              </p>
            </div>
            <div className='flex flex-col gap-2 min-[400px]:flex-row'>
              <Button size='lg' className='gap-1'>
                Get Started <ArrowRight className='h-4 w-4' />
              </Button>
              <Button size='lg' variant='outline'>
                Book a Demo
              </Button>
            </div>
            <div className='flex items-center gap-2 text-sm'>
              <div className='flex -space-x-2'>
                <div className='h-8 w-8 rounded-full border-2 border-background bg-gray-200'></div>
                <div className='h-8 w-8 rounded-full border-2 border-background bg-gray-300'></div>
                <div className='h-8 w-8 rounded-full border-2 border-background bg-gray-400'></div>
              </div>
              <div className='text-muted-foreground'>
                Trusted by{" "}
                <span className='font-medium text-foreground'>2,000+</span>{" "}
                companies
              </div>
            </div>
          </div>
          <div className='mx-auto lg:ml-auto flex items-center justify-center'>
            <div className='relative w-full max-w-[500px] aspect-video rounded-xl bg-gradient-to-br from-primary/20 to-primary/40 p-1'>
              <div className='absolute inset-0 rounded-lg overflow-hidden'>
                <Image
                  src='/placeholder.svg?height=500&width=800'
                  alt='AI CRM Dashboard'
                  className='w-full h-full object-cover'
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
