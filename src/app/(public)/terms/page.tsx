import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | Vike",
  description:
    "Terms of Service for Vike - Understand our terms and conditions",
};

export default function TermsOfService() {
  return (
    <div className='max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8'>
      <h1 className='text-4xl font-bold mb-8'>Terms of Service</h1>

      <div className='space-y-8'>
        <section>
          <h2 className='text-2xl font-semibold mb-4'>
            1. Acceptance of Terms
          </h2>
          <p className='text-muted-foreground'>
            By accessing and using Vike&apos;s services, you agree to be bound
            by these Terms of Service and all applicable laws and regulations.
          </p>
        </section>

        <section>
          <h2 className='text-2xl font-semibold mb-4'>
            2. Service Description
          </h2>
          <p className='text-muted-foreground'>
            Vike provides an AI-powered customer relationship management
            platform that includes features such as AI agents, workflow
            automation, and integrations with third-party services.
          </p>
        </section>

        <section>
          <h2 className='text-2xl font-semibold mb-4'>3. User Obligations</h2>
          <ul className='list-disc pl-5 space-y-2 text-muted-foreground'>
            <li>Maintain the security of your account credentials</li>
            <li>Provide accurate and complete information</li>
            <li>Comply with all applicable laws and regulations</li>
            <li>Use the service responsibly and ethically</li>
          </ul>
        </section>

        <section>
          <h2 className='text-2xl font-semibold mb-4'>
            4. Subscription and Payments
          </h2>
          <p className='text-muted-foreground'>
            Access to Vike&apos;s services requires a paid subscription.
            Payments are processed securely through our payment providers.
            Subscriptions automatically renew unless cancelled.
          </p>
        </section>

        <section>
          <h2 className='text-2xl font-semibold mb-4'>
            5. Data Usage and Privacy
          </h2>
          <p className='text-muted-foreground'>
            Your use of Vike is also governed by our Privacy Policy. We collect
            and use your information as described in our Privacy Policy.
          </p>
        </section>

        <section>
          <h2 className='text-2xl font-semibold mb-4'>
            6. Intellectual Property
          </h2>
          <p className='text-muted-foreground'>
            All content, features, and functionality of Vike are owned by us and
            are protected by international copyright, trademark, and other
            intellectual property laws.
          </p>
        </section>

        <section>
          <h2 className='text-2xl font-semibold mb-4'>
            7. Limitation of Liability
          </h2>
          <p className='text-muted-foreground'>
            Vike provides its services &quot;as is&quot; without any warranty.
            We shall not be liable for any indirect, incidental, special,
            consequential, or punitive damages.
          </p>
        </section>

        <section>
          <h2 className='text-2xl font-semibold mb-4'>8. Changes to Terms</h2>
          <p className='text-muted-foreground'>
            We reserve the right to modify these terms at any time. We will
            notify users of any material changes to these terms.
          </p>
        </section>

        <section>
          <h2 className='text-2xl font-semibold mb-4'>9. Contact</h2>
          <p className='text-muted-foreground'>
            If you have any questions about these Terms, please contact us at{" "}
            <a
              href='mailto:legal@vike.com'
              className='text-primary hover:underline'>
              legal@vike.com
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
