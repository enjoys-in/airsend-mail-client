import { Info } from "lucide-react"

const CHANGE_LOGS = [
    {
        date: "Mar 15, 2026",
        version: "2",
        color: "from-blue-500 to-indigo-600",
        versionNumber: "2.2.0",
        improvements: [
            "Full Documentation Section — Nested routes for all docs pages with sidebar navigation",
            "Account & Workspace Docs — Account creation, workspace management, API keys guide",
            "Domain Setup Docs — Add domain, verify domain, domain settings",
            "DNS Records Docs — MX, SPF, DKIM, DMARC, PTR record configuration guides",
            "Sending Emails Docs — Compose, attachments, templates, requirements",
            "Bulk Sending Docs — IP warmup, best practices, mailing list hygiene",
            "Calendar Docs — Event creation, invitations, reminders",
            "Logs Docs — Activity logs, email logs, bounce logs",
            "Error Messages Reference — Common email server errors with fixes",
            "SMTP Response Codes Reference — Complete 2xx, 4xx, 5xx code reference",
        ],
        bugfixes: [
            "Fixed deprecated images.domains config — migrated to images.remotePatterns in next.config",
        ]
    },
    {
        date: "Mar 13, 2026",
        version: "2",
        color: "from-pink-500 to-emerald-600",
        versionNumber: "2.1.0",
        improvements: [
            "Manage Blocked IPs Page — Global and Per-Domain Tabs with Unblock and Purge All",
            "Super Admin Restriction for Global Blocked IPs Management",
            "Dashboard Chart Skeleton Loading State",
            "Sidebar Width Increased and Active Highlight Full-Width Fix",
            "Sidebar Navigation Entry for Manage IP",
        ],
        bugfixes: [
            "Fixed Dashboard Line Chart Y-Axis Scaling — Peaks No Longer Clipped",
            "Fixed Line Chart Data Type — Converted String Values to Numbers for Proper Rendering",
            "Fixed Dynamic Y-Axis Max with Nice Number Rounding",
            "Fixed Rejected Email Status Badge Color from Purple to Red",
            "Fixed SomethingWentWrong Component to Use Theme-Aware Colors",
            "Fixed Sidebar Menu Button Rounded Corners Override",
        ]
    },
    {
        date: "Mar 10, 2026",
        version: "2",
        color: "from-emerald-500 to-teal-600",
        versionNumber: "2.0.0",
        improvements: [
            "Introduced CalDAV/JMAP Calendar Integration with Go-based CalDev Server",
            "Auto-Sync Calendar Config to Main Backend on Fetch, Create, and Delete",
            "Connected Calendars Settings Page with JMAP Data",
            "MKCALENDAR Rewritten to JMAP Protocol",
            "Converted Metadata to App Router Pattern (createMetadata + JSON-LD)",
            "Module-Level Auth State for Non-React Code (Email + MID Tracking)",
            "Org Settings Refactored into Modular Sections (Email, Server, Security, Privacy, Notifications)",
            "Add Members Page for Organizations",
            "API Handler Module with Crypto and Signing Routes",
            "Security Module Updated with Revised Encryption Methods",
        ],
        bugfixes: [
            "Fixed Empty calender_config.config on Main Backend",
            "Removed X-Signature Header from CalDev API Instance",
            "Fixed IDB Primary Key Mismatch for Settings Sync",
            "Fixed ConnectedCalendars Not Fetching JMAP Data",
            "Fixed Metadata Using Deprecated Pages Router next/head Pattern",
            "Fixed Org Sidebar and Removed Duplicate App-Sidebar Components",
            "Removed Unused Zustand Slices (folders, labels, mail)",
        ]
    },
    {
        date: "Mar 1, 2026",
        version: "2",
        color: "from-teal-500 to-cyan-600",
        versionNumber: "1.17",
        improvements: [
            "Inline Reply Box for Message Thread View",
            "Mail Actions Hook (use-mail-actions) for Centralized Email Operations",
            "Email Context Menu Redesigned",
            "Mail Card UI Overhaul with Status Indicators Component",
            "Mobile Mail Sidebar and Mobile Mail Header",
            "Account Switcher Redesigned for Desktop and Mobile",
            "SpotToolbar Redesigned",
            "IDB Sync Hook API Delta Settings Support",
            "Runtime Config Provider for Dynamic Environment Variables",
        ],
        bugfixes: [
            "Fixed Layout Issues in v2 Desktop and Mobile Layouts",
            "Fixed Signature and UI Bugs in Mail Composer",
            "Fixed Build Errors and Build Script for Docker Deployment",
            "Fixed IDB Sync Hook API with Improved Delta Settings",
            "Fixed Mail Card Client-Side Rendering Issues",
            "Fixed Account Switcher Navigation and Display",
            "Fixed Decoding Component in Message Display",
        ]
    },
    {
        date: "Feb 28, 2026",
        version: "2",
        color: "from-cyan-500 to-blue-600",
        versionNumber: "1.16",
        improvements: [
            "Organization Management — Create, Edit, Settings, Members, Roles",
            "Org Domain Management and Domain History Pages",
            "Org Logs Viewer and Danger Zone Pages",
            "Org Roles Page with CRUD and Permission Management",
            "Settings Shared Components (SettingsSection, SettingToggleRow, SettingSelectRow, SaveSettingsBar)",
            "Signature Creator and Editor Rewrite",
            "Mail Appearance Settings Overhaul",
            "Profile Settings Redesigned",
            "Email Filter and Sieve Filter Dialog Improvements",
            "Footer System Email and Message Toggles in Settings",
            "Email Privacy and Encryption Settings Rework",
            "Calendar Feature Gate — Enable/Disable Calendar per Account in Settings",
            "App Password Setup Flow for CalDev Authentication",
            "IDB Settings Persistence for Calendar and User Configuration",
            "Feature Access Hook (use-feature-access) for Gated Features",
            "User Config Zustand Store with Hydration",
        ],
        bugfixes: [
            "Fixed removeChild Hydration Error in Root Layout",
            "Fixed Hydration Errors Across h-panel Pages",
            "Fixed Socket Connect/Disconnect Stability in SocketContext",
            "Fixed API Instance and ServerAxios Request Handling",
        ]
    },
    {
        date: "Feb 26, 2026",
        version: "2",
        color: "from-blue-500 to-indigo-600",
        versionNumber: "1.15",
        improvements: [
            "Full Calendar UI with Day, Week, Month, and Agenda Views",
            "Sidebar Mini Calendar with Event Dot Indicators per Day",
            "Create, Rename, Change Color, and Delete Calendars from Sidebar",
            "Import and Export ICS Files for Calendar Data",
            "Calendar Event CRUD — Create, Edit, Drag-and-Drop, and Delete Events",
            "Calendar Subscriptions Panel (Subscribe to External Calendars)",
            "New Workspace Module with Go-based Backend Server (Postgres, Redis, WebSocket)",
            "Team/Channel Create, Edit, and Management UI",
            "Channel Sidebar with Team Rail Navigation",
            "Real-Time Messaging with WebSocket Hub and Redis Streaming",
            "Message Input with Mentions, Emoji Picker, and GIF Picker",
            "Threaded Conversations and Side Panel",
            "Polls — Create, Vote, and View Results in Channels",
            "Direct Messages (DM) Support",
            "Invite Member Dialog for Team Collaboration",
            "Team Settings with Roles, Permissions, and Danger Zone",
            "Profile Cards and Status Cards for Members",
            "Mobile Workspace Sidebar and Bottom Actions",
            "OpenTelemetry Instrumentation Setup",
        ],
        bugfixes: [
            "Fixed Calendar Events Visibility Not Updating on Toggle",
            "Fixed Calendar Route Accessibility Without Feature Gate",
        ]
    },
    {
        date: "Feb 10, 2026",
        version: "2",
        color: "from-indigo-500 to-violet-600",
        versionNumber: "1.14",
        improvements: [
            "Docker Build with Standalone Output and Build Script",
            "Dockerized Deployment with Optimized Dockerfile",
        ],
        bugfixes: [
            "Fixed Docker Port Configuration",
        ]
    },
    {
        date: "Oct 31, 2025",
        version: "1",
        color: "from-violet-500 to-purple-600",
        versionNumber: "1.13",
        improvements: [
            "SMTP Relay Configuration with Enhanced Relay Form and Table",
            "SMTP/Email Provider Config Form Rewrite",
            "Updated Changelog Page UI",
        ],
        bugfixes: [
            "Fixed Build Errors",
            "Fixed IDB Sync Hook Ordering",
        ]
    },
    {
        date: "Oct 30, 2025",
        version: "1",
        color: "from-purple-500 to-fuchsia-600",
        versionNumber: "1.12",
        improvements: [
            "WIP- Sync Engine Under Integration",
            "Show IMAP/SMTP Details in Accounts",
            "User can Reset/Change Password",
            "Allow Wildcard for email"

        ],
        bugfixes: [
            "Fix User Logout Issue in Webmail",
            "Fix the Domain Logs Displayed",
            "Update the Mail usage while sending and receiving mails",
            "Fix RFC5322 Headers",
            "Fix Private Key Error on Encryption of Mail"
        ]
    },
    {
        date: "Oct 25, 2025",
        version: "1",
        color: "from-fuchsia-500 to-indigo-600",
        versionNumber: "1.11",
        improvements: [

            "Update the Path for the Webmail",
            "Show IMAP/SMTP Details in Accounts",
            "User can Reset/Change Password",
            "Sieive Filter Engine Added",
        ],
        bugfixes: [
            "Fix Docs and API page",
            "Fix the Domain Logs Displayed",
            "Update the Mail usage while sending and receiving mails",
            "Fix Request Thresold for SpamFilteration"

        ]
    },
    {
        date: "Oct 20, 2025",
        version: "1",
        color: "from-indigo-500 to-blue-600",
        versionNumber: "1.10",
        improvements: [
            "Implemented send mail2 with improved dispatch logic and fallback handling",
            "Added initial send mail workflow for outbound email service",
            "Introduced new email notification system for inbound/outbound mail activity",
            "Updated encryption method to refine AES key handling and cipher padding",
            "Updated encryption method v2 to ensure 16-bit key compatibility",
            "Fixed decryption key mismatch with proper key length enforcement",
            "Uploaded Redis payload (v1, v2, v3) for queued mail event persistence",
        ],
        bugfixes: [
            "Added Mbox ID mapping for consistent mailbox identification",
            "Implemented threshold and IP check for rate limiting and anomaly detection",
            "Updated keys for secure mail encryption handling",
            "Fixed headers to improve MIME/SMTP compatibility",
            "Enhanced mail delivery reliability and status tracking",

        ]
    },
    {
        date: "Oct 12, 2025",
        version: "1",
        color: "from-blue-500 to-sky-600",
        versionNumber: "1.9",
        improvements: [
            "IP Block and Rate Limiting Added",
            "IMAP Supports Added"
        ],
        bugfixes: [
            "Fixed Undefined on Domains",
            "Fix Splash Screen issue",

        ]
    },
    {
        date: "Sep 27, 2025",
        version: "1",
        color: "from-sky-500 to-cyan-600",
        versionNumber: "1.7",
        improvements: [
            "Added Attachment Support",
            "Introduced Threading Support like Gmail/Outlook",
            "Added New Apis Endpoint",
            "Added OFS Browser Support",
        ],
        bugfixes: [
            "Fix Cache Key names according to new naming convention",
            "Update Types",
            "Fix Socket Connect/Disconnect Issue",
            "Upaded the Ui of Display Mails"]
    },


    {
        date: "Aug 30, 2025",
        version: "1",
        color: "from-cyan-500 to-teal-600",
        versionNumber: "1.6",
        improvements: [
            "Update the Version",
            "Added Charts and Analytics",
            "Updated the OpenPGP E2E  Encryption(3 Layer protection)",
            "Message Decoding on the Client Side",
            "Added Splash Screen",
        ],
        bugfixes: [
            "Fix the 500 Error on some pages",
            "Update the IDB Version",
            "Update the IDB Tables ",

        ]
    },
    {
        date: "Aug 27, 2025",
        version: "1",
        color: "from-teal-500 to-orange-600",
        versionNumber: "1.5",
        improvements: [
            "User Can Now Send Mails",
            "Can See Mail, Decrypted and Read it",
            "Adding User Events (Delete, Move, Star, Unstar etc)",
        ],
        bugfixes: [
            "Used Custom Plain Text Editor",
            "Shadcn UI Lexical Editor Version",
            "Update the Mail usage while sending and receiving mails",
        ]
    },
    {
        date: "Aug 20, 2025",
        version: "1",
        color: "from-orange-500 to-yellow-600",
        versionNumber: "1.4",
        improvements: [
            "Fixing the on going Bugs",
            "Enabled sending mails to  Outlook/Microsoft",
            "Added E2E encryption -  OpenPGP",
        ],
        bugfixes: [
            "Replace Lexical with PlateJS in the editor",
            "Fixed some issues related to the editor",
            "Fixed API Last Usage and count"
        ]
    },
    {
        date: "May 20, 2025",
        version: "1",
        color: "from-yellow-500 to-red-600",
        versionNumber: "1.3",
        improvements: [
            "Fixing the on going Bugs",
            "Enabled sending mails to  Outlook/Microsoft",
            "Added E2E encryption -  OpenPGP",
        ],
        bugfixes: [
            "Replace Lexical with PlateJS in the editor",
            "Fixed some issues related to the editor",
            "Fixed API Last Usage and count"
        ]
    },
    {
        date: "May 1, 2025",
        version: "1",
        color: "from-red-500 to-blue-600",
        versionNumber: "1.2",
        improvements: [
            "Update the UI, Added Logo, and Changelog",
            "Calender in Upcoming Releases",
            "User Can Send Mails",
            "Updated the Mailbox UI"

        ],
        bugfixes: [
            "Replace Lexical with PlateJS in the editor",
            "Fixed some issues related to the editor",
            "Fixed API Last Usage and count"
        ]
    },
    {
        date: "Mar 20, 2025",
        version: "1",
        color: "from-blue-500 to-purple-600",
        versionNumber: "1.1",
        improvements: [
            "Added some new pages Pricing,Features and Changelog",
            "Upated the AboutUs, Terms, and Privacy page",
            "Added Developer APIs",
            "Updated the Dashboard UI"

        ],
        bugfixes: [
            "Replace Lexical with PlateJS in the editor",
            "Fixed some issues related to the editor",
            "Fixed API Last Usage and count"
        ]
    },
    {
        date: "Jan 20, 2025",
        version: "1",
        color: "from-purple-600 to-pink-500",
        versionNumber: "1.0",
        improvements: [
            "Initial release",
            "Introduced Domain,Account,Logs Management",
            "Landing Page",
            "Disposable Emails",
            "Email Analytics",
            "Domain Verification",
            "Domain Management",
        ],
        bugfixes: []
    }
];



export default function ChangelogPage() {
    return (
        <div className="bg-gradient-to-b dark:from-[#1d1e24fe] dark:to-[#18181B]  from-[#F5F5F5] to-[#E5E5E5] text-white">
            {/* Header */}
            <div className="relative overflow-hidden rounded-lg mx-auto max-w-5xl mb-8">
                <div className="bg-gradient-to-r from-blue-500 via-cyan-400 to-orange-500 p-10 relative">
                    <div className="absolute inset-0 opacity-60">
                        <div className="absolute top-0 left-0 w-64 h-64 bg-cyan-300 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
                        <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3"></div>
                        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-orange-400 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-400 rounded-full blur-3xl transform translate-x-1/2 translate-y-1/2"></div>
                    </div>
                    <h1 className="text-4xl font-bold text-center relative z-10">What's new?</h1>
                </div>
            </div>

            {/* Subtitle */}
            <div className="max-w-5xl mx-auto px-6 mb-12 flex justify-between items-center">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <Info className="w-5 h-5" />
                    <p>
                        A changelog of the latest <span className="font-semibold">Airsend</span> feature releases, product updates
                        and important bug fixes.
                    </p>
                </div>
                <div className="text-gray-600 dark:text-gray-300">
                    <p>Changelog in 2025 - 2026</p>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-6">
                <div className="relative">
                    <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-700"></div>
                    {
                        CHANGE_LOGS.map((log) => (
                            <div key={log.versionNumber} className="py-12 relative">
                                <div className="flex items-start">
                                    <div className="relative z-10 mr-8">
                                        <div className="w-8 h-8 rounded-full border-4 border-[#1e2130] bg-gray-700 flex items-center justify-center"></div>
                                        <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">{log.date}</div>
                                    </div>
                                    <div className="flex-1">
                                        <div className={`bg-gradient-to-br  rounded-3xl p-6 relative overflow-hidden ${log.color}`}>
                                            <div className="absolute right-6 top-1/2 -translate-y-1/2 text-8xl font-bold text-white opacity-90">
                                                {log.versionNumber}
                                            </div>
                                            <div className="relative z-10 max-w-[70%]">
                                                <h2 className="text-2xl font-bold mb-6">Version {log.version}</h2>

                                                <div className="mb-6">
                                                    <h3 className="text-lg font-semibold mb-3">Improvements & Changes</h3>
                                                    <ul className="space-y-2">
                                                        {
                                                            log.improvements.map((improvement, i) => (
                                                                <li key={i} className="flex items-center justify-start">
                                                                    <span className="mr-2 mt-1.5">•</span>
                                                                    <span>{improvement}</span>
                                                                </li>
                                                            ))
                                                        }

                                                    </ul>
                                                </div>
                                                {log.bugfixes.length > 0 && <div>
                                                    <h3 className="text-lg font-semibold mb-3">Bugfixes</h3>
                                                    <ul className="space-y-2">
                                                        {
                                                            log.bugfixes.map((bugfix, i) => (
                                                                <li key={i} className="flex items-center justify-start">
                                                                    <span className="mr-2 mt-1.5">•</span>
                                                                    <span>{bugfix}</span>
                                                                </li>
                                                            ))
                                                        }
                                                    </ul>
                                                </div>}

                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    }
                </div>
            </div>

        </div>
    )
}

