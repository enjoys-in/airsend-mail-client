"use client"

import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, Check } from 'lucide-react'
import Link from "next/link"
import { useState } from "react"

interface FAQItem {
  question: string
  answer: string
}

const faqs: FAQItem[] = [
  {
    question: "How do disposable mailboxes work?",
    answer: "Disposable mailboxes provide temporary email addresses that automatically expire after a set period. They're perfect for testing, development, and protecting your primary email from potential spam. Our system ensures secure delivery while maintaining complete privacy.",
  },
  {
    question: "Can I use my own domain for email?",
    answer: "Yes! You can easily configure your own domain for sending emails. Our platform provides step-by-step guidance for DNS setup, DKIM configuration, and SPF records. This helps maintain your brand consistency and improves deliverability rates.",
  },
  {
    question: "What is email verification and why is it important?",
    answer: "Email verification is a crucial process that validates email addresses before sending. It helps prevent bounces, protects your sender reputation, and ensures high deliverability rates. Our system automatically verifies addresses and provides detailed analytics.",
  },
  {
    question: "How secure is your email service?",
    answer: "We implement enterprise-grade security measures including TLS encryption, two-factor authentication, and regular security audits. Your data is protected by multiple layers of security, and we comply with major privacy regulations worldwide.",
  },
]

export default function FAQ() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)

  return (
    <div className="bg-gradient-to-b dark:from-[#1d1e24fe] dark:to-[#09090a]  bg-neutral-100 relative overflow-hidden">

      <svg
        className="absolute bottom-0 left-0 right-0 w-full h-48 md:h-64 lg:h-96"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
      >
        <path
          className="fill-neutral-200 dark:fill-zinc-900"

          d="M0,96L48,112C96,128,192,160,288,186.7C384,213,480,235,576,224C672,213,768,171,864,149.3C960,128,1056,128,1152,149.3C1248,171,1344,213,1392,234.7L1440,256L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
        ></path>
      </svg>

      <div className="relative z-10 w-full max-w-4xl mx-auto px-4 py-12 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-4 flex items-center gap-2"
        >
          <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center">
            <Check className="h-4 w-4 text-blue-400" />
          </div>
          <span className="text-blue-400 font-semibold">FAQ</span>
        </motion.div>

        <motion.h1
          className="text-4xl md:text-5xl lg:text-6xl font-bold dark:text-neutral-200 text-neutral-600 mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Frequently Asked Questions
        </motion.h1>

        <motion.div
          className="space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
              className="group"
            >
              <motion.div
                className={`
                  border border-blue-900/30 rounded-none overflow-hidden backdrop-blur-sm
                  ${expandedIndex === index ? 'bg-neutral-900/20' : 'bg-neutral-900/10'}
                `}
              >
                <button
                  onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                  className="w-full p-6 flex items-center justify-between text-left  dark:text-zinc-300 text-zinc-500 hover:text-blue-300 transition-colors"
                >
                  <span className="text-lg md:text-xl font-medium ">{faq.question}</span>
                  <motion.div
                    animate={{ rotate: expandedIndex === index ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="ml-4"
                  >
                    <ChevronDown className="w-5 h-5 text-blue-400" />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {expandedIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6">
                        <motion.p
                          className="dark:text-zinc-300 text-zinc-500 text-base md:text-lg"
                          initial={{ y: -10, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          {faq.answer}
                        </motion.p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
        <div className="flex justify-center mt-4">
          <Link className="inline-flex items-center gap-x-2 bg-neutral-200 border border-gray-200 text-sm text-gray-800 p-1 ps-3 rounded-full transition hover:border-gray-300 focus:outline-hidden focus:border-gray-300 dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-200 dark:hover:border-neutral-600 dark:focus:border-neutral-600" href="/faq">
            View All
            <span className="py-1.5 px-2.5 inline-flex justify-center items-center gap-x-2 rounded-full bg-gray-200 font-semibold text-sm text-gray-600 dark:bg-neutral-700 dark:text-neutral-400">
              <svg className="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
            </span>
          </Link>
        </div>
      </div>

    </div>
  )
}

