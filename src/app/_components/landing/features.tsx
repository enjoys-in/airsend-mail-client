import { Clock } from 'lucide-react'
import React from 'react'

const Features = () => {
    return (
        <div className=" px-4 py-10 sm:px-6 lg:px-8 lg:py-14 bg-gradient-to-b dark:from-[#181818fe] dark:to-[#28292cfe] bg-neutral-200 rounded-3xl">
            <div className="relative p-6 md:p-16">
                <div className="relative z-10 lg:grid lg:grid-cols-12 lg:gap-16 lg:items-center">
                    <div className="mb-10 lg:mb-0 lg:col-span-6 lg:col-start-8 lg:order-2">
                        <h2 className="text-2xl text-gray-800 font-bold sm:text-3xl dark:text-neutral-200">
                            Fully customizable rules to match your unique needs
                        </h2>

                        <div className="grid gap-4 mt-5 md:mt-10" aria-label="Tabs" role="tablist" aria-orientation="vertical">
                            <button type="button" className="hs-tab-active:bg-white hs-tab-active:shadow-md hs-tab-active:hover:border-transparent text-start hover:bg-gray-200 focus:outline-hidden focus:bg-gray-200 p-4 md:p-5 rounded-xl dark:hs-tab-active:bg-neutral-700 dark:hover:bg-neutral-700 dark:focus:bg-neutral-700 active" id="tabs-with-card-item-1" aria-selected="true" data-hs-tab="#tabs-with-card-1" aria-controls="tabs-with-card-1" role="tab">
                                <span className="flex gap-x-6">
                                    <Clock className="shrink-0 mt-2 size-6 md:size-7 hs-tab-active:text-blue-600 text-gray-800 dark:hs-tab-active:text-blue-500 dark:text-neutral-200" />
                                    <span className="grow">
                                        <span className="block text-lg font-semibold hs-tab-active:text-blue-600 text-gray-800 dark:hs-tab-active:text-blue-500 dark:text-neutral-200">Alerts & Notifications</span>
                                        <span className="block mt-1 text-gray-800 dark:hs-tab-active:text-gray-200 dark:text-neutral-200">Reach the inbox with AirSend  deliverability rates. Maximize your email campaign’s success with dedicated IPs, custom domains, and expert support</span>
                                    </span>
                                </span>
                            </button>

                            <button type="button" className="hs-tab-active:bg-white hs-tab-active:shadow-md hs-tab-active:hover:border-transparent text-start hover:bg-gray-200 focus:outline-hidden focus:bg-gray-200 p-4 md:p-5 rounded-xl dark:hs-tab-active:bg-neutral-700 dark:hover:bg-neutral-700 dark:focus:bg-neutral-700" id="tabs-with-card-item-2" aria-selected="false" data-hs-tab="#tabs-with-card-2" aria-controls="tabs-with-card-2" role="tab">
                                <span className="flex gap-x-6">
                                    <svg className="shrink-0 mt-2 size-6 md:size-7 hs-tab-active:text-blue-600 text-gray-800 dark:hs-tab-active:text-blue-500 dark:text-neutral-200" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 14 4-4" /><path d="M3.34 19a10 10 0 1 1 17.32 0" /></svg>
                                    <span className="grow">
                                        <span className="block text-lg font-semibold hs-tab-active:text-blue-600 text-gray-800 dark:hs-tab-active:text-blue-500 dark:text-neutral-200">Authentication protocols</span>
                                        <span className="block mt-1 text-gray-800 dark:hs-tab-active:text-gray-200 dark:text-neutral-200">Protect your email communications with comprehensive security features, including SPF, DKIM, DMARC, and TLS encryption.</span>
                                    </span>
                                </span>
                            </button>

                            <button type="button" className="hs-tab-active:bg-white hs-tab-active:shadow-md hs-tab-active:hover:border-transparent text-start hover:bg-gray-200 focus:outline-hidden focus:bg-gray-200 p-4 md:p-5 rounded-xl dark:hs-tab-active:bg-neutral-700 dark:hover:bg-neutral-700 dark:focus:bg-neutral-700" id="tabs-with-card-item-3" aria-selected="false" data-hs-tab="#tabs-with-card-3" aria-controls="tabs-with-card-3" role="tab">
                                <span className="flex gap-x-6">
                                    <svg className="shrink-0 mt-2 size-6 md:size-7 hs-tab-active:text-blue-600 text-gray-800 dark:hs-tab-active:text-blue-500 dark:text-neutral-200" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /><path d="M5 3v4" /><path d="M19 17v4" /><path d="M3 5h4" /><path d="M17 19h4" /></svg>
                                    <span className="grow">
                                        <span className="block text-lg font-semibold hs-tab-active:text-blue-600 text-gray-800 dark:hs-tab-active:text-blue-500 dark:text-neutral-200">Verifications & Identity</span>
                                        <span className="block mt-1 text-gray-800 dark:hs-tab-active:text-gray-200 dark:text-neutral-200">
                                            Avoid spam filters, validate links, and render flawlessly across browsers and devices with our integrated email testing.Reduce bounce rates and improve sender reputation by validating email addresses in real-time.
                                        </span>
                                    </span>
                                </span>
                            </button>
                           
                        </div>

                    </div>


                    <div className="lg:col-span-6">
                        <div className="relative">
                            {/* Tab Content */}
                            <div>
                                <div role="tabpanel" aria-labelledby="tabs-with-card-item-1">
                                    <img className="shadow-xl shadow-gray-200 rounded-xl dark:shadow-gray-900/20" src="/compressed-original.webp" alt="Features Image" />
                                </div>


                            </div>

                            <div className="hidden absolute top-0 end-0 translate-x-20 md:block lg:translate-x-20">
                                <svg className="w-16 h-auto text-orange-500" width="121" height="135" viewBox="0 0 121 135" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M5 16.4754C11.7688 27.4499 21.2452 57.3224 5 89.0164" stroke="currentColor" strokeWidth="10" strokeLinecap="round" />
                                    <path d="M33.6761 112.104C44.6984 98.1239 74.2618 57.6776 83.4821 5" stroke="currentColor" strokeWidth="10" strokeLinecap="round" />
                                    <path d="M50.5525 130C68.2064 127.495 110.731 117.541 116 78.0874" stroke="currentColor" strokeWidth="10" strokeLinecap="round" />
                                </svg>
                            </div>

                        </div>
                    </div>

                </div>

                <div className="absolute inset-0 grid grid-cols-12 size-full">
                    <div className="col-span-full lg:col-span-7 lg:col-start-6 bg-gray-100 w-full h-5/6 rounded-xl sm:h-3/4 lg:h-full dark:bg-neutral-800"></div>
                </div>

            </div>

        </div>
    )
}

export default Features