import { Info } from "lucide-react"

const CHANGE_LOGS = [
    {
        date: "May 1, 2025",
        version: "1.2",
        color: "from-red-600 to-blue-400",
        versionNumber: "1.1",
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
        version: "1.1",
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
        version: "1.0",
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
                                                <h2 className="text-2xl font-bold mb-6">{log.version}</h2>

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

