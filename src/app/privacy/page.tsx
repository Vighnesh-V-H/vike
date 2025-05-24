import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Vike",
  description: "Privacy Policy for Vike - Learn how we protect your data",
};

export default function PrivacyPolicy() {
  return (
    <div className='max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8'>
      <h1 className='text-4xl font-bold mb-8'>Privacy Policy</h1>

      <div className='space-y-8'>
        <section>
          <h2 className='text-2xl font-semibold mb-4'>Introduction</h2>
          <p className='text-muted-foreground'>
            At Vike, we take your privacy seriously. This Privacy Policy
            explains how we collect, use, disclose, and safeguard your
            information when you use our service.
          </p>
        </section>

        <section>
          <h2 className='text-2xl font-semibold mb-4'>
            Information We Collect
          </h2>
          <div className='space-y-4'>
            <h3 className='text-xl font-medium'>Personal Information</h3>
            <ul className='list-disc pl-5 space-y-2 text-muted-foreground'>
              <li>Email address</li>
              <li>Name</li>
              <li>Profile information</li>
              <li>Authentication data</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className='text-2xl font-semibold mb-4'>
            How We Use Your Information
          </h2>
          <ul className='list-disc pl-5 space-y-2 text-muted-foreground'>
            <li>To provide and maintain our Service</li>
            <li>To notify you about changes to our Service</li>
            <li>To provide customer support</li>
            <li>
              To gather analysis or valuable information to improve our Service
            </li>
            <li>To detect, prevent and address technical issues</li>
          </ul>
        </section>

        <section>
          <h2 className='text-2xl font-semibold mb-4'>
            Third-Party Authentication
          </h2>
          <p className='text-muted-foreground'>
            We use third-party authentication providers (Google, GitHub) to
            allow you to sign in to our service. When you choose to sign in
            using these providers, we may collect information made available by
            them in accordance with their privacy policies and your privacy
            settings with these services.
          </p>
        </section>

        <section>
          <h2 className='text-2xl font-semibold mb-4'>Data Security</h2>
          <p className='text-muted-foreground'>
            We implement appropriate technical and organizational security
            measures to protect your personal information. However, please note
            that no method of transmission over the Internet or electronic
            storage is 100% secure.
          </p>
        </section>

        <section>
          <h2 className='text-2xl font-semibold mb-4'>Contact Us</h2>
          <p className='text-muted-foreground'>
            If you have any questions about this Privacy Policy, please contact
            us at:
            <br />
            <a
              href='mailto:privacy@vike.com'
              className='text-primary hover:underline'>
              privacy@vike.com
            </a>
          </p>
        </section>

        <section>
          <h2 className='text-2xl font-semibold mb-4'>
            Changes to This Privacy Policy
          </h2>
          <p className='text-muted-foreground'>
            We may update our Privacy Policy from time to time. We will notify
            you of any changes by posting the new Privacy Policy on this page
            and updating the date at the top of the policy.
          </p>
        </section>
      </div>
    </div>
  );
}
