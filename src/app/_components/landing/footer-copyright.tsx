import { SITE_METADATA } from '@/lib/data'
import { Link } from 'lucide-react'
import Image from 'next/image'
import React from 'react'

export const FooterCopyright = () => {
    return (
        <div className="relative overflow-hidden  bg-gradient-to-b dark:from-[#0b0b0c] dark:to-[#050505] bg-[#E5E5E5]">


            <div className="relative">
                <div className="w-full max-w-5xl px-4 xl:px-0 py-10 lg:pt-16 mx-auto">
                    <div className="inline-flex items-center">
                        <Image
                            src="/navbar-logo-light.png"
                            className="logo dark:hidden block"
                            height={128}
                            width={128}
                            alt="logo"
                        />
                        <Image
                            src="/navbar-logo.png"
                            className="logo dark:block hidden"
                            height={128}
                            width={128}
                            alt="logo"
                        />

                        <div className="ps-5 ms-5">
                            <p className="text-sm dark:text-neutral-100 text-neutral-950 z-48">
                                © {SITE_METADATA.FOOTER.year} {" "}
                                {SITE_METADATA.FOOTER.copyright}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

