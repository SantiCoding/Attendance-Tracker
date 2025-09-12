"use client"

import React, { useState } from "react"
import { SwipeRouter } from "@/components/SwipeRouter"
import { BottomNav } from "@/components/BottomNav"

export default function TennisTracker() {
  const [currentTabIndex, setCurrentTabIndex] = useState(0)
  const [swipeProgress, setSwipeProgress] = useState(0)

  const handleTabIndexChange = (index: number) => {
    setCurrentTabIndex(index)
  }

  const handleSwipeProgress = (progress: number) => {
    setSwipeProgress(progress)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Main Content with SwipeRouter - Mobile Optimized */}
      <div className="px-2 sm:px-4" style={{ 
        paddingBottom: '0px', // Remove padding since SwipeRouter handles it
        minHeight: '100vh' // Ensure full height
      }}>
        <SwipeRouter
          activeIndex={currentTabIndex}
          onIndexChange={handleTabIndexChange}
          onSwipeProgress={handleSwipeProgress}
          className="max-w-7xl mx-auto"
        >
          {/* Record Attendance Page */}
          <div className="space-y-4 sm:space-y-6">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm">📅</span>
                </div>
                <h2 className="text-white text-xl font-semibold">Record Attendance</h2>
              </div>
            </div>
            <div className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <p className="text-white/80">Attendance recording functionality will be here.</p>
            </div>
          </div>

          {/* Students Page */}
          <div className="space-y-4 sm:space-y-6">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm">👥</span>
                </div>
                <h2 className="text-white text-xl font-semibold">Students</h2>
              </div>
            </div>
            <div className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <p className="text-white/80">Student management functionality will be here.</p>
            </div>
          </div>

          {/* Search Page */}
          <div className="space-y-4 sm:space-y-6">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm">🔍</span>
                </div>
                <h2 className="text-white text-xl font-semibold">Search</h2>
              </div>
            </div>
            <div className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <p className="text-white/80">Search functionality will be here.</p>
            </div>
          </div>

          {/* Make-Up Page */}
          <div className="space-y-4 sm:space-y-6">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm">🔄</span>
                </div>
                <h2 className="text-white text-xl font-semibold">Make-Up Sessions</h2>
              </div>
            </div>
            <div className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <p className="text-white/80">Make-up session functionality will be here.</p>
            </div>
          </div>

          {/* Reports Page */}
          <div className="space-y-4 sm:space-y-6">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm">📊</span>
                </div>
                <h2 className="text-white text-xl font-semibold">Reports</h2>
              </div>
            </div>
            <div className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <p className="text-white/80">Reports functionality will be here.</p>
            </div>
          </div>
        </SwipeRouter>
      </div>

      {/* Fixed Bottom Navigation */}
      <BottomNav 
        activeIndex={currentTabIndex}
        onTabClick={handleTabIndexChange}
        swipeProgress={swipeProgress}
      />
    </div>
  )
}
