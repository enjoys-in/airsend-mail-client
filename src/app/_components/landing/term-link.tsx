import { SITE_METADATA } from '@/lib/data'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

export const TermsLink = () => {
    return (
        <div className="mt-auto w-full max-w-[85rem] py-1 px-4 sm:px-6 lg:px-8 mx-auto">
            <div className="text-center">
                <div>
                
                    <Link
                        className="flex-none text-xl font-semibold text-black dark:text-white sm:hidden md:block"
                        href="https://enjoys.in"
                        aria-label="Brand"
                    >
                        {SITE_METADATA.FOOTER.poweredBy}
                    </Link>
                </div>
                <div className="space-x-4 text-sm">
                    <Link
                        className="inline-flex gap-x-2 text-gray-600 hover:text-gray-800 focus:outline-hidden focus:text-gray-800 dark:text-neutral-400 dark:hover:text-neutral-200 dark:focus:text-neutral-200"
                        href="/terms"
                    >
                        Terms
                    </Link>
                    <Link
                        className="inline-flex gap-x-2 text-gray-600 hover:text-gray-800 focus:outline-hidden focus:text-gray-800 dark:text-neutral-400 dark:hover:text-neutral-200 dark:focus:text-neutral-200"
                        href="/privacy-policy"
                    >
                        Privacy
                    </Link>
                </div>
            </div>

        </div>
    )
}
