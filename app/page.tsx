'use client'
import React from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { FaQrcode, FaDesktop, FaCogs } from 'react-icons/fa'

const HomePage = () => {
  const router = useRouter()

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-800 text-white relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-blue-500/10 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-teal-500/10 to-transparent rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 py-16 relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center"
        >
          <motion.div
            variants={itemVariants}
            className="mb-8"
          >
            <h1 className="text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-400 drop-shadow-lg">
              Smart Inventory Management System
            </h1>
            
            <motion.div
              className="max-w-3xl mx-auto mb-16"
            >
              <p className="text-2xl text-gray-300 leading-relaxed">
                A highly scalable system architecture designed to streamline inventory tracking and management. 
                <span className="text-blue-400"> Powered by Next.js and Supabase</span>, featuring QR code integration and multi-display capabilities.
              </p>
            </motion.div>
          </motion.div>

          <motion.div 
            variants={containerVariants}
            className="grid md:grid-cols-3 gap-8 mb-16"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ scale: 1.05, translateY: -5 }}
                className="bg-gray-800/40 p-8 rounded-2xl backdrop-blur-sm border border-gray-700/50 
                          shadow-lg hover:shadow-2xl transition-all duration-300 group"
              >
                <div className="flex flex-col items-center">
                  <div className="text-4xl mb-4 text-blue-400 group-hover:text-teal-400 transition-colors duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-semibold mb-3 text-blue-400 group-hover:text-teal-400 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 text-center">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="flex flex-col items-center gap-6"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/stores')}
              className="bg-gradient-to-r from-blue-500 to-teal-500 text-white px-12 py-5 rounded-full 
                       text-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300
                       hover:from-blue-600 hover:to-teal-600 relative overflow-hidden group"
            >
              <span className="relative z-10">Get Started</span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-teal-600 opacity-0 
                            group-hover:opacity-100 transition-opacity duration-300"></div>
            </motion.button>
            <p className="text-gray-400 text-sm">Start managing your inventory smarter today</p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

const features = [
  {
    icon: <FaQrcode />,
    title: "QR Code Integration",
    description: "Seamlessly track and manage inventory using QR code technology for efficient product identification."
  },
  {
    icon: <FaDesktop />,
    title: "Multi-Display Support",
    description: "Flexible display options optimized for various devices and screen sizes."
  },
  {
    icon: <FaCogs />,
    title: "Automated Variants",
    description: "Automatic product variant generation to reduce manual work and improve efficiency."
  }
]

export default HomePage