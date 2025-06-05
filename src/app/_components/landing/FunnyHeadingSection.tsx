import React from 'react'
import { motion } from "framer-motion"

const FunnyHeadingSection = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="max-w-3xl mx-auto relative z-10 mt-4"
    >
      <h2 className="text-3xl md:text-4xl lg:text-6xl font-bold text-white mb-6">
        Custom MailBox Chahiye,<br /> Aa jao Dila Dunga
      </h2>
    </motion.div>
  )
}

export default FunnyHeadingSection