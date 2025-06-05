import { __config } from "./config"

export type SiteConfigType = typeof SiteConfig

export const SiteConfig = {
    name: "Airsend",
    apiUrl: __config.APP.APP_URL,
    description:
        "Mails are sent to your inbox. No spam, no tracking. Just the right tools.",
    mainNav: [
        {
            title: "Home",
            href: "/",
        },
    ],
    links: {
        docs: __config.APP.APP_URL,
    },
    ServerName:"Airsend - Powered by ENJOYS",
    Keywords :[
        // Temp mail & email services
        "temporary email",
        "temp mail generator",
        "disposable email address",
        "anonymous email service",
        "free temporary inbox",
        "secure email service",
        "private email provider",
        "custom email domain",
      
        // IMAP/SMTP/email client features
        "IMAP email client",
        "SMTP email sender",
        "webmail interface",
        "desktop email client alternative",
        "sync emails across devices",
        "encrypted email",
        "send and receive emails",
      
        // Task management
        "task manager",
        "to-do list app",
        "productivity tool",
        "project planning tool",
        "task tracker",
        "team task collaboration",
        "workflow automation",
      
        // Calendar & scheduling
        "calendar integration",
        "online calendar app",
        "schedule meetings",
        "shared calendar for teams",
        "event reminders",
        "daily planner",
      
        // Email marketing / campaigns
        "email marketing tool",
        "newsletter campaign",
        "bulk email sender",
        "automated email sequences",
        "email list management",
        "email tracking and analytics",
        "email campaign scheduler",
        "marketing automation platform",
      ]
}
 
  