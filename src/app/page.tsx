import Navbar from "@/components/landing/navbar";
import Hero from "@/components/landing/hero";
import Features from "@/components/landing/features";
import Pricing from "@/components/landing/pricing";
import Testimonials from "@/components/landing/testimonial";
import FAQ from "@/components/landing/faq";
import Footer from "@/components/landing/footer";

export default function Home() {
  return (
    <div className='min-h-screen flex flex-col'>
      <Navbar />
      <main className='flex-grow '>
        <Hero />
        <Features />
        <Testimonials />
        <Pricing />
        <div className='mx-auto w-full'>
          <FAQ />
        </div>
      </main>
      <Footer />
    </div>
  );
}
