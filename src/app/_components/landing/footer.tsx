import Link from "next/link";
import Image from "next/image";
import { FOOTER_LINKS, SITE_METADATA } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { FooterCopyright } from "./footer-copyright";
import { SideOverlay } from "./side-overlay";
import { TermsLink } from "./term-link";

export const Footer = () => {


    return (
        <footer>
            <div className="mt-auto relative w-full py-10 px-4 sm:px-6 lg:px-8 bg-gradient-to-b dark:from-[#18181B] dark:to-[#0b0b0c] bg-[#E5E5E5]">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 mb-10">
                    <div className="col-span-full hidden lg:col-span-1 lg:block">
                        <Image className="hidden dark:block" alt="airsend-logo" src={"/navbar-logo.png"} width={512} height={512} />
                        <Image alt="airsend-logo" className="dark:hidden block" src={"/navbar-logo-light.png"} width={512} height={512} />


                    </div>
                    {FOOTER_LINKS.map((item, index) => (
                        <div key={index + item.title}>
                            <h4 className="text-xs font-semibold text-gray-900 uppercase dark:text-neutral-100">
                                {item.title}
                            </h4>
                            <div className="mt-3 grid space-y-3 text-sm">
                                {item.links.map((link) => (
                                    <div key={link.name}>
                                        <Link
                                            className="inline-flex gap-x-2 text-gray-600 hover:text-gray-800 focus:outline-hidden focus:text-gray-800 dark:text-neutral-400 dark:hover:text-neutral-200 dark:focus:text-neutral-200"
                                            href={link.href}
                                        >
                                            {link.name}
                                        </Link>
                                        {link?.badge && (
                                            <Badge className="mx-2 inline pl-2 text-blue-600 dark:text-blue-500 cursor-default bg-blue-200 dark:bg-blue-200">
                                                {link.badge}
                                            </Badge>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
                <TermsLink />
            </div>
            <SideOverlay />
            <FooterCopyright />
        </footer>
    );
};