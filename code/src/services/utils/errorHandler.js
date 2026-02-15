/**
 * Error Handler Service
 * Centralized error handling and logging
 */

/**
 * Error severity levels
 */
export const ErrorLevel = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info'
}

/**
 * Error Handler Class
 * Handles logging, user notifications, and error tracking
 */
class ErrorHandler {
  constructor() {
    this.listeners = []
  }

  /**
   * Log an error/warning/info message
   * @param {string} level - Error level (error, warn, info)
   * @param {string} message - User-friendly message
   * @param {Error|any} error - Error object or additional context
   * @param {object} context - Additional context data
   */
  log(level, message, error = null, context = {}) {
    const timestamp = new Date().toISOString()
    const entry = {
      timestamp,
      level,
      message,
      error: error?.message || error,
      stack: error?.stack,
      context
    }

    // Development: Console logging with colors
    if (import.meta.env.DEV) {
      const styles = {
        error: 'color: #ef4444; font-weight: bold',
        warn: 'color: #f59e0b; font-weight: bold',
        info: 'color: #3b82f6'
      }
      console[level](`%c[${level.toUpperCase()}]`, styles[level], message, error || '', context)
    }

    // Production: Send to external service (Sentry, LogRocket, etc.)
    if (import.meta.env.PROD && level === ErrorLevel.ERROR) {
      // Example: Sentry.captureException(error, { extra: context })
      this.sendToExternalService(entry)
    }

    // Notify listeners (e.g., Toast notifications)
    this.notifyListeners(entry)
  }

  /**
   * Log an error
   * @param {string} message - User-friendly error message
   * @param {Error} error - Error object
   * @param {object} context - Additional context
   */
  error(message, error = null, context = {}) {
    this.log(ErrorLevel.ERROR, message, error, context)
  }

  /**
   * Log a warning
   * @param {string} message - Warning message
   * @param {any} error - Error or context
   * @param {object} context - Additional context
   */
  warn(message, error = null, context = {}) {
    this.log(ErrorLevel.WARN, message, error, context)
  }

  /**
   * Log an info message
   * @param {string} message - Info message
   * @param {object} context - Additional context
   */
  info(message, context = {}) {
    this.log(ErrorLevel.INFO, message, null, context)
  }

  /**
   * Send error to external tracking service
   * @param {object} entry - Error entry
   */
  sendToExternalService(entry) {
    // Placeholder for external service integration
    // Example: Sentry, LogRocket, custom API
    try {
      // fetch('/api/log-error', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(entry)
      // })
    } catch (err) {
      console.error('Failed to send error to external service:', err)
    }
  }

  /**
   * Add error listener (for toast notifications, etc.)
   * @param {Function} callback - Callback function
   */
  addListener(callback) {
    this.listeners.push(callback)
  }

  /**
   * Remove error listener
   * @param {Function} callback - Callback function
   */
  removeListener(callback) {
    this.listeners = this.listeners.filter(cb => cb !== callback)
  }

  /**
   * Notify all listeners
   * @param {object} entry - Error entry
   */
  notifyListeners(entry) {
    this.listeners.forEach(callback => {
      try {
        callback(entry)
      } catch (err) {
        console.error('Error in error listener:', err)
      }
    })
  }
}

// Singleton instance
export const errorHandler = new ErrorHandler()

/**
 * Helper function to wrap async functions with error handling
 * @param {Function} fn - Async function to wrap
 * @param {string} errorMessage - Default error message
 * @returns {Function} Wrapped function
 */
export function withErrorHandling(fn, errorMessage = 'An error occurred') {
  return async (...args) => {
    try {
      return await fn(...args)
    } catch (error) {
      errorHandler.error(errorMessage, error)
      throw error
    }
  }
}
