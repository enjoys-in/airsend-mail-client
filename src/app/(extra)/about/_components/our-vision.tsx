"use client"
import React from 'react'
import { useEffect, useRef } from "react"
import { motion, useInView, useAnimation } from "framer-motion"

const Section = ({ children }: { children: React.ReactNode }) => {
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true })
    const mainControls = useAnimation()

    useEffect(() => {
        if (isInView) {
            mainControls.start("visible")
        }
    }, [isInView, mainControls])

    return (
        <motion.section
            ref={ref}
            variants={{
                hidden: { opacity: 0, y: 75 },
                visible: { opacity: 1, y: 0 },
            }}
            initial="hidden"
            animate={mainControls}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="mb-4"
        >
            {children}
        </motion.section>
    )
}
export const ListCard = ({ heading, subheading, item }: { heading: string, subheading?: string, item?: { title: string, description: string }[] }) => {
    return (

        <div className="max-w-2xl mx-auto">

            <Section>
                <h2 className="text-3xl text-gray-800 font-bold lg:text-4xl dark:text-white">
                    {heading}
                </h2>
                {subheading && <p className="mt-3 text-gray-800 dark:text-neutral-400">{subheading}</p>}

            </Section>
            {item && item.map((item, index) => (
                <Section>
                    <div key={item.title}>
                        <div className="  ">
                            <div className="flex flex-col">
                                <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-neutral-200">
                                    {item.title}
                                </h3>
                                <p className="mt-1 text-gray-600 dark:text-neutral-400">
                                    {item.description}
                                </p>
                            </div>
                        </div>
                    </div>
                </Section>
            ))}

        </div>

    )
}
