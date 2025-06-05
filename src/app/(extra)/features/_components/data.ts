export const ALL_FEATURES = [
    {
      category: "Email Service",
      features: [
        {
          title: "Dashboard Analytics",
          subFeatures: [
            "Total Sent/Received Mails",
            "Total Delivered/Bounced Mails",
            "Daily Sent/Received/Delivered/Bounced Mails",
            "Total Accounts",
            "Total Domain",
            "Calculate Increase/Decrease Percent in Mails"
          ]
        },
        {
          title: "Dashboard Charts",
          subFeatures: [
            "Sent/Received/Delivered/Bounced Mails",
            "Day/Week/Month/3 Month/6 Month View",
            "Monthly Increase/Decrease Percent"
          ]
        },
        {
          title: "Add Domain UI Changes",
          subFeatures: [
            "Show Orgs list if user has orgs",
            "List domain for temp mail – restrict access to Org/Features"
          ]
        },
        {
          title: "API Usage Tracking",
          subFeatures: [
            "Update today’s sent/received mails at 12 AM"
          ]
        },
        {
          title: "Metric Events",
          subFeatures: [
            "Events: Queued, Sent, Delivered, Bounced, Failed",
            "Log only Sent and Received events"
          ]
        },
        {
          title: "Account Settings",
          subFeatures: [
            "Mailbox Size/Quota",
            "Limits (API/Daily/Monthly)",
            "Email Aliases",
            "Forwarding",
            "Enable/Disable Sending/Receiving",
            "Advanced Settings (Notifications, Security, Encryption, Identity, Vacation Responder, etc.)",
            "Multi-Sender Support"
          ]
        },
        {
          title: "Mailbox Personalization",
          subFeatures: [
            "Labels/Folders/Categorization",
            "Upload Contacts",
            "Sieve Filters",
            "Additional Mail Settings"
          ]
        },
        {
          title: "Calendar",
          subFeatures: [
            "Create events and invite users",
            "Sync Google/Outlook Calendar",
            "Integrate Google Meet, Zoom, Teams, Zoho, etc."
          ]
        }
      ]
    },
    {
      category: "Organisation",
      features: [
        {
          title: "Org Management",
          subFeatures: [
            "Create Orgs and shift domains",
            "Show Org info in client",
            "Org Admin IAM for domains/accounts"
          ]
        },
        {
          title: "ReBAC Access Control",
          subFeatures: [
            "Powered by OpenFGA"
          ]
        },
        {
          title: "JWT Issuer",
          subFeatures: [
            "Update issuer based on Org"
          ]
        },
        {
          title: "Personalization",
          subFeatures: [
            "Upload logo and Org name",
            "BIMI Record Setup for branding",
            "Centralized Org Settings"
          ]
        }
      ]
    },
    {
      category: "IMAP Mail Client",
      features: [
        {
          title: "Mail Display"
        },
        {
          title: "Basic Settings",
          subFeatures: [
            "Refer to account-level settings"
          ]
        }
      ]
    },
    {
      category: "Workspace",
      features: [
        { title: "Channels" },
        { title: "Chats" },
        { title: "Activity" },
        { title: "Task Planner (like Linear/Circle.dev)" },
        { title: "Files" },
        { title: "Projects" },
        { title: "Help Desk" },
        { title: "Tickets" },
        { title: "Instant Messaging" }
      ]
    },
    {
      category: "Campaigns",
      features: [
        {
          title: "User Engagement Tools",
          subFeatures: [
            "Polls & Surveys in Email",
            "Dynamic Content Based on Behavior",
            "Gamification (Scratch cards, Spin-to-Win)",
            "Countdown Timers / Real-Time Widgets"
          ]
        },
        {
          title: "Integrations",
          subFeatures: [
            "Amazon SES, SparkPost, SendGrid, etc.",
            "CRM: Salesforce, HubSpot",
            "E-commerce: Shopify, WooCommerce",
            "Zapier / Make / Custom Connectors",
            "Media Library: File attachments, Image uploads"
          ]
        },
        { title: "Parallel Sending" },
        { title: "Campaign Calendar View" },
        { title: "Activity Logs" },
        { title: "User Roles & Permissions" },
        { title: "Subscriber, List Reports, Stats" },
        { title: "Unlimited SMTP Servers" },
        { title: "Automation Flow" },
        { title: "Service & Package Management" },
        { title: "Customer and Subscription Management" },
        { title: "Email Verification" },
        { title: "Email Preview Testing" },
        { title: "Embed Subscription Form" },
        { title: "Bulk Subscribe/Unsubscribe" },
        { title: "Advanced Quota & Throttling Management" },
        {
          title: "3rd Party Chat Integrations",
          subFeatures: [
            "Slack, Discord, WhatsApp, Telegram"
          ]
        },
        { title: "Import/Export Contacts" },
        { title: "Campaign Cloning & Versioning" },
        {
          title: "Email Scheduling",
          subFeatures: [
            "Drip Campaigns / Autoresponders",
            "Trigger-Based Automation",
            "Time-based Scheduling"
          ]
        },
        { title: "Personalization Tokens" },
        {
          title: "Template Management",
          subFeatures: [
            "Preview Template",
            "Drag & Drop Template Editor"
          ]
        },
        { title: "Bulk Email Sending" },
        { title: "Contact Grouping" },
        {
          title: "Tracking & Analytics",
          subFeatures: [
            "Open/Click Tracking",
            "Email Logs and Status",
            "Insight Reports",
            "Daily Tracking",
            "Graphical Reports",
            "UTM Tagging",
            "Conversion Tracking",
            "Geolocation & Device Info",
            "Unsubscribe/Bounce/Complaint Rates",
            "Heatmaps",
            "Delivery Reports"
          ]
        },
        {
          title: "Deliverability & Sending",
          subFeatures: [
            "SMTP Relay or Custom Server",
            "Throttling & Queuing",
            "Bounce Handling",
            "Custom From Addresses",
            "Fallback Text Versions",
            "Spam Score Checker"
          ]
        },
        {
          title: "Audience Management",
          subFeatures: [
            "List Management",
            "Subscriber Profiles",
            "Segmentation & Filtering",
            "Tags & Groups",
            "Suppression Lists",
            "Webhooks for sends, opens, etc."
          ]
        }
      ]
    },
    {
      category: "Global Webhooks",
      features: [
        { title: "Campaigns, Emails, Workspace Hooks" }
      ]
    },
    {
      category: "IMAP API",
      features: [
        { title: "Full IMAP API Support" }
      ]
    },
    {
      category: "Calendar API",
      features: [
        { title: "Full Calendar API Support" }
      ]
    }
  ];
  