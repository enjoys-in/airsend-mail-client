"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export const HeroSection = () => {
    return (
        <div className="text-center space-y-8 mx-auto  bg-gradient-to-b dark:from-[#201B39] dark:bg-[#18142b] bg-neutral-100 p-6 md:p-16">
            <motion.div
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="relative overflow-hidden before:absolute before:top-0 before:start-1/2 before:bg-[url('/polygon-bg-element.svg')] dark:before:bg-[url('/polygon-bg-element2.svg')] before:bg-no-repeat before:bg-top before:bg-cover before:w-full before:h-full before:-z-1 before:transform before:-translate-x-1/2 before:pointer-events-none">
                <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-10 relative">

                    <div className="mt-5 text-center mx-auto">
                        <motion.div
                            className="text-4xl md:text-7xl font-bold text-white drop-shadow-lg"
                            initial={{ opacity: 0, y: -50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                        >
                            <span className="bg-gradient-to-r px-4 from-purple-900 dark:via-[#1d1e24fe]   dark:to-[#1d1e24fe] to-neutral-200  rounded-full pl-2 md:pl-4">
                                A powerful
                            </span>{" "}
                            <span className="text-neutral-700 dark:text-neutral-50">solution for mail{" "}</span>
                            <div className="mt-2 md:mt-4">
                                <span className="bg-gradient-to-l px-4 from-green-900 via-[#1d1e24fe] dark:to-[#1d1e24fe] to-neutral-200  rounded-full pr-2 md:pr-4">
                                    management
                                </span>
                            </div>
                        </motion.div>
                    </div>

                    <div className="mt-5 max-w-3xl text-center mx-auto">
                        <p className="text-lg text-neutral-700 dark:text-neutral-200 drop-shadow-md">
                            Custom domains, disposable mailboxes, and powerful email campaigns - all in one place.
                        </p>
                    </div>
                </div>
            </motion.div>

            <div className="space-y-4 md:space-y-6 flex flex-col items-center text-center">
                <motion.div
                    className="flex flex-col md:flex-row items-center space-y-3 md:space-y-0 md:space-x-3"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
                >
                    <Link href={"/h-panel"}>
                        <Button
                            variant="default"
                            size="lg"
                            className="rounded-full dark:bg-[#5a61ff] bg-blue-600 text-base md:text-lg w-full md:w-auto dark:text-gray-200"
                        >
                            Dashboard
                        </Button>
                    </Link>
                    <Link href={"/v2"}>
                        <Button
                            variant="outline"
                            size="lg"
                            className="rounded-full text-black text-base md:text-lg w-full md:w-auto dark:text-gray-200"
                        >
                            Mailbox
                        </Button>
                    </Link>

                </motion.div>

            </div>

            <motion.div
                className="flex items-center justify-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.0, ease: "easeOut" }}
            >
                <Image
                    src="/hero.png"
                    alt="Mail management"
                    height={540}
                    width={1496}
                    className="rounded-lg w-full max-w-[90vw] md:max-w-none"
                    style={{ objectFit: "cover" }}
                />
            </motion.div>

        </div>
    );
};