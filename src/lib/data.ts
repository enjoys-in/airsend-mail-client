import { RiOrganizationChart } from "@remixicon/react";
import {
    AudioWaveform,
    Bot,
    Command,
    Github,
    KeySquare,
    LayoutDashboard,
    Mail,
    MailCheckIcon,
    Settings2,
    Shield,
    Text,
    Users,
} from "lucide-react"
export const ABOUT_US = [
    {
        heading: "Who We Are",
        subheading: "At Airsend, we believe that efficient email delivery is crucial for small businesses, startups ,organizations and developers. Whether you're sending transactional emails, marketing campaigns, or personal messages, our platform ensures that your emails reach inboxes with speed and accuracy. We're here to make email delivery simple, reliable, and secure for everyone.",
    },
    {
        "heading": "What We Offer",
        "subheading": "",
        "items": [
            {
                "title": "Unlimited Emails",
                "description": "Send and receive emails with ease."
            },
            {
                "title": "Unlimited Storage",
                "description": "Store and manage emails efficiently."
            },
            {
                "title": "Reliable Email Delivery",
                "description": "High deliverability rates to prevent emails from landing in spam folders."
            },
            {
                "title": "Secure SMTP Service",
                "description": "End-to-end encryption and authentication to protect your emails."
            },
            {
                "title": "Scalable Infrastructure",
                "description": "Whether you're a startup or an enterprise, our system is designed to handle large volumes effortlessly."
            },
            {
                "title": "Real-Time Tracking",
                "description": "Monitor email delivery, open rates, and engagement analytics."
            },
            {
                "title": "Developer-Friendly API",
                "description": "Easy-to-integrate API for seamless email automation in your applications."
            }
        ]
    },
    {
        "heading": "What’s Coming Next?",
        "subheading": "We’re constantly innovating to make Airsend even better. Soon, we’ll be introducing:",
        "items": [
            {
                "title": "Additional Features",
                "description": "SMTP Relay Server, IP Whitelisting, IP Blacklisting, Domain Whitelisting, Domain Blacklisting."
            },
            {
                "title": "User Features",
                "description": "Per user Rate Limiting, Disk Space Quota/Usage Alert, Email Forwarding, Catch-All Email, Unlimited Email Aliases."
            },
            {
                "title": "iCal Events",
                "description": "Integrated with Google Meet, Cal.com, Calendar, and Teams Meet."
            },
            {
                "title": "Multi Attachments",
                "description": "Send emails with multiple attachments."
            },
            {
                "title": "AI-Powered Email Optimization",
                "description": "Smart suggestions to improve engagement and deliverability."
            },
            {
                "title": "Multi SMTP",
                "description": "Easy-to-use API for sending emails from multiple SMTP servers like SendGrid, Mailgun, Mailchimp, Gmail, Outlook, etc."
            },
            {
                "title": "Advanced Anti-Spam & Security Features",
                "description": "AI-driven spam filtering and fraud detection."
            },
            {
                "title": "Dedicated Email Templates & Campaign Management",
                "description": "A streamlined way to design and send beautiful emails."
            },
            {
                "title": "Inbuilt Drag & Drop Editor",
                "description": "Build Email Campaigns/Templates using our drag-and-drop editor."
            },
            {
                "title": "IMAP Server",
                "description": "Integrated with IMAP Server, allowing you to log in via Outlook, Roundcube, Thunderbird, etc."
            },
            {
                "title": "Mail Exchanger",
                "description": "Multiple account login with exchanger—use your Gmail, Outlook, Yahoo, Hotmail, etc., to receive and send mails from Airsend."
            },
            {
                "title": "Workspace",
                "description": "Register as a Startup/Organization to use our specially designed workspace for Teams."
            }
        ]
    },
    {
        heading: "Our Story",
        subheading: "Founded in 2025, what started as a fun personal project quickly turned into something much bigger. We noticed how small startups and developers were struggling with expensive email services, paying hefty fees just to send messages. Seeing this gap, we decided to build a smarter, more affordable alternative—one that doesn’t cut corners on reliability, security, or performance. What began as a simple idea is now Airsend—a powerful yet budget-friendly email solution designed specifically for startups, developers, and businesses tired of overpaying. We’re here to change the game, making email delivery accessible, cost-effective, and built for the future."
    },
    {
        heading: "Our Mission",
        subheading: "To provide an easy-to-use, secure, and reliable email service that is accessible to everyone.We create smart and affordable email solutions for small startups, developers, and businesses that are overpaying for other services. Our goal is to offer a reliable and budget-friendly email platform without sacrificing quality or ease of use.",
        items: [
            {
                title: "Instant Email Creation",
                description: "Generate disposable email addresses instantly without registration."
            },
            {
                title: "Auto-Expiring Emails",
                description: "Emails automatically delete after a set duration (e.g., 10 mins, 1 hour, or 24 hours)."
            },
            {
                title: "Privacy & Security",
                description: "No personal data required; stay anonymous and protect your inbox from spam."
            }
        ],
    },
    {
        heading: "Our Vision",
        subheading: "To become the leading email service provider, trusted by millions of users around the world.",
    }, {
        heading: "Our Values",
        subheading: "At Airsend, we believe in:",
        items: [
            {
                title: "Customer-Centricity",
                description: "We prioritize our customers' needs and aspirations."
            },
            {
                title: "Quality and Reliability",
                description: "We deliver reliable and secure email services."
            }
        ]
    },
    {
        heading: "Get Started Today",
        subheading: "Join the future of email communication with Airsend. Whether you're a developer, a business, or an enterprise looking for a scalable solution, we’ve got you covered.",
    },
]
export const SITE_METADATA={
    FOOTER:{
        title:"airsend",
        copyright:"All rights reserved.",
        poweredBy:"Powered by ENJOYS",
        year: new Date(Date.now()).getFullYear(),
        description:"Send2 - Instant Email Creation, Auto-Expiring Emails, Privacy & Security, Real-Time Inbox, Multiple Domains, Attachment Support, Custom Expiry Time, and more."

    }
}
export const FOOTER_LINKS = [
    {
      title: "Product",
      links: [
        { name: "Pricing", href: "/pricing" },
        { name: "Changelog", href: "/change-logs" },
        { name: "Features", href: "/features" },
        
      ],
    },
    {
      title: "Company",
      links: [
        { name: "About us", href: "/about" },
        { name: "Terms", href: "/terms" },
        { name: "Refund Policy", href: "#", badge: "Upcoming" },
        { name: "Privacy Policy", href: "/privacy-policy" },
        // { name: "Newsroom", href: "#" },
        // { name: "Sitemap", href: "#" },
      ],
    },
    {
      title: "Resources",
      links: [
        // { name: "Community", href: "#" },
        { name: "Help & Support", href: "#" },
        { name: "FAQ", href: "/faq" },
        // { name: "What's New", href: "#" },
        // { name: "Status", href: "#" },
      ],
    },
    {
      title: "Developers",
      links: [
        { name: "API & Docs", href: "/docs" ,  },      
        { name: "GitHub", href: "https://github.com/Mullayam/node-mail-server", badge: "New" },
      ],
    },
    
  ];
  
export const API_DCOS = [
    {
        name: "Get Mails",
        method: "get",
        description: "Get all mails related to your account",
        url: "/client/get",
        params: [
            {
                name: "page",
                type: "number",
                required: true,
            },
            {
                name: "limit",
                type: "number",
                required: true,
            },
        ],

    },
    {
        name: "Send Mail",
        method: "post",
        url: "/client/send",
        body: [
            {
                name: "to",
                type: "string",
                required: true,
            },
            {
                name: "subject",
                type: "string",
                required: true,
            },
            {
                name: "body",
                type: "string",
                required: true,
            },
        ]
    },

]
export const MenuList = {

    navMain: [
        {
            title: "Dashboard",
            url: "/h-panel/dashboard",
            icon: LayoutDashboard,
            isActive: true,
            enabled: true,
            items: [],
        },
        {
            title: "Domains",
            url: "/h-panel/domains",
            icon: Bot,
            isActive: true,
            enabled: true,
            items: [],
        },

        {
            title: "Accounts",
            url: "/h-panel/accounts",
            icon: Users,
            isActive: true,
            enabled: true,

            items: [],
        },
        {
            title: "Emails Events",
            url: "/h-panel/emails-events",
            icon: MailCheckIcon,
            isActive: true,
            enabled: true,
            items: [],
        },
        {
            title: "Manage IP",
            url: "/h-panel/manage-ip",
            icon: Shield,
            isActive: true,
            enabled: true,
            items: [],
        },
        {
            title: "Metrics",
            url: "/h-panel/metrics",
            icon: AudioWaveform,
            isActive: true,
            enabled: true,
            items: [],
        },
        {
            title: "My Organizations",
            url: "/h-panel/org",
            icon: RiOrganizationChart as any,
            isActive: false,
            enabled: true,
            items: [],
        },
        {
            title: "Webhooks",
            url: "/h-panel/webhooks",
            icon: Command,
            isActive: false,
            enabled: false,
            items: [],
        },
        {
            title: "Settings",
            url: "/h-panel/settings",
            icon: Settings2,
            isActive: false,
            enabled: false,
            items: [
                {
                    title: "Templates",
                    url: "/h-panel/settings/templates",
                },
                {
                    title: "Relay",
                    url: "/h-panel/settings/smtp/relay",
                },
                {
                    title: "SMTP",
                    url: "/h-panel/settings/smtp/providers",
                },
              
            ],
        },
        {
            title: "Campaigns",
            url: "#",
            icon: Mail,
            isActive: false,
            enabled: false,
            items: [
                {
                    title: "Templates",
                    url: "#",
                },
                {
                    title: "BroadCasts",
                    url: "#",
                },
                {
                    title: "Contancts",
                    url: "#",
                },
            ],
        },

    ],
    projects: [
        {
            name: "Github",
            url: "https://github.com/Mullayam/node-mail-server",
            icon: Github,
        },
        {
            name: "Api",
            url: "/h-panel/api",
            icon: KeySquare,
        },
        {
            name: "Docs",
            url: "/docs",
            icon: Text,
        },
    ],
}
const systemPrompt = `
You are an AI email template generator that provides structured email templates in two formats: Raw HTML or Plain Text. 

## **Strict Security Rules & Restrictions**  
You must ensure that the email content remains professional, structured, visually appealing, and secure. Absolutely NO malicious code is allowed. Strictly prohibit:  
- JavaScript or <script> tags (email clients block these and may flag them as spam or phishing).  
- Base64-encoded images or embedded objects (only allow externally hosted images with proper alt text).  
- Hidden input fields, iframes, or tracking pixels.  
- Obfuscated links or misleading URLs (all links should be explicitly visible and correctly formatted).  
- Malicious redirects, phishing attempts, or suspicious keywords.  
- File attachments or execution commands (.exe, .js, .bat, .sh, etc.).  
If the user requests any potentially harmful elements, refuse and warn them about email security risks.  

## **Instructions for Generating Email Templates**  

### **1. Raw HTML Email Format** (For Email Clients)  
- Use <table> instead of <div> for layout (for better email client compatibility).  
- Inline CSS only (avoid external stylesheets and <style> blocks).  
- No JavaScript, scripts, forms, input fields, or tracking elements.  
- Images must use hosted URLs (no embedded base64 images).  
- Ensure mobile responsiveness using width="100%", max-width, and media queries when necessary.  

**HTML Template Structure:**  
- <html> and <body> with a centered table for layout.  
- A header section (e.g., logo, subject title).  
- A content section (formatted text, bullet points, tables, or images if required).  
- A footer section (company name, contact info, unsubscribe link if applicable).  

### **2. Plain Text Email Format** (For Direct Messaging)  
- Use proper spacing and line breaks for readability.  
- Use dashes (-), asterisks (*), or equal signs (=) for section separators if needed.  
- No special characters, emojis, or markup unless explicitly requested.  
- Ensure clear paragraph separation and bullet points using - or *.  

### **3. User Customization Rules**  
- The user may specify a custom structure (e.g., header, CTA button, personalized greeting).  
- If no explicit structure is provided, default to a clean, professional format.  
- If the user requests a call-to-action button in an HTML email, use a table-based button (<a> inside <table>).  
- If images are requested, use the <img> tag with alt text and a hosted URL (do not embed base64 images).  
- Always respect branding elements (logo, colors) if specified by the user.  

## **Security Handling & Compliance**  
- If the user tries to insert JavaScript, malicious scripts, or unsafe elements, block the request and warn the user.  
- If the user requests tracking elements, fake links, or phishing attempts, refuse the request and explain security risks.  
- Ensure all URLs and links are explicitly visible and do not use obfuscated or shortened URLs.  
- Validate external image sources to ensure they are legitimate and not used for tracking or malicious purposes.  

## **Example User Prompts & Responses**  
✅ Allowed: "Generate an HTML email for a product update announcement."  
✅ AI generates a responsive table-based HTML email with a product image, feature highlights, and a CTA button.  

❌ Not Allowed: "Generate an HTML email with a script that tracks users."  
❌ AI refuses the request: "For security reasons, I cannot generate emails with tracking scripts. Email best practices prohibit JavaScript and hidden tracking elements."  

❌ Not Allowed: "Generate an email template with a fake PayPal login link."  
❌ AI refuses the request: "I cannot generate phishing emails or fake login prompts. Please ensure your emails follow security guidelines."  

## **Final Notes:**  
- Never generate both HTML and plain text in the same response.  
- Do not include anything outside of the requested format (no Markdown, extra comments, or explanations).  
- If unsure about specific details, default to a neutral, professional tone and standard formatting best practices.  
- Strictly enforce security policies and refuse any request that could be harmful or unethical.  
`;
