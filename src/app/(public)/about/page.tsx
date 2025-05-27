import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Vike | AI-Powered Customer Relationships",
  description:
    "Learn about Vike's mission to transform customer relationships through AI automation and intelligent workflow management.",
};

export default function About() {
  return (
    <div className='max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8'>
      <h1 className='text-4xl font-bold mb-8'>About Vike</h1>

      <div className='space-y-12'>
        <section>
          <h2 className='text-2xl font-semibold mb-4'>Our Mission</h2>
          <p className='text-muted-foreground'>
            At Vike, we're on a mission to revolutionize how businesses interact
            with their customers. By combining cutting-edge AI technology with
            intuitive workflow automation, we're making professional customer
            relationship management accessible to businesses of all sizes.
          </p>
        </section>

        <section>
          <h2 className='text-2xl font-semibold mb-4'>Our Story</h2>
          <p className='text-muted-foreground'>
            Founded in 2024, Vike emerged from a simple observation: businesses
            spend too much time on repetitive customer interactions and not
            enough time building meaningful relationships. Our team of industry
            veterans and AI experts came together to create a solution that
            would automate the routine while enhancing the human touch.
          </p>
        </section>

        <section>
          <h2 className='text-2xl font-semibold mb-4'>Core Values</h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div className='space-y-2'>
              <h3 className='text-xl font-medium'>Innovation</h3>
              <p className='text-muted-foreground'>
                We continuously push the boundaries of what's possible with AI
                and automation technology.
              </p>
            </div>
            <div className='space-y-2'>
              <h3 className='text-xl font-medium'>Customer Success</h3>
              <p className='text-muted-foreground'>
                Your success is our success. We're committed to providing the
                tools and support you need to grow.
              </p>
            </div>
            <div className='space-y-2'>
              <h3 className='text-xl font-medium'>Security</h3>
              <p className='text-muted-foreground'>
                We maintain the highest standards of data security and privacy
                protection.
              </p>
            </div>
            <div className='space-y-2'>
              <h3 className='text-xl font-medium'>Accessibility</h3>
              <p className='text-muted-foreground'>
                We believe powerful CRM tools should be accessible to businesses
                of all sizes.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className='text-2xl font-semibold mb-4'>Our Technology</h2>
          <p className='text-muted-foreground'>
            Vike's platform is built on state-of-the-art AI technology,
            including natural language processing, machine learning, and
            predictive analytics. Our AI agents learn from every interaction,
            continuously improving their ability to understand and respond to
            customer needs.
          </p>
        </section>

        <section>
          <h2 className='text-2xl font-semibold mb-4'>Leadership</h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
            <div className='space-y-2'>
              <h3 className='text-xl font-medium'>Sarah Chen</h3>
              <p className='text-muted-foreground'>CEO & Co-founder</p>
              <p className='text-muted-foreground'>
                Former Head of AI at Enterprise Solutions, with 15+ years in CRM
                development.
              </p>
            </div>
            <div className='space-y-2'>
              <h3 className='text-xl font-medium'>Michael Rodriguez</h3>
              <p className='text-muted-foreground'>CTO & Co-founder</p>
              <p className='text-muted-foreground'>
                AI researcher and architect with experience at leading tech
                companies.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className='text-2xl font-semibold mb-4'>Contact Us</h2>
          <p className='text-muted-foreground'>
            Want to learn more about Vike? We'd love to hear from you.{" "}
            <a href='/contact' className='text-primary hover:underline'>
              Get in touch
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
