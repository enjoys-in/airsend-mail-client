export const CHANGE_LOGS = [
    {
        date: "May 28, 2026",
        version: "2",
        color: "from-emerald-500 to-teal-600",
        versionNumber: "2.6.0",
        improvements: [
            "Event Bridge Sync Service — Real-time IMAP ↔ Web client synchronization via socket events with Dexie as single source of truth",
            "Sync Gate — Destructive actions (move, delete, flag) are blocked during sync; read and send always allowed",
            "Optimistic Updates — Local changes write to IndexedDB instantly, rolled back if server rejects",
            "Draft Auto-Save — Compose drafts saved automatically every 3 seconds with debounce, persisted to server and Dexie",
            "Draft Recovery — Unsaved drafts flush on tab close (beforeunload), surviving accidental page refreshes",
            "Sync Cursor Persistence — Last sync position stored in Dexie (sync_meta table), survives sessions for seamless reconnect",
            "Event Deduplication — Prevents duplicate processing during replay/real-time overlap using eventId tracking",
            "Msgpack Decoding — Real-time events decoded from binary msgpack for reduced bandwidth",
            "Sync Overlay UI — Non-blocking progress indicator with transition-safe rendering (no layout shift)",
            "Selective React Hooks — useSyncState, useCanMutate via useSyncExternalStore (no unnecessary re-renders)",
            "IMAP Status Indicator — Isolated Zustand-powered component showing real-time IMAP connection state (no parent re-renders)",
            "Session Status Socket Events — Listens for session.status, session.imap.connected/disconnected via event-bridge",
        ],
        bugfixes: [
            "Fixed compose losing all content on unmount — drafts now persist across open/close cycles",
            "Fixed potential re-render cascade from socket events — Dexie live queries update UI without prop drilling",
            "Fixed move action only syncing source folder count — now syncs both source and destination mailbox counts",
            "Fixed SpotToolbar stub actions — Mark Unread, Archive, Move, Delete All, Report Spam now wired to handlers",
        ]
    },
    {
        date: "May 25, 2026",
        version: "2",
        color: "from-blue-500 to-indigo-600",
        versionNumber: "2.5.0",
        improvements: [
            "Auth Token Expiry Validation — Middleware now validates JWT expiry before granting access to protected routes",
            "Server-Side Cookie Cleanup — Expired tokens are cleared via Set-Cookie header, preventing client-side race conditions",
            "Login Redirect Loop Fix — Users returning after token expiry no longer get stuck in infinite redirect between /v2 and dashboard",
        ],
        bugfixes: [
            "Fixed redirect loop caused by middleware only checking cookie existence instead of token validity",
            "Fixed duplicate 401 handling in fetchCurrentUser thunk (now handled exclusively by axios interceptor)",
            "Removed redundant logout API call and cookie deletion that conflicted with interceptor flow",
        ]
    },
    {
        date: "May 24, 2026",
        version: "2",
        color: "from-indigo-500 to-violet-600",
        versionNumber: "2.4.0",
        improvements: [
            "Messages now only accepted (250 OK) after successfully queuing — no more silent mail loss",
            "25 MB message size limit enforced — oversized messages rejected immediately with 552 error",
            "DKIM signing fails fast if private key unavailable — returns 451 temporary error instead of sending unsigned",
            "Brute-force login protection — IPs rate-limited on authentication attempts before credential validation",
            "Wildcard sender accounts restricted to their own domain — prevents cross-domain spoofing",
            "Maximum 50 recipients per message enforced — exceeding returns 452",
            "iCloud/Apple domain block uses exact domain matching (icloud.com, me.com, mac.com)",
        ],
        bugfixes: [
            "Fixed double-callback protocol corruption if error occurred after response was sent",
            "Fixed post-send background tasks (tracking, encryption) crashing handler on failure",
            "Fixed null date in parsed emails causing crashes — now uses current time as fallback",
        ]
    },
    {
        date: "May 10, 2026",
        version: "2",
        color: "from-violet-600 to-purple-500",
        versionNumber: "2.3.1",
        improvements: [
            "DKIM Signing Fix — mailauth library now receives signing keys in correct signatureData array format",
            "Emails sent via API (SendMailService) now correctly produce valid DKIM-Signature headers",
        ],
        bugfixes: [
            "Fixed DKIM signatures being empty/invalid due to keys passed as top-level options instead of signatureData array",
        ]
    },
    {
        date: "May 2, 2026",
        version: "2",
        color: "from-purple-500 to-violet-600",
        versionNumber: "2.3.0a",
        improvements: [
            "RFC 5322 From Header Compliance — SMTP handler auto-injects From header when client omits it",
            "From header injection occurs before DKIM signing to ensure valid signatures",
        ],
        bugfixes: [
            "Fixed Gmail and strict providers rejecting emails with '550-5.7.1' due to missing From header in raw MIME",
        ]
    },
    {
        date: "Apr 22, 2026",
        version: "2",
        color: "from-fuchsia-600 to-purple-500",
        versionNumber: "2.2.3",
        improvements: [
            "Mailbox Folder Counts — Real-time unread and total count updates on message move, delete, and flag events",
            "Calendar Optimistic Create — New events appear instantly in the calendar UI before server confirmation",
            "Today's Meetings Widget — Mail sidebar now shows upcoming meetings without requiring a calendar page visit",
            "Inbox Zero State — Empty state illustration with quick actions when folder has no messages",
        ],
        bugfixes: [
            "Fixed calendar events not reflecting until manual page refresh",
            "Fixed sidebar meetings widget showing stale data from previous session",
            "Fixed folder count not decrementing when marking message as spam",
        ]
    },
    {
        date: "Apr 10, 2026",
        version: "2",
        color: "from-pink-500 to-fuchsia-600",
        versionNumber: "2.2.2",
        improvements: [
            "Compose Email Performance — Reduced re-renders in editor by isolating toolbar state",
            "Attachment Upload Progress — Real-time progress bar with cancel support using AbortController",
            "Contact Autocomplete — Fuzzy search across recent recipients and address book",
            "Rich Text Paste — Paste from Word/Google Docs preserves formatting cleanly",
        ],
        bugfixes: [
            "Fixed compose dialog losing focus when switching between To/Cc/Bcc fields",
            "Fixed attachment drag-and-drop not working on Firefox",
            "Fixed contact suggestions showing duplicates from different sources",
        ]
    },
    {
        date: "Mar 28, 2026",
        version: "2",
        color: "from-rose-500 to-pink-600",
        versionNumber: "2.2.1",
        improvements: [
            "Thread View Optimization — Lazy-load message bodies in long threads (only expanded messages render HTML)",
            "Keyboard Shortcuts — j/k navigation, e to archive, # to delete, r to reply, a to reply-all",
            "Print Email — Clean print stylesheet with header metadata and no UI chrome",
            "Dark Mode Refinements — Improved contrast in mail body rendering and code blocks",
        ],
        bugfixes: [
            "Fixed thread view scrolling to wrong message after mark-as-read",
            "Fixed keyboard shortcuts triggering while typing in search bar",
            "Fixed dark mode inverting embedded images in HTML emails",
        ]
    },
    {
        date: "Mar 15, 2026",
        version: "2",
        color: "from-violet-500 to-purple-600",
        versionNumber: "2.3.0",
        improvements: [
            "IMAP & SMTP Docs — New documentation page with server configuration and email client setup guides",
            "Docs Gradient Background — Docs section background now flows seamlessly from navbar to footer",
            "Sidebar & Mobile Nav — Updated with translucent backdrop-blur to match gradient theme",
            "SMTP Port Update — Changed recommended SMTP port to 587 (STARTTLS) across all docs",
        ],
        bugfixes: [
            "Removed deprecated port 465 (SSL/TLS) as recommended SMTP option",
        ]
    },
    {
        date: "Mar 14, 2026",
        version: "2",
        color: "from-purple-600 to-fuchsia-500",
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
        color: "from-fuchsia-500 to-pink-600",
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
        color: "from-pink-600 to-rose-500",
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
        color: "from-rose-500 to-red-600",
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
        color: "from-red-600 to-orange-500",
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
        color: "from-orange-500 to-amber-600",
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
        color: "from-amber-600 to-yellow-600",
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
        date: "Jan 28, 2026",
        version: "2",
        color: "from-yellow-500 to-amber-500",
        versionNumber: "1.13.4",
        improvements: [
            "V2 Mail Layout — New split-pane layout with resizable sidebar and message preview",
            "Account Switcher V2 — Multi-account switcher with avatar, email, and storage indicator",
            "Search Overhaul — Full-text search across subject, body, from, and to fields with debounce",
            "Pagination Infinite Scroll — Mail list loads more messages on scroll without full page reload",
        ],
        bugfixes: [
            "Fixed mail list flickering on new message received while scrolled",
            "Fixed search results not clearing when switching folders",
            "Fixed account switcher dropdown z-index conflict with compose dialog",
        ]
    },
    {
        date: "Jan 15, 2026",
        version: "2",
        color: "from-amber-500 to-orange-500",
        versionNumber: "1.13.3",
        improvements: [
            "IndexedDB Migration to Dexie.js — Replaced raw IDB calls with Dexie for type-safe, versioned schema",
            "Dexie Live Queries — Mail list and folder counts now auto-update from IndexedDB without manual refresh",
            "Offline Read Support — Previously fetched emails readable without network connection",
            "IDB Garbage Collection — Auto-prune messages older than 30 days from local cache",
        ],
        bugfixes: [
            "Fixed IDB version conflicts when multiple tabs open simultaneously",
            "Fixed stale mail list after bulk delete until manual refresh",
            "Fixed offline mode showing empty inbox instead of cached messages",
        ]
    },
    {
        date: "Dec 20, 2025",
        version: "1",
        color: "from-orange-500 to-red-500",
        versionNumber: "1.13.2",
        improvements: [
            "Socket.IO Reconnection Strategy — Exponential backoff with max 10 retries and transport fallback",
            "Socket Event Queueing — Events queued during disconnect, flushed on reconnect",
            "Connection Status Banner — Non-intrusive UI showing real-time socket connection state",
            "Heartbeat Monitoring — Client-side ping/pong with auto-reconnect on missed heartbeats",
        ],
        bugfixes: [
            "Fixed socket not reconnecting after laptop sleep/wake cycle",
            "Fixed duplicate event processing after reconnect",
            "Fixed connection banner overlapping compose dialog on mobile",
        ]
    },
    {
        date: "Dec 5, 2025",
        version: "1",
        color: "from-red-500 to-rose-600",
        versionNumber: "1.13.1",
        improvements: [
            "Next.js App Router Migration — Migrated remaining pages from Pages Router to App Router",
            "Route Groups — Introduced (extra), v2, and h-panel route groups for layout isolation",
            "Server Components — Landing page and static pages converted to RSC for faster initial load",
            "Streaming SSR — Mail layout uses Suspense boundaries for progressive rendering",
        ],
        bugfixes: [
            "Fixed hydration mismatch errors in theme provider during SSR",
            "Fixed dynamic imports breaking in App Router due to wrong import paths",
            "Fixed middleware redirect loop for unauthenticated API routes",
        ]
    },
    {
        date: "Nov 18, 2025",
        version: "1",
        color: "from-rose-600 to-pink-500",
        versionNumber: "1.13.0",
        improvements: [
            "V2 Design System — New design tokens, spacing scale, and component variants",
            "Tailwind Config Overhaul — Custom color palette, dark mode variables, and animation utilities",
            "UI Component Library — Rebuilt Button, Input, Dialog, Sheet, Popover with Radix primitives",
            "Typography Scale — Consistent text sizing with clamp() for responsive font sizes",
        ],
        bugfixes: [
            "Fixed inconsistent button sizing across different pages",
            "Fixed dialog backdrop not covering full viewport on iOS Safari",
            "Fixed popover positioning offset when page is scrolled",
        ]
    },
    {
        date: "Oct 31, 2025",
        version: "1",
        color: "from-yellow-600 to-lime-600",
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
        color: "from-lime-600 to-green-500",
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
        color: "from-green-500 to-emerald-600",
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
        color: "from-emerald-600 to-teal-500",
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
        color: "from-teal-500 to-cyan-600",
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
        color: "from-cyan-600 to-sky-500",
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
        color: "from-sky-500 to-blue-600",
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
        color: "from-blue-600 to-indigo-500",
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
        color: "from-indigo-500 to-[#7E22CE]",
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
        date: "Jul 10, 2025",
        version: "1",
        color: "from-[#7E22CE] to-[#6D28D9]",
        versionNumber: "1.3.1",
        improvements: [
            "Email Template System — Pre-built templates for onboarding, notifications, and marketing",
            "Bulk Email Preview — Preview bulk emails before dispatch with variable substitution",
            "Scheduled Send — Queue emails for future delivery with timezone-aware scheduling",
        ],
        bugfixes: [
            "Fixed template variables not rendering in preview mode",
            "Fixed scheduled emails sending at wrong time for non-UTC timezones",
        ]
    },
    {
        date: "Jun 15, 2025",
        version: "1",
        color: "from-[#6D28D9] to-[#7E22CE]",
        versionNumber: "1.3.0",
        improvements: [
            "API Key Management — Generate, revoke, and rotate API keys from dashboard",
            "Webhook System — Configure webhooks for email events (delivered, bounced, opened)",
            "Rate Limit Dashboard — Visual rate limit usage and burst allowance monitoring",
        ],
        bugfixes: [
            "Fixed API key creation not showing the key on first generation",
            "Fixed webhook retry logic sending duplicate payloads",
            "Fixed rate limit counter not resetting at window boundary",
        ]
    },
    {
        date: "May 20, 2025",
        version: "1",
        color: "from-[#7E22CE] to-[#BE185D]",
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
        color: "from-[#BE185D] to-[#0E7490]",
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
        color: "from-[#0E7490] to-[#1E40AF]",
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
        date: "Feb 15, 2025",
        version: "1",
        color: "from-[#1E40AF] to-[#3730A3]",
        versionNumber: "1.0.1",
        improvements: [
            "Email Deliverability Improvements — SPF/DKIM/DMARC alignment checks on outbound",
            "Bounce Handling — Automatic soft/hard bounce classification and suppression list",
            "Admin Dashboard — Domain health overview with DNS record status indicators",
        ],
        bugfixes: [
            "Fixed SPF record lookup timeout on domains with many includes",
            "Fixed bounce webhook not firing for 4xx temporary failures",
            "Fixed admin dashboard not loading for newly added domains",
        ]
    },
    {
        date: "Jan 20, 2025",
        version: "1",
        color: "from-[#3730A3] to-[#5B21B6]",
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