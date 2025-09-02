// Analytics and Monitoring Setup

interface AnalyticsEvent {
  name: string
  properties?: Record<string, any>
  timestamp?: number
}

class Analytics {
  private queue: AnalyticsEvent[] = []
  private isInitialized = false
  private userId: string | null = null

  // Initialize analytics (Vercel Analytics, Google Analytics, etc.)
  init() {
    if (this.isInitialized) return

    // Vercel Analytics
    if (typeof window !== 'undefined' && (window as any).va) {
      this.isInitialized = true
    }

    // Google Analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      this.isInitialized = true
    }

    // Process queued events
    this.processQueue()
  }

  // Set user ID for tracking
  setUser(userId: string) {
    this.userId = userId
    
    if ((window as any).gtag) {
      (window as any).gtag('config', process.env.REACT_APP_GA_ID, {
        user_id: userId
      })
    }

    if ((window as any).Sentry) {
      (window as any).Sentry.setUser({ id: userId })
    }
  }

  // Track page views
  trackPageView(path: string, title?: string) {
    if ((window as any).gtag) {
      (window as any).gtag('config', process.env.REACT_APP_GA_ID, {
        page_path: path,
        page_title: title
      })
    }

    if ((window as any).va) {
      (window as any).va('track', 'pageview', { path, title })
    }

    this.track('page_view', { path, title })
  }

  // Track custom events
  track(eventName: string, properties?: Record<string, any>) {
    const event: AnalyticsEvent = {
      name: eventName,
      properties: {
        ...properties,
        userId: this.userId,
        timestamp: Date.now()
      }
    }

    if (!this.isInitialized) {
      this.queue.push(event)
      return
    }

    this.sendEvent(event)
  }

  // Track user interactions
  trackInteraction(action: string, category: string, label?: string, value?: number) {
    this.track('interaction', {
      action,
      category,
      label,
      value
    })

    if ((window as any).gtag) {
      (window as any).gtag('event', action, {
        event_category: category,
        event_label: label,
        value: value
      })
    }
  }

  // Track errors
  trackError(error: Error, context?: Record<string, any>) {
    this.track('error', {
      message: error.message,
      stack: error.stack,
      ...context
    })

    if ((window as any).Sentry) {
      (window as any).Sentry.captureException(error, {
        extra: context
      })
    }
  }

  // Track performance metrics
  trackPerformance(metric: string, value: number, unit: string = 'ms') {
    this.track('performance', {
      metric,
      value,
      unit
    })

    // Report to Vercel Analytics
    if ((window as any).va) {
      (window as any).va('track', 'performance', { metric, value, unit })
    }
  }

  // Track feature usage
  trackFeatureUsage(feature: string, action: string, metadata?: Record<string, any>) {
    this.track('feature_usage', {
      feature,
      action,
      ...metadata
    })
  }

  // Track conversion events
  trackConversion(type: string, value?: number, currency?: string) {
    this.track('conversion', {
      type,
      value,
      currency
    })

    if ((window as any).gtag) {
      (window as any).gtag('event', 'conversion', {
        send_to: process.env.REACT_APP_GA_CONVERSION_ID,
        value: value,
        currency: currency
      })
    }
  }

  // Private methods
  private sendEvent(event: AnalyticsEvent) {
    // Send to your analytics backend
    if (process.env.NODE_ENV === 'production') {
      fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
      }).catch(console.error)
    }

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics]', event.name, event.properties)
    }
  }

  private processQueue() {
    while (this.queue.length > 0) {
      const event = this.queue.shift()
      if (event) {
        this.sendEvent(event)
      }
    }
  }
}

// Singleton instance
export const analytics = new Analytics()

// React hooks for analytics
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export const usePageTracking = () => {
  const location = useLocation()

  useEffect(() => {
    analytics.trackPageView(location.pathname + location.search)
  }, [location])
}

export const useErrorTracking = () => {
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      analytics.trackError(new Error(event.message), {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      })
    }

    const handleRejection = (event: PromiseRejectionEvent) => {
      analytics.trackError(new Error(event.reason), {
        type: 'unhandled_rejection'
      })
    }

    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleRejection)

    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleRejection)
    }
  }, [])
}

// Performance monitoring
export const trackWebVitals = () => {
  if ('web-vital' in window) {
    const { getCLS, getFID, getFCP, getLCP, getTTFB } = window as any

    getCLS((metric: any) => analytics.trackPerformance('CLS', metric.value))
    getFID((metric: any) => analytics.trackPerformance('FID', metric.value))
    getFCP((metric: any) => analytics.trackPerformance('FCP', metric.value))
    getLCP((metric: any) => analytics.trackPerformance('LCP', metric.value))
    getTTFB((metric: any) => analytics.trackPerformance('TTFB', metric.value))
  }
}

// Initialize on load
if (typeof window !== 'undefined') {
  analytics.init()
}