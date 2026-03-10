import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import NextTopLoader from 'nextjs-toploader';

import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";
import { IndexDbProvider } from "@/context/IndexDbContext";

import StoreProvider from "@/components/layout/StoreProvider";
import { RuntimeConfigProvider } from "@/components/RuntimeConfigProvider";
import { Plus_Jakarta_Sans } from "next/font/google";

import { ServiceWorker } from "@/components/shared/ServiceWorker";
import { createMetadata, jsonLd } from "@/lib/meta/MetaTags";


const jakarta = Plus_Jakarta_Sans({
  weight: ['600',],
  style: ['normal'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jakarta'
});


export const metadata = createMetadata();


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const runtimeConfigJson = JSON.stringify({
    APP_ENV: process.env.APP_ENV || "",
    APP_URL: process.env.APP_URL || "",
    API_KEY: process.env.API_KEY || "",
    CALDEV_URL: process.env.CALDEV_URL || "",
    WORKSPACE_API_URL: process.env.WORKSPACE_API_URL || "",
    TENOR_API_KEY: process.env.TENOR_API_KEY || "",
  }).replace(/</g, "\\u003c")

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(jakarta.className,)} suppressHydrationWarning>
        <script dangerouslySetInnerHTML={{ __html: `window.__RUNTIME_CONFIG__=${runtimeConfigJson}` }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <NextTopLoader color="#5a61ff" />
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          disableTransitionOnChange
        >
          {/* <PingletWidget /> */}
          <RuntimeConfigProvider>
            <StoreProvider>
              <IndexDbProvider>
                <TooltipProvider delayDuration={0}>{children}</TooltipProvider>
              </IndexDbProvider>
            </StoreProvider>
          </RuntimeConfigProvider>
          <ServiceWorker />
        </ThemeProvider>
      </body>
    </html>
  );
}
