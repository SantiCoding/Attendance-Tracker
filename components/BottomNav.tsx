"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface BottomNavProps {
  activeIndex: number
  onTabClick: (index: number) => void
  swipeProgress?: number
  className?: string
}

const tabs = [
  { id: 0, label: "Attendance", icon: "📅" },
  { id: 1, label: "Students", icon: "👥" },
  { id: 2, label: "Search", icon: "🔍" },
  { id: 3, label: "Make-Up", icon: "🔄" },
  { id: 4, label: "Reports", icon: "📊" }
]

export function BottomNav({ activeIndex, onTabClick, swipeProgress = 0, className }: BottomNavProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Detect modal openings to hide nav when needed
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          const hasModal = document.querySelector('[role="dialog"]') || 
                          document.querySelector('.fixed.inset-0') ||
                          document.querySelector('[data-state="open"]')
          setIsModalOpen(!!hasModal)
        }
      })
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true
    })

    return () => observer.disconnect()
  }, [])

  return (
    <motion.div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-[9999] w-full",
        "bg-black/20 backdrop-blur-sm border-t border-white/10",
        "px-2 py-1",
        className
      )}
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        paddingBottom: 'env(safe-area-inset-bottom)',
        height: 'clamp(56px, 9vw, 64px)',
        display: 'block',
        visibility: 'visible'
      } as React.CSSProperties}
      animate={{ 
        y: isModalOpen ? 100 : 0,
        opacity: isModalOpen ? 0 : 1
      }}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 30,
        duration: 0.3
      }}
    >
      <div className="flex items-center justify-around h-full max-w-md mx-auto">
        {tabs.map((tab, index) => {
          const isActive = activeIndex === index
          const progress = Math.abs(swipeProgress - index)
          const opacity = Math.max(0.4, 1 - progress * 0.3)
          
          return (
            <motion.button
              key={tab.id}
              onClick={() => onTabClick(index)}
              className={cn(
                "flex flex-col items-center justify-center",
                "px-2 py-1 rounded-lg transition-all duration-200",
                "min-w-0 flex-1",
                isActive 
                  ? "text-white" 
                  : "text-white/60 hover:text-white/80"
              )}
              style={{ opacity }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <motion.div
                className="text-lg mb-1"
                animate={{ 
                  scale: isActive ? 1.1 : 1,
                  rotate: isActive ? [0, -5, 5, 0] : 0
                }}
                transition={{ 
                  scale: { duration: 0.2 },
                  rotate: { duration: 0.3, delay: 0.1 }
                }}
              >
                {tab.icon}
              </motion.div>
              
              <motion.span
                className={cn(
                  "text-xs font-medium truncate w-full text-center",
                  isActive ? "text-white" : "text-white/60"
                )}
                animate={{ 
                  fontSize: isActive ? "11px" : "10px",
                  fontWeight: isActive ? 600 : 500
                }}
                transition={{ duration: 0.2 }}
              >
                {tab.label}
              </motion.span>

              {/* Active indicator */}
              {isActive && (
                <motion.div
                  className="absolute bottom-0 left-1/2 w-1 h-1 bg-white rounded-full"
                  initial={{ scale: 0, x: "-50%" }}
                  animate={{ scale: 1, x: "-50%" }}
                  exit={{ scale: 0, x: "-50%" }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </motion.button>
          )
        })}
      </div>

      {/* Progressive indicator that follows swipe */}
      <motion.div
        className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400"
        style={{
          width: `${100 / tabs.length}%`,
          x: `${activeIndex * (100 / tabs.length)}%`,
          transform: `translateX(${swipeProgress * (100 / tabs.length)}%)`
        }}
        transition={{ 
          x: { type: "spring", stiffness: 300, damping: 30 },
          transform: { duration: 0 }
        }}
      />
    </motion.div>
  )
}
