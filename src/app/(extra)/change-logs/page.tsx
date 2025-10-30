import { Info } from "lucide-react"

const CHANGE_LOGS = [
    {
        date: "Oct 30, 2025",
        version: "1",
        color: "from-gray-500 to-purple-500",
        versionNumber: "1.12",
        improvements: [
            "WIP- Sync Engine Under Integration",
            "ElectricSql or RxDB Under Integration",
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
        color: "from-purple-500 to-indigo-600",
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
        version: "1.",
        color: "from-orange-600 to-yellow-400",
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
        color: "from-yellow-600 to-red-400",
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
        color: "from-yellow-600 to-red-400",
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
        color: "from-red-600 to-blue-400",
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
        color: "from-blue-600 to-cyan-400",
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
                    <p>Changelog in 2025</p>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-6">
                <div className="relative">
                    <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-700"></div>
                    {
                        CHANGE_LOGS.map((log) => (
                            <div className="py-12 relative">
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

