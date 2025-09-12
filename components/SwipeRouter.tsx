"use client"

import React, { useState, useRef, useCallback, useEffect, ReactNode } from "react"

interface SwipeRouterProps {
  children: ReactNode[]
  activeIndex: number
  onIndexChange: (index: number) => void
  onSwipeProgress?: (progress: number) => void
  className?: string
}

export function SwipeRouter({ 
  children, 
  activeIndex, 
  onIndexChange, 
  onSwipeProgress,
  className 
}: SwipeRouterProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const pagesRef = useRef<HTMLDivElement>(null)
  const [viewportWidth, setViewportWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 0)
  const [gestureState, setGestureState] = useState({
    startX: 0,
    startY: 0,
    currentX: 0,
    isDragging: false,
    isHorizontalLocked: false,
    lastDeltaX: 0
  })
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const animationFrameRef = useRef<number | undefined>(undefined)

  const pageCount = children.length

  // Check for reduced motion preference and handle viewport changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
      setReducedMotion(mediaQuery.matches)
      
      const handleResize = () => setViewportWidth(window.innerWidth)
      window.addEventListener('resize', handleResize)
      
      return () => window.removeEventListener('resize', handleResize)
    }
  }, [])

  const updateTransform = useCallback((deltaX: number, isTransitioning: boolean = false) => {
    if (!pagesRef.current) return

    const baseTransform = -activeIndex * viewportWidth
    const totalTransform = baseTransform + deltaX

    const maxTransform = 0
    const minTransform = -(pageCount - 1) * viewportWidth
    const clampedTransform = Math.max(minTransform, Math.min(maxTransform, totalTransform))

    let resistanceTransform = clampedTransform
    if (totalTransform > maxTransform) {
      const excess = totalTransform - maxTransform
      resistanceTransform = maxTransform + excess * 0.25 // Reduced resistance
    } else if (totalTransform < minTransform) {
      const excess = totalTransform - minTransform
      resistanceTransform = minTransform + excess * 0.25 // Reduced resistance
    }

    if (isTransitioning) {
      pagesRef.current.style.transition = 'transform 300ms cubic-bezier(0.22, 1, 0.36, 1)'
    } else {
      pagesRef.current.style.transition = 'none'
    }

    pagesRef.current.style.transform = `translate3d(${resistanceTransform}px, 0, 0)`
    const progress = -resistanceTransform / viewportWidth
    onSwipeProgress?.(progress)
  }, [activeIndex, viewportWidth, pageCount, onSwipeProgress])

  const goToPage = useCallback((index: number) => {
    if (index < 0 || index >= pageCount || index === activeIndex) return
    
    setIsTransitioning(true)
    onIndexChange(index)
    
    setTimeout(() => {
      setIsTransitioning(false)
    }, reducedMotion ? 0 : 300)
  }, [activeIndex, pageCount, onIndexChange, reducedMotion])

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (reducedMotion) return
    
    const touch = e.touches[0]
    setGestureState(prev => ({
      ...prev,
      startX: touch.clientX,
      startY: touch.clientY,
      currentX: touch.clientX,
      isDragging: true,
      isHorizontalLocked: false
    }))
    
    if (containerRef.current) {
      containerRef.current.style.overflow = 'hidden'
    }
  }, [reducedMotion])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!gestureState.isDragging || reducedMotion) return
    
    const touch = e.touches[0]
    const deltaX = touch.clientX - gestureState.startX
    const deltaY = touch.clientY - gestureState.startY
    
    // Determine if this is a horizontal gesture
    if (!gestureState.isHorizontalLocked) {
      const horizontalDistance = Math.abs(deltaX)
      const verticalDistance = Math.abs(deltaY)
      
      if (horizontalDistance > 8) { // Lowered threshold for mobile sensitivity
        setGestureState(prev => ({ ...prev, isHorizontalLocked: true }))
        e.preventDefault()
      } else if (verticalDistance > 15) { // Increased threshold to allow vertical scrolling
        setGestureState(prev => ({ ...prev, isDragging: false }))
        return
      }
    }
    
    if (gestureState.isHorizontalLocked) {
      e.preventDefault()
      setGestureState(prev => ({ ...prev, currentX: touch.clientX, lastDeltaX: deltaX }))
      updateTransform(deltaX) // Immediate update for responsive feel
    }
  }, [gestureState, reducedMotion, updateTransform])

  const handleTouchEnd = useCallback(() => {
    if (!gestureState.isDragging || reducedMotion) return
    
    const deltaX = gestureState.currentX - gestureState.startX
    const velocity = Math.abs(deltaX) / 100 // Simple velocity calculation
    
    const shouldChangePage = Math.abs(deltaX) > 0.15 * viewportWidth || velocity > 0.2 // Lowered thresholds
    
    if (shouldChangePage) {
      const direction = deltaX > 0 ? -1 : 1
      const newIndex = Math.max(0, Math.min(pageCount - 1, activeIndex + direction))
      
      if (newIndex !== activeIndex) {
        setIsTransitioning(true)
        updateTransform(0, true)
        setTimeout(() => {
          onIndexChange(newIndex)
          setIsTransitioning(false)
        }, reducedMotion ? 0 : 300)
      } else {
        updateTransform(0, true)
        setTimeout(() => setIsTransitioning(false), reducedMotion ? 0 : 300)
      }
    } else {
      updateTransform(0, true)
      setTimeout(() => setIsTransitioning(false), reducedMotion ? 0 : 300)
    }
    
    setGestureState(prev => ({
      ...prev,
      isDragging: false,
      isHorizontalLocked: false,
      lastDeltaX: 0
    }))
    
    if (containerRef.current) {
      containerRef.current.style.overflow = ''
    }
  }, [gestureState, viewportWidth, activeIndex, pageCount, onIndexChange, reducedMotion, updateTransform])

  // Mouse events for desktop
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (reducedMotion) return
    
    setGestureState(prev => ({
      ...prev,
      startX: e.clientX,
      startY: e.clientY,
      currentX: e.clientX,
      isDragging: true,
      isHorizontalLocked: false
    }))
  }, [reducedMotion])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!gestureState.isDragging || reducedMotion) return
    
    const deltaX = e.clientX - gestureState.startX
    const deltaY = e.clientY - gestureState.startY
    
    if (!gestureState.isHorizontalLocked) {
      const horizontalDistance = Math.abs(deltaX)
      const verticalDistance = Math.abs(deltaY)
      
      if (horizontalDistance > 12) {
        setGestureState(prev => ({ ...prev, isHorizontalLocked: true }))
      } else if (verticalDistance > 12) {
        setGestureState(prev => ({ ...prev, isDragging: false }))
        return
      }
    }
    
    if (gestureState.isHorizontalLocked) {
      setGestureState(prev => ({ ...prev, currentX: e.clientX, lastDeltaX: deltaX }))
      updateTransform(deltaX)
    }
  }, [gestureState, reducedMotion, updateTransform])

  const handleMouseUp = useCallback(() => {
    if (!gestureState.isDragging || reducedMotion) return
    
    const deltaX = gestureState.currentX - gestureState.startX
    const velocity = Math.abs(deltaX) / 100
    
    const shouldChangePage = Math.abs(deltaX) > 0.20 * viewportWidth || velocity > 0.3
    
    if (shouldChangePage) {
      const direction = deltaX > 0 ? -1 : 1
      const newIndex = Math.max(0, Math.min(pageCount - 1, activeIndex + direction))
      
      if (newIndex !== activeIndex) {
        setIsTransitioning(true)
        updateTransform(0, true)
        setTimeout(() => {
          onIndexChange(newIndex)
          setIsTransitioning(false)
        }, reducedMotion ? 0 : 300)
      } else {
        updateTransform(0, true)
        setTimeout(() => setIsTransitioning(false), reducedMotion ? 0 : 300)
      }
    } else {
      updateTransform(0, true)
      setTimeout(() => setIsTransitioning(false), reducedMotion ? 0 : 300)
    }
    
    setGestureState(prev => ({
      ...prev,
      isDragging: false,
      isHorizontalLocked: false,
      lastDeltaX: 0
    }))
  }, [gestureState, viewportWidth, activeIndex, pageCount, onIndexChange, reducedMotion, updateTransform])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        goToPage(activeIndex - 1)
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        goToPage(activeIndex + 1)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeIndex, goToPage])

  return (
    <div
      ref={containerRef}
      className={`swipe-root ${className || ''}`}
      style={{
        overflow: 'hidden',
        position: 'relative',
        width: '100%',
        height: '100%',
        WebkitOverflowScrolling: 'touch',
        minHeight: '100vh',
        position: 'relative',
        zIndex: 1
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div
        ref={pagesRef}
        className="swipe-pages"
        style={{
          display: 'flex',
          width: `${pageCount * 100}%`,
          height: '100%',
          transform: `translate3d(${-activeIndex * viewportWidth}px, 0, 0)`,
          transition: 'transform 0.3s cubic-bezier(0.22, 1, 0.36, 1)'
        }}
      >
        {children.map((child, index) => (
          <div
            key={index}
            className="swipe-page"
            style={{
              width: `${100 / pageCount}%`,
              flexShrink: 0,
              paddingBottom: 'clamp(80px, 12vw, 100px)', // Space for fixed bottom nav
              minHeight: '100vh'
            }}
          >
            {child}
          </div>
        ))}
      </div>
    </div>
  )
}
