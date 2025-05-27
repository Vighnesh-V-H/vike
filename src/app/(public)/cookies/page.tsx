import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Policy | Vike",
  description: "Cookie Policy for Vike - Understanding how we use cookies",
};

export default function CookiePolicy() {
  return (
    <div className='max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8'>
      <h1 className='text-4xl font-bold mb-8'>Cookie Policy</h1>

      <div className='space-y-8'>
        <section>
          <h2 className='text-2xl font-semibold mb-4'>What Are Cookies</h2>
          <p className='text-muted-foreground'>
            Cookies are small text files that are placed on your device when you
            visit our website. They help us provide you with a better experience
            and are essential for certain features of our service to work
            properly.
          </p>
        </section>

        <section>
          <h2 className='text-2xl font-semibold mb-4'>How We Use Cookies</h2>
          <div className='space-y-4'>
            <h3 className='text-xl font-medium'>Essential Cookies</h3>
            <p className='text-muted-foreground'>
              These cookies are necessary for our website to function properly.
              They enable core functionality such as security, authentication,
              and user preferences.
            </p>

            <h3 className='text-xl font-medium'>Analytics Cookies</h3>
            <p className='text-muted-foreground'>
              We use analytics cookies to understand how visitors interact with
              our website, helping us improve our services and user experience.
            </p>

            <h3 className='text-xl font-medium'>Authentication Cookies</h3>
            <p className='text-muted-foreground'>
              These cookies help us identify users and prevent fraudulent use of
              user credentials, ensuring secure authentication with services
              like Google and GitHub.
            </p>
          </div>
        </section>

        <section>
          <h2 className='text-2xl font-semibold mb-4'>Third-Party Cookies</h2>
          <p className='text-muted-foreground'>
            Some features of our service use cookies from third-party services,
            including:
          </p>
          <ul className='list-disc pl-5 space-y-2 text-muted-foreground mt-4'>
            <li>Authentication providers (Google, GitHub)</li>
            <li>Analytics services</li>
            <li>Integration partners</li>
          </ul>
        </section>

        <section>
          <h2 className='text-2xl font-semibold mb-4'>Managing Cookies</h2>
          <p className='text-muted-foreground'>
            Most web browsers allow you to control cookies through their
            settings preferences. However, limiting cookies may impact your
            experience using our service, as some features rely on cookies to
            function properly.
          </p>
        </section>

        <section>
          <h2 className='text-2xl font-semibold mb-4'>
            Updates to This Policy
          </h2>
          <p className='text-muted-foreground'>
            We may update this Cookie Policy from time to time. We will notify
            you of any changes by posting the new Cookie Policy on this page.
          </p>
        </section>

        <section>
          <h2 className='text-2xl font-semibold mb-4'>Contact Us</h2>
          <p className='text-muted-foreground'>
            If you have any questions about our Cookie Policy, please contact us
            at{" "}
            <a
              href='mailto:privacy@vike.com'
              className='text-primary hover:underline'>
              privacy@vike.com
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
