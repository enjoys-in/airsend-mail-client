import { __config } from "./config"

export type SiteConfigType = typeof SiteConfig

export const SiteConfig = {
    name: "Airsend",
    apiUrl: __config.APP.APP_URL,
    url: "https://airsend.in",
    description:
        "Airsend is a secure, privacy-first email service with built-in calendar, workspace collaboration, and end-to-end encryption. Send, receive, and manage emails with custom domains — no spam, no tracking.",
    tagline: "Secure Email, Calendar & Workspace — All in One",
    mainNav: [
        {
            title: "Home",
            href: "/",
        },
    ],
    links: {
        docs: __config.APP.APP_URL,
        twitter: "https://x.com/AirsendMail",
        github: "https://github.com/AirsendMail",
    },
    ServerName: "Airsend - Powered by ENJOYS",
    Keywords: [
        // Core brand & product
        "airsend",
        "airsend mail",
        "airsend email",
        "airsend email service",

        // Email service — primary
        "email service provider",
        "secure email service",
        "private email provider",
        "encrypted email service",
        "custom domain email",
        "business email hosting",
        "professional email service",
        "email hosting provider",
        "cloud email service",
        "managed email service",

        // Email service — comparisons & alternatives
        "sendgrid alternative",
        "resend alternative",
        "mailchimp alternative",
        "postmark alternative",
        "mailgun alternative",
        "amazon ses alternative",
        "protonmail alternative",
        "tutanota alternative",
        "fastmail alternative",
        "zoho mail alternative",
        "gmail alternative",
        "outlook alternative",

        // Transactional & API email
        "transactional email service",
        "email API",
        "email API provider",
        "REST email API",
        "send email via API",
        "developer email platform",
        "email delivery service",
        "email infrastructure",
        "email deliverability",
        "SMTP relay service",
        "SMTP email provider",

        // Temp mail & disposable email
        "temporary email",
        "temp mail generator",
        "disposable email address",
        "throwaway email",
        "anonymous email service",
        "free temporary inbox",
        "burner email",
        "10 minute mail",

        // IMAP/SMTP/email client
        "IMAP email client",
        "SMTP email sender",
        "webmail client",
        "web email client",
        "online email client",
        "desktop email client alternative",
        "sync emails across devices",
        "send and receive emails",
        "email inbox management",
        "unified inbox",

        // Security & privacy
        "end-to-end encrypted email",
        "zero-knowledge email",
        "privacy-first email",
        "GDPR compliant email",
        "secure mail server",
        "PGP email encryption",
        "self-hosted email",
        "on-premise email server",

        // Email marketing & campaigns
        "email marketing tool",
        "email marketing platform",
        "newsletter platform",
        "email campaign tool",
        "bulk email sender",
        "automated email sequences",
        "email list management",
        "email tracking and analytics",
        "email campaign scheduler",
        "marketing automation platform",
        "drip email campaigns",
        "email newsletter service",

        // Calendar & scheduling
        "CalDAV calendar",
        "calendar integration",
        "online calendar app",
        "schedule meetings",
        "shared calendar for teams",
        "event reminders",
        "calendar sharing",
        "iCalendar sync",

        // Workspace & collaboration
        "team collaboration platform",
        "workspace collaboration tool",
        "team communication",
        "real-time collaboration",
        "team messaging",
        "project management tool",
        "task manager",
        "workflow automation",

        // Developer & technical
        "open source email",
        "email for developers",
        "email webhook",
        "email parsing",
        "email forwarding service",
        "catch-all email",
        "email routing",
        "SPF DKIM DMARC",
        "email authentication",
        "email DNS setup",
    ]
}
 
  