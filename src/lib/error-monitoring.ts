/**
 * Lightweight Error Monitoring for Production
 * Captures errors, performance metrics, and user context without external dependencies
 */

type SeverityLevel = "info" | "warn" | "error" | "fatal";

interface ErrorContext {
  userId?: string;
  email?: string;
  extra?: Record<string, unknown>;
}

interface Breadcrumb {
  message: string;
  category: string;
  level: SeverityLevel;
  timestamp: number;
}

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
}

// In-memory storage for monitoring data
const state = {
  userContext: null as ErrorContext | null,
  breadcrumbs: [] as Breadcrumb[],
  errors: [] as { error: Error; context?: Record<string, unknown>; timestamp: number }[],
  performanceMetrics: [] as PerformanceMetric[],
  isInitialized: false,
};

const MAX_BREADCRUMBS = 50;
const MAX_ERRORS = 20;

/**
 * Initialize error monitoring
 */
export function initErrorMonitoring() {
  if (state.isInitialized) return;

  // Global error handler
  window.addEventListener("error", (event) => {
    captureError(event.error || new Error(event.message), {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
  });

  // Unhandled promise rejection handler
  window.addEventListener("unhandledrejection", (event) => {
    const error = event.reason instanceof Error 
      ? event.reason 
      : new Error(String(event.reason));
    captureError(error, { type: "unhandledrejection" });
  });

  // Performance monitoring using Web Vitals API
  if ("PerformanceObserver" in window) {
    try {
      // Observe Largest Contentful Paint
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        trackPerformance("LCP", lastEntry.startTime);
      });
      lcpObserver.observe({ type: "largest-contentful-paint", buffered: true });

      // Observe First Input Delay
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if ("processingStart" in entry) {
            trackPerformance("FID", (entry as PerformanceEventTiming).processingStart - entry.startTime);
          }
        });
      });
      fidObserver.observe({ type: "first-input", buffered: true });

      // Observe Cumulative Layout Shift
      const clsObserver = new PerformanceObserver((list) => {
        let clsValue = 0;
        list.getEntries().forEach((entry) => {
          if (!(entry as PerformanceEntry & { hadRecentInput?: boolean }).hadRecentInput) {
            clsValue += (entry as PerformanceEntry & { value?: number }).value || 0;
          }
        });
        if (clsValue > 0) {
          trackPerformance("CLS", clsValue);
        }
      });
      clsObserver.observe({ type: "layout-shift", buffered: true });
    } catch (e) {
      // PerformanceObserver not fully supported
      if (import.meta.env.DEV) {
        console.warn("Performance monitoring limited:", e);
      }
    }
  }

  // Track navigation timing
  window.addEventListener("load", () => {
    setTimeout(() => {
      const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
      if (navigation) {
        trackPerformance("TTFB", navigation.responseStart - navigation.requestStart);
        trackPerformance("DOMContentLoaded", navigation.domContentLoadedEventEnd - navigation.fetchStart);
        trackPerformance("Load", navigation.loadEventEnd - navigation.fetchStart);
      }
    }, 0);
  });

  state.isInitialized = true;

  if (import.meta.env.DEV) {
    console.log("Error Monitoring: Initialized");
  }
}

/**
 * Capture a custom error with additional context
 */
export function captureError(
  error: Error,
  context?: Record<string, unknown>
) {
  const errorData = {
    error,
    context: {
      ...context,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      breadcrumbs: [...state.breadcrumbs],
      user: state.userContext,
    },
    timestamp: Date.now(),
  };

  state.errors.push(errorData);
  
  // Keep only recent errors
  if (state.errors.length > MAX_ERRORS) {
    state.errors.shift();
  }

  // Log in development
  if (import.meta.env.DEV) {
    console.error("Error captured:", error.message, context);
  }

  // In production, you could send to your backend
  if (import.meta.env.PROD) {
    sendErrorToBackend(errorData);
  }
}

/**
 * Send error to backend (implement your own endpoint)
 */
async function sendErrorToBackend(errorData: {
  error: Error;
  context?: Record<string, unknown>;
  timestamp: number;
}) {
  // Optional: Send to your own backend endpoint
  try {
    const payload = {
      name: errorData.error.name,
      message: errorData.error.message,
      stack: errorData.error.stack,
      context: errorData.context,
      timestamp: errorData.timestamp,
    };

    // Example: Send to Supabase edge function
    // await fetch('/api/log-error', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(payload),
    // });

    // For now, just log to console in production
    console.error("[Error Monitor]", payload.message);
  } catch {
    // Silently fail - don't cause more errors while reporting errors
  }
}

/**
 * Set user context for error tracking
 */
export function setUserContext(user: { id: string; email?: string }) {
  state.userContext = {
    userId: user.id,
    email: user.email,
  };
}

/**
 * Clear user context on logout
 */
export function clearUserContext() {
  state.userContext = null;
}

/**
 * Add breadcrumb for debugging
 */
export function addBreadcrumb(
  message: string,
  category: string,
  level: SeverityLevel = "info"
) {
  state.breadcrumbs.push({
    message,
    category,
    level,
    timestamp: Date.now(),
  });

  // Keep only recent breadcrumbs
  if (state.breadcrumbs.length > MAX_BREADCRUMBS) {
    state.breadcrumbs.shift();
  }
}

/**
 * Track performance metrics
 */
export function trackPerformance(name: string, value: number) {
  state.performanceMetrics.push({
    name,
    value,
    timestamp: Date.now(),
  });

  if (import.meta.env.DEV) {
    console.log(`[Performance] ${name}: ${value.toFixed(2)}ms`);
  }
}

/**
 * Get current monitoring state (for debugging)
 */
export function getMonitoringState() {
  return {
    errors: state.errors,
    breadcrumbs: state.breadcrumbs,
    performanceMetrics: state.performanceMetrics,
    userContext: state.userContext,
  };
}

// Re-export ErrorBoundary component
export { ErrorBoundary } from "@/components/ErrorBoundary";
