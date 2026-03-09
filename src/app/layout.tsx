import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import NextTopLoader from 'nextjs-toploader';

import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";
import { IndexDbProvider } from "@/context/IndexDbContext";

import StoreProvider from "@/components/layout/StoreProvider";
import { RuntimeConfigProvider } from "@/components/RuntimeConfigProvider";
import { SiteConfig } from "@/constants/site";
import { Plus_Jakarta_Sans } from "next/font/google";


import { ServiceWorker } from "@/components/shared/ServiceWorker";
import PingletWidget from "@/components/widget/pinglet";


const jakarta = Plus_Jakarta_Sans({
  weight: ['600',],
  style: ['normal'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jakarta'
});


export const metadata = {
  title: SiteConfig.ServerName,
  description: SiteConfig.description,
  keywords: SiteConfig.Keywords,
  authors: [{ name: "airsend", url: "https://airsend.in" }],
  creator: "enjoys.in",
  metadataBase: new URL("https://enjoys.in"),
  openGraph: {
    title: SiteConfig.ServerName,
    description: SiteConfig.description,
    url: "https://airsend.in",
    siteName: SiteConfig.ServerName,
    images: [
      {
        url: "/navbar-logo.png",
        width: 1200,
        height: 630,
        alt: SiteConfig.ServerName,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: SiteConfig.ServerName,
    description: SiteConfig.description,
    // site: "@",
    creator: "@mullayam06",
    images: ["/navbar-logo.png"],
  },
  icons: {
    icon: "/favicon-32x32.png",
    shortcut: "/favicon-32x32.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  // themeColor: "#000000",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};


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
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="manifest" href="/site.webmanifest"></link>

      <body className={cn(jakarta.className,)} suppressHydrationWarning>
        <script dangerouslySetInnerHTML={{ __html: `window.__RUNTIME_CONFIG__=${runtimeConfigJson}` }} />
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
