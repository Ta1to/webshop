/**
 * Cookie Consent Management Service
 * Provides utilities to check if specific cookie categories are enabled
 */

import Cookies from 'js-cookie'

const CONSENT_COOKIE_NAME = 'webshop_cookie_consent'
const PREFERENCES_COOKIE_NAME = 'webshop_cookie_preferences'

/**
 * Check if user has given consent for analytics cookies
 */
export const canUseAnalytics = () => {
  const consent = Cookies.get(CONSENT_COOKIE_NAME)
  
  if (consent === 'all') {
    return true
  }
  
  if (consent === 'essential') {
    return false
  }
  
  // Check custom preferences
  const preferences = Cookies.get(PREFERENCES_COOKIE_NAME)
  if (preferences) {
    try {
      const parsed = JSON.parse(preferences)
      return parsed.analytics === true
    } catch {
      return false
    }
  }
  
  // Default to false if no consent given
  return false
}

/**
 * Check if user has given consent for marketing cookies
 */
export const canUseMarketing = () => {
  const consent = Cookies.get(CONSENT_COOKIE_NAME)
  
  if (consent === 'all') {
    return true
  }
  
  if (consent === 'essential') {
    return false
  }
  
  // Check custom preferences
  const preferences = Cookies.get(PREFERENCES_COOKIE_NAME)
  if (preferences) {
    try {
      const parsed = JSON.parse(preferences)
      return parsed.marketing === true
    } catch {
      return false
    }
  }
  
  // Default to false if no consent given
  return false
}

/**
 * Check if user has given any consent (essential or more)
 */
export const hasConsent = () => {
  const consent = Cookies.get(CONSENT_COOKIE_NAME)
  return consent !== undefined && consent !== null
}

/**
 * Get current consent level
 * @returns {'all' | 'essential' | 'custom' | null}
 */
export const getConsentLevel = () => {
  return Cookies.get(CONSENT_COOKIE_NAME) || null
}

