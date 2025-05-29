import type React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import * as LucideIcons from "lucide-react";
import { footerNavigation } from "@/lib/constants";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className='bg-muted dark:bg-muted/10 py-12 border-t'>
      <div className='container px-4 md:px-6'>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-8'>
          <div className='md:col-span-1'>
            <div className='flex items-center gap-2 mb-4'>
              {footerNavigation.logo ? (
                <Image
                  src={footerNavigation.logo.src}
                  alt={footerNavigation.logo.alt}
                  width={footerNavigation.logo.width}
                  height={footerNavigation.logo.height}
                  className='h-auto'
                  unoptimized
                />
              ) : (
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  className='h-6 w-6 text-primary'>
                  <path d='M12 2a10 10 0 1 0 10 10H12V2Z' />
                  <path d='M12 12 2.1 9.1a10 10 0 0 0 9.8 12.9L12 12Z' />
                  <path d='M12 12 9.1 2.1a10 10 0 0 0 12.9 9.8L12 12Z' />
                </svg>
              )}
              <span className='text-xl font-bold'>Vike</span>
            </div>
            <p className='text-muted-foreground mb-4'>
              Transforming customer relationships with intelligent automation.
            </p>
            <div className='flex space-x-4'>
              {footerNavigation.social.map((item) => {
                const IconComponent = LucideIcons[
                  item.icon as keyof typeof LucideIcons
                ] as React.FC<LucideIcons.LucideProps>;
                return (
                  <Link
                    key={item.title}
                    href={item.href}
                    className='text-muted-foreground hover:text-primary'>
                    <IconComponent className='h-5 w-5' />
                    <span className='sr-only'>{item.title}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className='font-semibold text-lg mb-4'>Product</h3>
            <ul className='space-y-3'>
              {footerNavigation.product.map((item) => (
                <li key={item.title}>
                  <Link
                    href={item.href}
                    className='text-muted-foreground hover:text-primary'>
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className='font-semibold text-lg mb-4'>Company</h3>
            <ul className='space-y-3'>
              {footerNavigation.company.map((item) => (
                <li key={item.title}>
                  <Link
                    href={item.href}
                    className='text-muted-foreground hover:text-primary'>
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className='font-semibold text-lg mb-4'>Subscribe</h3>
            <p className='text-muted-foreground mb-4'>
              Stay updated with the latest features and releases.
            </p>
            <div className='flex flex-col sm:flex-row gap-2'>
              <Input
                type='email'
                placeholder='Enter your email'
                className='max-w-[300px]'
              />
              <Button type='submit'>Subscribe</Button>
            </div>
          </div>
        </div>

        <div className='border-t mt-12 pt-8 flex flex-col md:flex-row justify-between items-center'>
          <p className='text-sm text-muted-foreground'>
            © {new Date().getFullYear()} Vike. All rights reserved.
          </p>
          <div className='flex gap-4 mt-4 md:mt-0'>
            {footerNavigation.legal.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className='text-sm text-muted-foreground hover:text-primary'>
                {item.title}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
