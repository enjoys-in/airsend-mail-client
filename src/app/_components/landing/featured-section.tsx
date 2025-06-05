"use client";
import Image from "next/image";
import { motion } from "framer-motion";
import { fadeInUp, slideInFromRight } from "@/lib/animations";
import { CheckCircle, Send } from "lucide-react";
// https://preline.co/examples/blog-sections.html
// https://preline.co/examples/blog-articles.html
export const FeaturedSection = () => {
    return (
        <div className="flex flex-col items-center justify-center px-6 py-8 md:px-28 md:py-16 space-y-6  bg-gradient-to-b dark:from-[#1d1e24fe] dark:to-[#181818fe] bg-neutral-200 rounded-3xl">
            <div className="relative">
                <div className="absolute inset-0">
                    <div className="absolute  w-full bg-white  [&>div]:h-[500px] [&>div]:w-[250px] [&>div]:-translate-x-[30%] [&>div]:translate-y-[20%] [&>div]:rounded-full [&>div]:bg-[rgba(173,109,244,0.5)] [&>div]:opacity-50 [&>div]:blur-[80px]">
                        <div />
                    </div>
                </div>
            </div>
            <div className="flex flex-col space-y-4 text-center w-full md:w-1/2 p-4 md:p-8">
                <h2 className="text-3xl md:text-6xl font-bold text-neutral-700 dark:text-neutral-200">
                    Professional email address for your business
                </h2>
                <p className="text-sm md:text-base text-neutral-700 dark:text-neutral-200">
                    Quickly set up email sending with features like dynamic templates,
                    real-time email validation, and deliverability insights. Manage your
                    email infrastructure with tools for authentication, ISP monitoring,
                    and advanced analytics.
                </p>
            </div>

            {/* Grid Section 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 p-6 md:p-20 bg-[#fcffe7fe] dark:bg-[#68686efe] rounded text-black dark:text-neutral-200 relative">
                <div className="flex flex-col space-y-4 w-full md:w-3/4">
                    <motion.div
                        initial="initial"
                        animate="animate"
                        variants={slideInFromRight}
                    >
                        <h2 className="font-bold text-2xl md:text-5xl">
                            Secure, private, professional emails
                        </h2>
                        <p className="text-xl mb-6">
                            Unlike free personal email services, we provide industry-leading
                            security measures to protect your email from unauthorized parties.
                            Our servers have advanced protection to prevent spam, malware, and
                            phishing attacks.
                        </p>
                    </motion.div>
                </div>
                <div className="relative">
                    <div className="absolute inset-0">
                        <div className="absolute top-0 z-[-2]  bg-neutral-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
                    </div>
                    <div className="relative z-10 flex h-full flex-col items-center justify-center px-4">
                        <div className="max-w-3xl text-center">
                            <h1 className="mb-8 text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl dark:text-white">
                                Advanced Email
                                <span className="text-sky-400"> Verification</span>
                            </h1>
                            <p className="mx-auto mb-8 max-w-2xl text-lg dark:text-slate-300">
                                Ensure your emails reach real inboxes. Our powerful verification
                                tool helps you maintain a clean and effective mailing list.
                            </p>
                        </div>
                    </div>
                </div>

                <svg
                    className="absolute bottom-0 left-0 right-0 w-full h-16"
                    viewBox="0 0 1440 320"
                    preserveAspectRatio="none"
                >
                    <path
                        className="fill-neutral-200 dark:fill-zinc-900"
                        d="M0,96L48,112C96,128,192,160,288,186.7C384,213,480,235,576,224C672,213,768,171,864,149.3C960,128,1056,128,1152,149.3C1248,171,1344,213,1392,234.7L1440,256L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
                    ></path>
                </svg>
            </div>

            {/* Grid Section 2 */}
            <div className="grid grid-cols-1 md:grid-cols-3  p-20 bg-[#d4e0defe] dark:bg-[#57575afe] rounded text-black relative">
                <div className="mt-5 sm:mt-10 lg:mt-0">
                    <div className="space-y-6 sm:space-y-8">
                        <div className="space-y-2 md:space-y-4">
                            <h2 className="font-bold text-3xl lg:text-4xl text-black dark:text-neutral-200">
                                Email retention and e-Discovery
                            </h2>
                            <p className="text-gray-500 dark:text-neutral-200">
                                Retain emails across your organization for a specified period to
                                comply with company standards and to counter legal attacks.
                                e-Discovery helps discover such retained emails quickly.{" "}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="mt-5 sm:mt-10 lg:mt-0">
                    <div className="space-y-6 sm:space-y-8">
                        <div className="space-y-2 md:space-y-4">
                            <h2 className="font-bold text-3xl lg:text-4xl text-gray-800 dark:text-neutral-200">
                                Detailed access, action, and delivery logs
                            </h2>
                            <p className="text-gray-500 dark:text-neutral-200">
                                The access and action logs in hPanel let you track what happens
                                in your email accounts and monitor them for suspicious
                                activities. Get information about when and where accounts were
                                accessed from, what actions were taken during those sessions,
                                and what emails were sent and received.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-5 sm:mt-10 lg:mt-0">
                    <div className="space-y-6 sm:space-y-8">
                        <div className="space-y-2 md:space-y-4">
                            <h2 className="font-bold text-3xl lg:text-4xl text-gray-800 dark:text-neutral-200">
                                Plenty of storage to scale your business
                            </h2>
                            <p className="text-gray-500 dark:text-neutral-200">
                                If you want to grow your business, you need the resources to do
                                it. Our hosted business email service offers up to 30 GB of
                                storage space – plenty of room to receive and deliver emails.
                                You can send 500 emails/day and  automatic
                                forwarding rules to redirect messages to other email accounts.
                            </p>
                        </div>
                    </div>
                </div>
                <svg
                    className="absolute bottom-0 left-0 right-0 w-full h-16"
                    viewBox="0 0 1440 320"
                    preserveAspectRatio="none"
                >
                    <path
                        className="fill-neutral-200 dark:fill-zinc-900"
                        d="M0,96L48,112C96,128,192,160,288,186.7C384,213,480,235,576,224C672,213,768,171,864,149.3C960,128,1056,128,1152,149.3C1248,171,1344,213,1392,234.7L1440,256L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
                    ></path>
                </svg>
            </div>
        </div>
    );
};
