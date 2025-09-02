import { useEffect, useRef } from 'react'

interface SwipeHandlers {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
}

interface SwipeConfig {
  threshold?: number // Minimum distance for swipe
  velocity?: number // Minimum velocity for swipe
  preventScroll?: boolean
  enabled?: boolean
}

export const useSwipeGestures = (
  handlers: SwipeHandlers,
  config: SwipeConfig = {}
) => {
  const {
    threshold = 50,
    velocity = 0.3,
    preventScroll = false,
    enabled = true
  } = config

  const touchStartX = useRef<number>(0)
  const touchStartY = useRef<number>(0)
  const touchStartTime = useRef<number>(0)

  useEffect(() => {
    if (!enabled) return

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX.current = e.touches[0].clientX
      touchStartY.current = e.touches[0].clientY
      touchStartTime.current = Date.now()
    }

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStartX.current || !touchStartY.current) return

      const touchEndX = e.changedTouches[0].clientX
      const touchEndY = e.changedTouches[0].clientY
      const touchEndTime = Date.now()

      const deltaX = touchEndX - touchStartX.current
      const deltaY = touchEndY - touchStartY.current
      const deltaTime = touchEndTime - touchStartTime.current

      const velocityX = Math.abs(deltaX) / deltaTime
      const velocityY = Math.abs(deltaY) / deltaTime

      // Determine if it's a horizontal or vertical swipe
      const isHorizontal = Math.abs(deltaX) > Math.abs(deltaY)

      if (isHorizontal && Math.abs(deltaX) > threshold && velocityX > velocity) {
        if (preventScroll) {
          e.preventDefault()
        }
        
        if (deltaX > 0) {
          handlers.onSwipeRight?.()
        } else {
          handlers.onSwipeLeft?.()
        }
      } else if (!isHorizontal && Math.abs(deltaY) > threshold && velocityY > velocity) {
        if (preventScroll) {
          e.preventDefault()
        }
        
        if (deltaY > 0) {
          handlers.onSwipeDown?.()
        } else {
          handlers.onSwipeUp?.()
        }
      }

      // Reset values
      touchStartX.current = 0
      touchStartY.current = 0
      touchStartTime.current = 0
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (preventScroll && (touchStartX.current || touchStartY.current)) {
        e.preventDefault()
      }
    }

    // Add event listeners
    document.addEventListener('touchstart', handleTouchStart, { passive: !preventScroll })
    document.addEventListener('touchend', handleTouchEnd, { passive: !preventScroll })
    document.addEventListener('touchmove', handleTouchMove, { passive: !preventScroll })

    return () => {
      document.removeEventListener('touchstart', handleTouchStart)
      document.removeEventListener('touchend', handleTouchEnd)
      document.removeEventListener('touchmove', handleTouchMove)
    }
  }, [handlers, threshold, velocity, preventScroll, enabled])
}

// Hook for swipeable list items
export const useSwipeableItem = (
  onDelete?: () => void,
  onEdit?: () => void,
  config?: SwipeConfig
) => {
  const elementRef = useRef<HTMLDivElement>(null)
  const startX = useRef<number>(0)
  const currentX = useRef<number>(0)
  const isDragging = useRef<boolean>(false)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const handleStart = (e: TouchEvent | MouseEvent) => {
      isDragging.current = true
      startX.current = 'touches' in e ? e.touches[0].clientX : e.clientX
      element.style.transition = 'none'
    }

    const handleMove = (e: TouchEvent | MouseEvent) => {
      if (!isDragging.current) return

      currentX.current = 'touches' in e ? e.touches[0].clientX : e.clientX
      const deltaX = currentX.current - startX.current
      
      // Limit swipe distance
      const maxSwipe = 100
      const limitedDelta = Math.max(-maxSwipe, Math.min(maxSwipe, deltaX))
      
      element.style.transform = `translateX(${limitedDelta}px)`
      element.style.opacity = `${1 - Math.abs(limitedDelta) / 200}`
    }

    const handleEnd = () => {
      if (!isDragging.current) return
      
      isDragging.current = false
      const deltaX = currentX.current - startX.current
      
      element.style.transition = 'all 0.3s ease'
      
      if (Math.abs(deltaX) > 50) {
        if (deltaX > 0 && onEdit) {
          onEdit()
        } else if (deltaX < 0 && onDelete) {
          onDelete()
        }
      }
      
      element.style.transform = 'translateX(0)'
      element.style.opacity = '1'
    }

    // Touch events
    element.addEventListener('touchstart', handleStart, { passive: true })
    element.addEventListener('touchmove', handleMove, { passive: true })
    element.addEventListener('touchend', handleEnd)
    
    // Mouse events for testing
    element.addEventListener('mousedown', handleStart)
    element.addEventListener('mousemove', handleMove)
    element.addEventListener('mouseup', handleEnd)
    element.addEventListener('mouseleave', handleEnd)

    return () => {
      element.removeEventListener('touchstart', handleStart)
      element.removeEventListener('touchmove', handleMove)
      element.removeEventListener('touchend', handleEnd)
      element.removeEventListener('mousedown', handleStart)
      element.removeEventListener('mousemove', handleMove)
      element.removeEventListener('mouseup', handleEnd)
      element.removeEventListener('mouseleave', handleEnd)
    }
  }, [onDelete, onEdit])

  return elementRef
}

// Hook for pull to refresh
export const usePullToRefresh = (
  onRefresh: () => Promise<void>,
  config: { threshold?: number; enabled?: boolean } = {}
) => {
  const { threshold = 80, enabled = true } = config
  const containerRef = useRef<HTMLDivElement>(null)
  const startY = useRef<number>(0)
  const isPulling = useRef<boolean>(false)
  const isRefreshing = useRef<boolean>(false)

  useEffect(() => {
    const container = containerRef.current
    if (!container || !enabled) return

    const handleStart = (e: TouchEvent) => {
      if (container.scrollTop === 0 && !isRefreshing.current) {
        startY.current = e.touches[0].clientY
        isPulling.current = true
      }
    }

    const handleMove = (e: TouchEvent) => {
      if (!isPulling.current || isRefreshing.current) return

      const currentY = e.touches[0].clientY
      const deltaY = currentY - startY.current

      if (deltaY > 0 && deltaY < threshold * 2) {
        e.preventDefault()
        const progress = Math.min(deltaY / threshold, 1)
        container.style.transform = `translateY(${deltaY * 0.5}px)`
        container.style.opacity = `${1 - progress * 0.3}`
      }
    }

    const handleEnd = async (e: TouchEvent) => {
      if (!isPulling.current || isRefreshing.current) return

      const currentY = e.changedTouches[0].clientY
      const deltaY = currentY - startY.current

      isPulling.current = false
      container.style.transition = 'all 0.3s ease'

      if (deltaY > threshold) {
        isRefreshing.current = true
        container.style.transform = `translateY(${threshold * 0.3}px)`
        
        try {
          await onRefresh()
        } finally {
          isRefreshing.current = false
        }
      }

      container.style.transform = 'translateY(0)'
      container.style.opacity = '1'
      
      setTimeout(() => {
        container.style.transition = 'none'
      }, 300)
    }

    container.addEventListener('touchstart', handleStart, { passive: true })
    container.addEventListener('touchmove', handleMove, { passive: false })
    container.addEventListener('touchend', handleEnd)

    return () => {
      container.removeEventListener('touchstart', handleStart)
      container.removeEventListener('touchmove', handleMove)
      container.removeEventListener('touchend', handleEnd)
    }
  }, [onRefresh, threshold, enabled])

  return { containerRef, isRefreshing: isRefreshing.current }
}

export default useSwipeGestures