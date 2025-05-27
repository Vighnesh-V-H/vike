import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Mail, MessageSquare, Phone } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact Us | Vike",
  description:
    "Get in touch with the Vike team. We're here to help with any questions about our AI-powered CRM platform.",
};

export default function Contact() {
  return (
    <div className='max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-12'>
        <div>
          <h1 className='text-4xl font-bold mb-8'>Get in Touch</h1>
          <p className='text-muted-foreground mb-8'>
            Have questions about Vike? We're here to help. Fill out the form
            below and we'll get back to you as soon as possible.
          </p>

          <div className='space-y-6 mb-8'>
            <div className='flex items-center gap-4'>
              <Mail className='w-6 h-6 text-primary' />
              <div>
                <h3 className='font-medium'>Email Us</h3>
                <p className='text-muted-foreground'>
                  <a href='mailto:hello@vike.com' className='hover:underline'>
                    hello@vike.com
                  </a>
                </p>
              </div>
            </div>

            <div className='flex items-center gap-4'>
              <Phone className='w-6 h-6 text-primary' />
              <div>
                <h3 className='font-medium'>Call Us</h3>
                <p className='text-muted-foreground'>+1 (555) 123-4567</p>
              </div>
            </div>

            <div className='flex items-center gap-4'>
              <MessageSquare className='w-6 h-6 text-primary' />
              <div>
                <h3 className='font-medium'>Live Chat</h3>
                <p className='text-muted-foreground'>
                  Available Monday to Friday, 9am - 5pm PST
                </p>
              </div>
            </div>
          </div>

          <Card className='p-6'>
            <h3 className='font-semibold mb-2'>Book a Demo</h3>
            <p className='text-muted-foreground mb-4'>
              Want to see Vike in action? Schedule a personalized demo with our
              team.
            </p>
            <Button>Schedule Demo</Button>
          </Card>
        </div>

        <div>
          <form className='space-y-6'>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='firstName'>First Name</Label>
                <Input id='firstName' placeholder='John' />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='lastName'>Last Name</Label>
                <Input id='lastName' placeholder='Doe' />
              </div>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='email'>Email</Label>
              <Input id='email' type='email' placeholder='john@company.com' />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='company'>Company</Label>
              <Input id='company' placeholder='Company Name' />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='message'>Message</Label>
              <Textarea
                id='message'
                placeholder='Tell us how we can help...'
                className='min-h-[150px]'
              />
            </div>

            <Button type='submit' className='w-full'>
              Send Message
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
