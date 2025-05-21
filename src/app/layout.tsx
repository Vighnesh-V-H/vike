import type { Metadata } from "next";

import "./globals.css";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/providers/theme-provider";




export const metadata: Metadata = {
  title: "Vike",
  description: "Ai First CRM",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en' suppressHydrationWarning={true}>
      <body>
        <SessionProvider>
          <ThemeProvider
            attribute='class'
            defaultTheme='system'
            enableSystem
            disableTransitionOnChange>
            {children}
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
