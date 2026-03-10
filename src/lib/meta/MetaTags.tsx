import type { Metadata } from "next";
import { SiteConfig } from "@/constants/site";

const OG_IMAGE = "/static/og_image.jpg";

type MetaTagsOptions = {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  noIndex?: boolean;
};

/**
 * Creates an App Router–compatible Metadata object.
 * Use in `layout.tsx` / `page.tsx` via:
 *   export const metadata = createMetadata();
 * or inside generateMetadata():
 *   return createMetadata({ title: "Inbox" });
 */
export function createMetadata(opts: MetaTagsOptions = {}): Metadata {
  const {
    title,
    description = SiteConfig.description,
    image = OG_IMAGE,
    url = SiteConfig.url,
    noIndex = false,
  } = opts;

  return {
    title: title
      ? { default: `${title} | ${SiteConfig.ServerName}`, template: `%s | ${SiteConfig.name}` }
      : { default: SiteConfig.ServerName, template: `%s | ${SiteConfig.name}` },
    description,
    keywords: SiteConfig.Keywords,
    authors: [{ name: "ENJOYS", url: "https://enjoys.in" }],
    creator: "ENJOYS",
    publisher: "Airsend",
    metadataBase: new URL(SiteConfig.url),
    alternates: { canonical: url },
    category: "technology",
    classification: "Email Service, Collaboration Platform",
    openGraph: {
      title: title ? `${title} | ${SiteConfig.ServerName}` : SiteConfig.ServerName,
      description,
      url,
      siteName: SiteConfig.ServerName,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title
            ? `${title} | ${SiteConfig.ServerName}`
            : "Airsend — Secure Email, Calendar & Workspace",
        },
      ],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: title ? `${title} | ${SiteConfig.ServerName}` : SiteConfig.ServerName,
      description,
      site: "@AirsendMail",
      creator: "@mullayam06",
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title
            ? `${title} | ${SiteConfig.ServerName}`
            : "Airsend — Secure Email, Calendar & Workspace",
        },
      ],
    },
    icons: {
      icon: [
        { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
        { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      ],
      shortcut: "/favicon-32x32.png",
      apple: "/apple-touch-icon.png",
    },
    manifest: "/site.webmanifest",
    robots: noIndex
      ? { index: false, follow: false }
      : {
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
    other: {
      "application-name": "Airsend",
      "apple-mobile-web-app-title": "Airsend",
      "apple-mobile-web-app-capable": "yes",
      "apple-mobile-web-app-status-bar-style": "black-translucent",
      "mobile-web-app-capable": "yes",
      "theme-color": "#111315",
      "msapplication-TileColor": "#111315",
    },
  };
}

/** JSON-LD structured data for the site — render in root layout body */
export const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Airsend",
  url: SiteConfig.url,
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description: SiteConfig.description,
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  author: {
    "@type": "Organization",
    name: "ENJOYS",
    url: "https://enjoys.in",
  },
  featureList:
    "Email Hosting, IMAP/SMTP, CalDAV Calendar, Workspace Collaboration, End-to-End Encryption, Custom Domain Email, Temp Mail",
};