import React from 'react'
import "./section.module.css"
import { Zap, Shield, Smartphone, ShieldCheck, ArrowRight, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

const HeroSection2 = () => {
    return (
        <section className="flex items-center justify-center px-4 py-2 bg-gradient-to-b dark:from-[#18142b] dark:to-[#1d1e24fe] bg-neutral-100 rounded-3xl">

            <div className="relative max-w-6xl mx-auto text-center py-8 md:py-12">

                <div className="fade-in-up delay-100">
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-neutral-800 dark:text-white mb-4 leading-tight tracking-tight">
                        Your Email, <span className="gradient-text">Your Way</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-neutral-500 dark:text-neutral-400 font-light mb-6">
                        — No Domain Needed
                    </p>
                </div>

                <div className="fade-in-up delay-200">
                    <p className="text-lg md:text-xl text-neutral-600 dark:text-neutral-300 max-w-3xl mx-auto leading-relaxed mb-3">
                        Create a custom address instantly and start sending today.
                    </p>
                    <p className="text-base text-neutral-500 dark:text-neutral-400 max-w-2xl mx-auto mb-10">
                        No domain? No problem. Pick any name you like, and we&apos;ll handle the
                        delivery.{' '}
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                            Fast. Reliable. Private.
                        </span>
                    </p>
                </div>

                <div className="fade-in-up delay-300 mb-10">
                    <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white/80 dark:bg-neutral-900/60 p-5 max-w-sm mx-auto">
                        <div className="flex items-center gap-2 mb-3">
                            <Mail className="w-4 h-4 text-neutral-400" />
                            <span className="text-xs text-neutral-500 dark:text-neutral-400 uppercase tracking-wider font-medium">Your custom email</span>
                        </div>
                        <div className="font-mono text-base text-neutral-800 dark:text-white bg-neutral-100 dark:bg-neutral-800 rounded-lg px-4 py-3 border-l-4 border-emerald-500">
                            <span className="email-example">john.smith@ourmail.com</span>
                        </div>
                    </div>
                </div>

                <div className="fade-in-up delay-400 flex flex-col sm:flex-row gap-3 justify-center items-center mb-12">
                    <Link href="/v2">
                        <Button
                            size="lg"
                            className="rounded-full dark:bg-[#5a61ff] bg-indigo-600 text-base md:text-lg dark:text-gray-200 text-white hover:bg-indigo-700 px-6"
                        >
                            Create Your Email Now
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </Link>
                    <Link href="/pricing">
                        <Button
                            variant="outline"
                            size="lg"
                            className="rounded-full text-base md:text-lg text-neutral-700 dark:text-gray-200 px-6"
                        >
                            View Plans
                        </Button>
                    </Link>
                </div>

                <div className="fade-in-up delay-500 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
                    {[
                        { icon: Zap, label: 'Instant Setup', desc: 'Ready in seconds', color: 'text-blue-500' },
                        { icon: Shield, label: 'Private & Secure', desc: 'Your data protected', color: 'text-emerald-500' },
                        { icon: Smartphone, label: 'Mobile Ready', desc: 'Access anywhere', color: 'text-purple-500' },
                        { icon: ShieldCheck, label: 'Spam Protection', desc: 'Advanced filtering', color: 'text-orange-500' },
                    ].map(({ icon: Icon, label, desc, color }) => (
                        <div key={label} className="flex flex-col items-center gap-2 p-4 rounded-xl border border-transparent hover:border-neutral-200 dark:hover:border-neutral-700 transition-colors duration-200">
                            <Icon className={`w-6 h-6 ${color}`} strokeWidth={1.5} />
                            <h3 className="text-neutral-800 dark:text-neutral-200 font-medium text-sm">{label}</h3>
                            <p className="text-neutral-500 dark:text-neutral-400 text-xs">{desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default HeroSection2