import React from 'react'
import "./section.module.css"
const HeroSection2 = () => {
    return (
        <section className="flex items-center justify-center px-4 py-2 bg-gradient-to-b dark:from-[#18142b] dark:to-[#1d1e24fe] bg-neutral-200 rounded-3xl">
            {/* Background decoration */}

            <div className="relative max-w-6xl mx-auto text-center">
                {/* Floating email icon */}
                
                {/* Main headline */}
                <div className="fade-in-up delay-100">
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-4 leading-tight">
                        Your Email, <span className="gradient-text">Your Way</span>
                    </h1>
                    <div className="text-xl md:text-2xl text-gray-300 font-light mb-8">
                        — No Domain Needed
                    </div>
                </div>
                {/* Subheadline */}
                <div className=" fade-in-up delay-200">
                    <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed mb-4">
                        Create a custom address instantly and start sending today.
                    </p>
                    <p className="text-base md:text-lg text-gray-400 max-w-2xl mx-auto mb-12">
                        No domain? No problem. Pick any name you like, and we'll handle the
                        delivery.
                        <span className="text-emerald-400 font-semibold">
                            Fast. Reliable. Private.
                        </span>
                    </p>
                </div>
                {/* Email example demo */}
                <div className="fade-in-up delay-300 mb-2">
                    <div className="glass-card rounded-2xl p-6 max-w-md mx-auto mb-8">
                        <div className="text-sm text-gray-400 mb-2">Your custom email:</div>
                        <div className="font-mono text-lg text-white bg-gray-900 rounded-lg p-3 border-l-4 border-emerald-500">
                            <span className="email-example">john.smith@ourmail.com</span>
                        </div>
                    </div>
                </div>
                {/* CTA Buttons */}
                <div className="fade-in-up delay-400 flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
                    <button className="group px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transform hover:scale-105 hover:shadow-2xl transition-all duration-300">
                        <span className="flex items-center gap-2">
                            Create Your Email Now
                            <svg
                                className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                                />
                            </svg>
                        </span>
                    </button>
                    <button className="px-8 py-4 glass-card text-white font-medium rounded-xl hover:bg-white/20 transform hover:scale-105 transition-all duration-300">
                        Pick Your Address
                    </button>
                </div>
                {/* Feature highlights */}
                <div className="  fade-in-up delay-500 grid grid-cols-1 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
                    <div className="glass-card rounded-xl p-4 hover:bg-white/15 transition-all duration-300 transform hover:-translate-y-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mb-3 mx-auto">
                            <svg
                                className="w-5 h-5 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M13 10V3L4 14h7v7l9-11h-7z"
                                />
                            </svg>
                        </div>
                        <h3 className="text-white font-semibold text-sm mb-1">Instant Setup</h3>
                        <p className="text-gray-400 text-xs">Ready in seconds</p>
                    </div>
                    <div className="glass-card rounded-xl p-4 hover:bg-white/15 transition-all duration-300 transform hover:-translate-y-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center mb-3 mx-auto">
                            <svg
                                className="w-5 h-5 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                />
                            </svg>
                        </div>
                        <h3 className="text-white font-semibold text-sm mb-1">
                            Private &amp; Secure
                        </h3>
                        <p className="text-gray-400 text-xs">Your data protected</p>
                    </div>
                    <div className="glass-card rounded-xl p-4 hover:bg-white/15 transition-all duration-300 transform hover:-translate-y-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center mb-3 mx-auto">
                            <svg
                                className="w-5 h-5 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                                />
                            </svg>
                        </div>
                        <h3 className="text-white font-semibold text-sm mb-1">Mobile Ready</h3>
                        <p className="text-gray-400 text-xs">Access anywhere</p>
                    </div>
                    <div className="glass-card rounded-xl p-4 hover:bg-white/15 transition-all duration-300 transform hover:-translate-y-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center mb-3 mx-auto">
                            <svg
                                className="w-5 h-5 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                                />
                            </svg>
                        </div>
                        <h3 className="text-white font-semibold text-sm mb-1">
                            Spam Protection
                        </h3>
                        <p className="text-gray-400 text-xs">Advanced filtering</p>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default HeroSection2