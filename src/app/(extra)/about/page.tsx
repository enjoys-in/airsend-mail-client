
import { ABOUT_US } from "@/lib/data"
import { ListCard } from "./_components/our-vision"
import Image from "next/image"


export default function AboutUs() {

    return (

        <div className="bg-neutral-300 dark:bg-neutral-900">
            <div className="relative z-10 overflow-hidden before:absolute before:top-0 before:start-1/2 before:bg-[url('/squared-bg-light-element.svg')] dark:before:bg-[url('/squared-bg-element.svg')] before:bg-no-repeat before:bg-top before:size-full before:-z-1 before:transform before:-translate-x-1/2">


            </div>
            <div className="flex justify-center items-center mt-10">
                <Image className="hidden dark:block" alt="airsend-logo" src={"/airsend-logo-black.png"} width={720} height={720} />
                <Image alt="airsend-logo" className="dark:hidden block" src={"/airsend-logo-light.png"} width={720} height={720} />
            </div>
            <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-10">
                {/* <Image alt="airsend-logo" src={"/navbar-logo.png"} width={1280} height={1280} /> */}
                {/* Title */}
                <div className="mt-5 max-w-xl text-center mx-auto z-[999]">
                    <h1 className="block font-bold text-gray-800 text-4xl md:text-5xl lg:text-6xl dark:text-neutral-200">
                        About AirSend
                    </h1>
                </div>
                {/* End Title */}

                <div className="mt-5 max-w-3xl text-center mx-auto z-100">
                    <p className="text-lg text-gray-600 dark:text-neutral-400">
                        Welcome to Airsend – a modern, reliable, and secure email delivery service designed to simplify your communication needs.
                    </p>
                </div>
                <div className="mx-auto px-4 py-16 z-[999]">

                    <div className="container">
                        <div className="max-w-[85rem] px-4 py-10 sm:px-6 lg:px-8 lg:py-14 mx-auto">
                            {
                                ABOUT_US.map((item, index) => (
                                    <ListCard
                                        heading={item.heading}
                                        item={item?.items}
                                        subheading={item.subheading}
                                        key={index}
                                    />
                                ))
                            }
                        </div>


                        <div className="mt-2">
                            <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
                            <p> For any inquiries or collaboration opportunities, please reach out to us at <a href="mailto:mullayam06@outlook.com" className="underline text-blue-600">mullayam06@outlook.com</a></p>
                        </div>
                    </div>
                </div>
            </div>


        </div>

    )
}

