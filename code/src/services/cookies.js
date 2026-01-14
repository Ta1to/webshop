/**
 * Cookie Consent Management Service
 * Handles cookie preferences and consent management
 */

const COOKIE_CONSENT_KEY = 'evaris_cookie_consent'
const COOKIE_PREFERENCES_KEY = 'evaris_cookie_preferences'
const CONSENT_VERSION = '1.0'

/**
 * Cookie categories
 */
export const COOKIE_CATEGORIES = {
  NECESSARY: 'necessary',
  FUNCTIONAL: 'functional',
  ANALYTICS: 'analytics',
  MARKETING: 'marketing'
}

/**
 * Default cookie preferences
 */
const DEFAULT_PREFERENCES = {
  [COOKIE_CATEGORIES.NECESSARY]: true, // Always true, cannot be disabled
  [COOKIE_CATEGORIES.FUNCTIONAL]: false,
  [COOKIE_CATEGORIES.ANALYTICS]: false,
  [COOKIE_CATEGORIES.MARKETING]: false
}

/**
 * Check if user has given consent
 */
export const hasConsent = () => {
  try {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY)
    if (!consent) return false
    
    const data = JSON.parse(consent)
    return data.version === CONSENT_VERSION && data.timestamp
  } catch (error) {
    console.error('Error checking cookie consent:', error)
    return false
  }
}

/**
 * Get cookie preferences
 */
export const getPreferences = () => {
  try {
    const preferences = localStorage.getItem(COOKIE_PREFERENCES_KEY)
    if (!preferences) return { ...DEFAULT_PREFERENCES }
    
    const saved = JSON.parse(preferences)
    // Ensure necessary cookies are always enabled
    return {
      ...DEFAULT_PREFERENCES,
      ...saved,
      [COOKIE_CATEGORIES.NECESSARY]: true
    }
  } catch (error) {
    console.error('Error getting cookie preferences:', error)
    return { ...DEFAULT_PREFERENCES }
  }
}

/**
 * Save cookie preferences
 */
export const savePreferences = (preferences) => {
  try {
    // Ensure necessary cookies are always enabled
    const safePreferences = {
      ...preferences,
      [COOKIE_CATEGORIES.NECESSARY]: true
    }
    
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(safePreferences))
    
    // Save consent timestamp
    const consent = {
      version: CONSENT_VERSION,
      timestamp: new Date().toISOString()
    }
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consent))
    
    return { success: true, preferences: safePreferences }
  } catch (error) {
    console.error('Error saving cookie preferences:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Accept all cookies
 */
export const acceptAllCookies = () => {
  const allAccepted = {
    [COOKIE_CATEGORIES.NECESSARY]: true,
    [COOKIE_CATEGORIES.FUNCTIONAL]: true,
    [COOKIE_CATEGORIES.ANALYTICS]: true,
    [COOKIE_CATEGORIES.MARKETING]: true
  }
  return savePreferences(allAccepted)
}

/**
 * Accept only necessary cookies
 */
export const acceptNecessaryCookies = () => {
  return savePreferences({ ...DEFAULT_PREFERENCES })
}

/**
 * Reject all non-necessary cookies
 */
export const rejectAllCookies = () => {
  return acceptNecessaryCookies()
}

/**
 * Clear all consent data
 */
export const clearConsent = () => {
  try {
    localStorage.removeItem(COOKIE_CONSENT_KEY)
    localStorage.removeItem(COOKIE_PREFERENCES_KEY)
    return { success: true }
  } catch (error) {
    console.error('Error clearing cookie consent:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Check if a specific cookie category is allowed
 */
export const isCategoryAllowed = (category) => {
  const preferences = getPreferences()
  return preferences[category] === true
}

/**
 * Get consent information
 */
export const getConsentInfo = () => {
  try {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY)
    if (!consent) return null
    
    return JSON.parse(consent)
  } catch (error) {
    console.error('Error getting consent info:', error)
    return null
  }
}

/**
 * Cookie descriptions for UI
 */
export const COOKIE_DESCRIPTIONS = {
  [COOKIE_CATEGORIES.NECESSARY]: {
    title: 'Notwendige Cookies',
    description: 'Diese Cookies sind für die Grundfunktionen der Website erforderlich und können nicht deaktiviert werden. Sie speichern Ihre Cookie-Einstellungen, Warenkorbinhalte und Authentifizierungsdaten.',
    examples: ['Sitzungs-ID', 'Warenkorb', 'Cookie-Einstellungen']
  },
  [COOKIE_CATEGORIES.FUNCTIONAL]: {
    title: 'Funktionale Cookies',
    description: 'Diese Cookies ermöglichen erweiterte Funktionen und Personalisierung wie Video-Einbettungen, Sprachwahl und Ihre bevorzugten Einstellungen.',
    examples: ['Spracheinstellungen', 'Favoritenliste', 'Layout-Präferenzen']
  },
  [COOKIE_CATEGORIES.ANALYTICS]: {
    title: 'Analyse Cookies',
    description: 'Diese Cookies helfen uns zu verstehen, wie Besucher mit der Website interagieren, indem Informationen anonym gesammelt und analysiert werden.',
    examples: ['Google Analytics', 'Besucherstatistiken', 'Performance-Tracking']
  },
  [COOKIE_CATEGORIES.MARKETING]: {
    title: 'Marketing Cookies',
    description: 'Diese Cookies werden verwendet, um Werbung relevanter für Sie und Ihre Interessen zu gestalten. Sie begrenzen auch die Häufigkeit von Werbeanzeigen.',
    examples: ['Werbenetzwerke', 'Social Media', 'Retargeting']
  }
}
