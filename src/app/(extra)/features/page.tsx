import Link from 'next/link'
import React from 'react'
import FeaturesList from './_components/allFeatures';
import { ALL_FEATURES } from './_components/data';
const features = [
  { id: 1, title: "Privacy Filters", description: "Block trackers, dead pixels, and tracking links to protect your privacy.", icon: "shield-check" },
  { id: 2, title: "Smart Auto Rules", description: "Auto-forward or auto-reply per account with flexible logic.", icon: "arrow-right-circle" },
  { id: 3, title: "Multiple Sender Identities", description: "Send from different names or domains under one account.", icon: "user" },
  { id: 4, title: "Full IMAP/SMTP Support", description: "Sync with your favorite email apps and clients via IMAP/SMTP.", icon: "inbox" },
  { id: 5, title: "Minimalist UI", description: "Clean, distraction-free interface with your own branding.", icon: "view-grid" },
  { id: 6, title: "Bounce Server", description: "Handle delivery failures with a dedicated bounce handler.", icon: "refresh" },
  { id: 7, title: "BIMI Support", description: "Boost brand trust with BIMI logo support in email clients.", icon: "star" },
  { id: 8, title: "Custom Filters (Sieve)", description: "Build advanced rules to filter, tag, or sort incoming emails.", icon: "filter" },
  { id: 9, title: "ReBAC Access Control", description: "Relationship-based permissions for fine-grained sharing and security.", icon: "key" },
  { id: 10, title: "Encrypted Mail Support", description: "Send end-to-end encrypted emails with password or private key.", icon: "lock-closed" },
  { id: 11, title: "Analytics Dashboard", description: "Track total mails sent/received with detailed stats (bounced, delivered, failed).", icon: "chart-pie" },
  { id: 12, title: "Add Unlimited Domains", description: "Add unlimited domains to your account for better management.", icon: "domain" },
  { id: 13, title: "Create Unlimited Accounts", description: "Create an unlimited number of accounts for different purposes.", icon: "user-group" },
  { id: 14, title: "Disposable Mails", description: "Generate temporary, disposable email addresses for privacy.", icon: "trash" },
  { id: 15, title: "List Your Domain for Disposable Mails", description: "Register your domain to be used with disposable emails.", icon: "list" },
  { id: 16, title: "Multi SMTP Support", description: "Supports multiple SMTP providers such as Gmail, Outlook, SendGrid, Zoho, and more.", icon: "server" },
  { id: 17, title: "Send/Receive Mail via API", description: "Programmatically send and receive emails with a powerful API.", icon: "code" },
  { id: 18, title: "API Usage Tracking", description: "Track your API usage for better monitoring and management.", icon: "chart-line" },
  { id: 19, title: "Mail Tracking", description: "Track opened, bounced, or delivered emails for better insights.", icon: "tracking" },
  { id: 20, title: "Web Browser Mail Client", description: "Access your emails directly from your web browser.", icon: "desktop" },
  { id: 21, title: "Web Browser IMAP Client", description: "Use IMAP for secure access to your emails from a browser.", icon: "inbox" },
  { id: 22, title: "AI-Based Text Editor", description: "AI-powered email editor for smarter composing and replies.", icon: "pencil-alt" },
  { id: 23, title: "Labels, Folders, and Categorization", description: "Organize your emails with labels, folders, and categories for easy management.", icon: "folder" },
  { id: 24, title: "Email Aliases & Forwarding", description: "Create email aliases and forward emails to any address.", icon: "paper-plane" },
  { id: 25, title: "Auto-Reply & Vacation Responder", description: "Set up automated responses for when you're unavailable.", icon: "reply-all" },
  { id: 26, title: "Send Emails via Email Aliases Address", description: "Send emails from alias addresses to manage multiple identities.", icon: "envelope" },
  { id: 27, title: "CatchAll Emails", description: "Capture all emails sent to your domain, regardless of the address.", icon: "inbox" },
  { id: 28, title: "Disk Quota & Email Limits", description: "Set limits on disk usage and the number of emails sent/received.", icon: "hdd" },
  { id: 29, title: "Block Senders/Recipients", description: "Block unwanted senders or recipients to improve email security.", icon: "ban" },
  { id: 30, title: "Zoom & Zoho Calendar Support", description: "Integrate Zoom and Zoho calendars for a more complete workflow.", icon: "calendar" },
  { id: 31, title: "IMAP Login for Secure Email Access", description: "Use IMAP login to ensure secure access to your email.", icon: "lock" },
  { id: 32, title: "Campaigns", description: "Create and manage email marketing campaigns with ease.", icon: "mail" },
  { id: 33, title: "Drag and Drop Template Builder", description: "Easily design email templates with a drag-and-drop interface.", icon: "template" },
  { id: 34, title: "Organization and Workspace Like Teams", description: "Create teams and manage mailboxes like a professional workspace.", icon: "users" },
  { id: 35, title: "Multiple Sender Identities", description: "Use multiple sender identities to send emails from different addresses.", icon: "id-badge" },
  { id: 36, title: "Domain Blocking", description: "Block specific domains from sending or receiving emails.", icon: "shield" },
  { id: 37, title: "Alias Management", description: "Create and manage email aliases to better organize your communication.", icon: "user-alt" },
  { id: 38, title: "Custom Filters (Sieve)", description: "Write custom sieve filters for advanced email sorting and processing.", icon: "filter" },
  { id: 39, title: "ReBAC-based Access Control", description: "Implement relationship-based access control for enhanced security.", icon: "key" },
  { id: 40, title: "Send Encrypted Mails", description: "Encrypt emails using passwords or private keys to ensure confidentiality.", icon: "lock" },
];



const page = () => {
  return (
    <>
      <div className="relative z-10 dark:bg-neutral-900 bg-neutral-200">
        <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
          <div className="max-w-2xl text-center mx-auto">
            <div className="flex justify-center">
              <Link className="inline-flex bg-black items-center gap-x-2  border border-gray-200 text-xs text-gray-200 p-2 px-3 rounded-full transition hover:border-gray-300 focus:outline-hidden focus:border-gray-300 dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-400 dark:hover:border-neutral-600 dark:focus:border-neutral-600" href="https://enjoys.in">
                Airsend: A vision for 2025
                <span className="flex items-center gap-x-1">
                  <span className="border-s border-gray-200 text-blue-600 ps-2 dark:text-blue-500 dark:border-neutral-700">Explore</span>
                  <svg className="shrink-0 size-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                </span>
              </Link>
            </div>

            {/* Title */}
            <div className="mt-5 max-w-2xl">
              <h1 className="block font-semibold text-gray-800 text-4xl md:text-5xl lg:text-6xl dark:text-neutral-200">
                Airsend
              </h1>
            </div>
            {/* End Title */}

            <div className="mt-5 max-w-3xl">
              <p className="text-lg text-gray-600 dark:text-neutral-400">
                Airsend is a web application that provides a secure and easy-to-use platform for users to manage their emails.
              </p>
            </div>

            {/* Buttons */}
            <div className="mt-8 gap-3 flex justify-center">
              <Link className="py-3 px-4 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 focus:outline-hidden focus:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none" href="/h-panel">
                Get started
                <svg className="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
              </Link>

            </div>
          </div>
        </div>
      </div>

      <div className="dark:bg-neutral-900 bg-neutral-200">
        {/* Approach */}
        <div className="max-w-5xl px-4 xl:px-0 py-10 lg:pt-20 lg:pb-20 mx-auto">
          {/* Title */}
          <div className="max-w-3xl mb-10 lg:mb-14">
            <h2 className="text-white font-semibold text-2xl md:text-4xl md:leading-tight">Our Features</h2>
            <p className="mt-1 text-neutral-400">
              Our Disposable Mail Service provides instant, anonymous, and secure temporary email addresses. Receive emails in real-time, avoid spam, and protect your privacy. Features include auto-expiring emails, multiple domains, attachment support, bulk email generation, and API integration. No registration required—just generate, use, and dispose! Perfect for quick verifications and testing.
            </p>
          </div>
          <div>

            <section className="bg-neutral-200 dark:bg-neutral-900 py-16">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid gap-10 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {features.map((feature) => (
                    <div key={feature.id} className="flex items-start space-x-4">
                      <svg
                        className="h-6 w-6 text-gray-500 dark:text-gray-200 mt-1"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="M4 12l8 8 8-8M4 12l8-8 8 8"
                        />
                      </svg>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-500 dark:text-gray-400">{feature.title}</h3>
                        <p className="text-sm text-gray-500">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* <Link className="group inline-flex items-center gap-x-2 py-2 px-3 bg-[#ff0] font-medium text-sm text-neutral-800 rounded-full focus:outline-hidden" href="/h-panel">
              Show all features
            </Link> */}
          </div>
          {/* <FeaturesList data={ALL_FEATURES} /> */}
        </div>
      </div>

    </>
  )
}

export default page