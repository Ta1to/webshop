/**
 * Unit Tests for Cookies Service (Cookie Consent Management)
 * Following the AAA (Arrange-Act-Assert) Pattern
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock errorHandler
vi.mock('@/services/utils/errorHandler', () => ({
  errorHandler: {
    error: vi.fn(),
    warn: vi.fn()
  }
}))

import {
  COOKIE_CATEGORIES,
  hasConsent,
  getPreferences,
  savePreferences,
  acceptAllCookies,
  acceptNecessaryCookies,
  rejectAllCookies,
  clearConsent,
  isCategoryAllowed,
  getConsentInfo
} from '@/services/utils/cookies'

// Mock localStorage
let localStorageMock = {}

beforeEach(() => {
  // Reset localStorage mock
  localStorageMock = {}
  
  // Create localStorage mock with proper getters
  const localStorageGetItem = vi.fn((key) => localStorageMock[key] || null)
  const localStorageSetItem = vi.fn((key, value) => {
    localStorageMock[key] = value
  })
  const localStorageRemoveItem = vi.fn((key) => {
    delete localStorageMock[key]
  })
  
  Object.defineProperty(global, 'localStorage', {
    value: {
      getItem: localStorageGetItem,
      setItem: localStorageSetItem,
      removeItem: localStorageRemoveItem,
      clear: vi.fn(() => {
        localStorageMock = {}
      })
    },
    writable: true
  })
})

describe('COOKIE_CATEGORIES', () => {
  it('should define all cookie categories', () => {
    // Assert
    expect(COOKIE_CATEGORIES.NECESSARY).toBe('necessary')
    expect(COOKIE_CATEGORIES.FUNCTIONAL).toBe('functional')
    expect(COOKIE_CATEGORIES.ANALYTICS).toBe('analytics')
    expect(COOKIE_CATEGORIES.MARKETING).toBe('marketing')
  })
})

describe('hasConsent', () => {
  it('should return false when no consent is stored', () => {
    // Arrange - no consent in localStorage

    // Act
    const result = hasConsent()

    // Assert
    expect(result).toBe(false)
  })

  it('should return true when valid consent exists', () => {
    // Arrange
    const consent = {
      version: '1.0',
      timestamp: new Date().toISOString()
    }
    localStorageMock['evaris_cookie_consent'] = JSON.stringify(consent)

    // Act
    const result = hasConsent()

    // Assert
    expect(result).toBe(true)
  })

  it('should return false for invalid consent version', () => {
    // Arrange
    const consent = {
      version: '0.5',
      timestamp: new Date().toISOString()
    }
    localStorageMock['evaris_cookie_consent'] = JSON.stringify(consent)

    // Act
    const result = hasConsent()

    // Assert
    expect(result).toBe(false)
  })

  it('should return false for malformed consent data', () => {
    // Arrange
    localStorageMock['evaris_cookie_consent'] = 'invalid-json'

    // Act
    const result = hasConsent()

    // Assert
    expect(result).toBe(false)
  })
})

describe('getPreferences', () => {
  it('should return default preferences when none are stored', () => {
    // Arrange - no preferences in localStorage

    // Act
    const result = getPreferences()

    // Assert
    expect(result).toEqual({
      necessary: true,
      functional: false,
      analytics: false,
      marketing: false
    })
  })

  it('should return saved preferences', () => {
    // Arrange
    const savedPrefs = {
      necessary: true,
      functional: true,
      analytics: false,
      marketing: false
    }
    localStorageMock['evaris_cookie_preferences'] = JSON.stringify(savedPrefs)

    // Act
    const result = getPreferences()

    // Assert
    expect(result).toEqual(savedPrefs)
  })

  it('should always ensure necessary cookies are enabled', () => {
    // Arrange
    const savedPrefs = {
      necessary: false, // Try to disable necessary cookies
      functional: true,
      analytics: true,
      marketing: true
    }
    localStorageMock['evaris_cookie_preferences'] = JSON.stringify(savedPrefs)

    // Act
    const result = getPreferences()

    // Assert
    expect(result.necessary).toBe(true)
  })

  it('should handle malformed preferences data', () => {
    // Arrange
    localStorageMock['evaris_cookie_preferences'] = 'invalid-json'

    // Act
    const result = getPreferences()

    // Assert
    expect(result).toEqual({
      necessary: true,
      functional: false,
      analytics: false,
      marketing: false
    })
  })
})

describe('savePreferences', () => {
  it('should save valid preferences', () => {
    // Arrange
    const preferences = {
      necessary: true,
      functional: true,
      analytics: false,
      marketing: false
    }

    // Act
    const result = savePreferences(preferences)

    // Assert
    expect(result.success).toBe(true)
    expect(result.preferences).toEqual(preferences)
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'evaris_cookie_preferences',
      expect.any(String)
    )
  })

  it('should save consent timestamp when saving preferences', () => {
    // Arrange
    const preferences = {
      functional: true,
      analytics: true
    }

    // Act
    savePreferences(preferences)

    // Assert
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'evaris_cookie_consent',
      expect.any(String)
    )
    
    const savedConsent = JSON.parse(localStorageMock['evaris_cookie_consent'])
    expect(savedConsent).toHaveProperty('version', '1.0')
    expect(savedConsent).toHaveProperty('timestamp')
  })

  it('should always enforce necessary cookies as true', () => {
    // Arrange
    const preferences = {
      necessary: false,
      functional: true
    }

    // Act
    const result = savePreferences(preferences)

    // Assert
    expect(result.preferences.necessary).toBe(true)
  })

  it('should return error for invalid preferences', () => {
    // Arrange
    const invalidPreferences = null

    // Act
    const result = savePreferences(invalidPreferences)

    // Assert
    expect(result.success).toBe(false)
    expect(result).toHaveProperty('error')
  })

  it('should return error for non-object preferences', () => {
    // Arrange
    const invalidPreferences = 'not-an-object'

    // Act
    const result = savePreferences(invalidPreferences)

    // Assert
    expect(result.success).toBe(false)
    expect(result.error).toBe('Invalid cookie preferences')
  })
})

describe('acceptAllCookies', () => {
  it('should enable all cookie categories', () => {
    // Arrange & Act
    const result = acceptAllCookies()

    // Assert
    expect(result.success).toBe(true)
    expect(result.preferences).toEqual({
      necessary: true,
      functional: true,
      analytics: true,
      marketing: true
    })
  })

  it('should save consent when accepting all cookies', () => {
    // Arrange & Act
    acceptAllCookies()

    // Assert
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'evaris_cookie_consent',
      expect.any(String)
    )
  })
})

describe('acceptNecessaryCookies', () => {
  it('should enable only necessary cookies', () => {
    // Arrange & Act
    const result = acceptNecessaryCookies()

    // Assert
    expect(result.success).toBe(true)
    expect(result.preferences).toEqual({
      necessary: true,
      functional: false,
      analytics: false,
      marketing: false
    })
  })
})

describe('rejectAllCookies', () => {
  it('should reject all non-necessary cookies', () => {
    // Arrange & Act
    const result = rejectAllCookies()

    // Assert
    expect(result.success).toBe(true)
    expect(result.preferences.necessary).toBe(true)
    expect(result.preferences.functional).toBe(false)
    expect(result.preferences.analytics).toBe(false)
    expect(result.preferences.marketing).toBe(false)
  })
})

describe('clearConsent', () => {
  it('should remove all consent data from localStorage', () => {
    // Arrange
    localStorageMock['evaris_cookie_consent'] = 'data'
    localStorageMock['evaris_cookie_preferences'] = 'data'

    // Act
    const result = clearConsent()

    // Assert
    expect(result.success).toBe(true)
    expect(localStorage.removeItem).toHaveBeenCalledWith('evaris_cookie_consent')
    expect(localStorage.removeItem).toHaveBeenCalledWith('evaris_cookie_preferences')
  })

  it('should not throw error when clearing non-existent data', () => {
    // Arrange - no data in localStorage

    // Act
    const result = clearConsent()

    // Assert
    expect(result.success).toBe(true)
  })
})

describe('isCategoryAllowed', () => {
  it('should return true for allowed category', () => {
    // Arrange
    const preferences = {
      necessary: true,
      functional: true,
      analytics: false,
      marketing: false
    }
    localStorageMock['evaris_cookie_preferences'] = JSON.stringify(preferences)

    // Act
    const result = isCategoryAllowed(COOKIE_CATEGORIES.FUNCTIONAL)

    // Assert
    expect(result).toBe(true)
  })

  it('should return false for disallowed category', () => {
    // Arrange
    const preferences = {
      necessary: true,
      functional: false,
      analytics: false,
      marketing: false
    }
    localStorageMock['evaris_cookie_preferences'] = JSON.stringify(preferences)

    // Act
    const result = isCategoryAllowed(COOKIE_CATEGORIES.ANALYTICS)

    // Assert
    expect(result).toBe(false)
  })

  it('should always return true for necessary cookies', () => {
    // Arrange - no preferences set

    // Act
    const result = isCategoryAllowed(COOKIE_CATEGORIES.NECESSARY)

    // Assert
    expect(result).toBe(true)
  })
})

describe('getConsentInfo', () => {
  it('should return consent information when available', () => {
    // Arrange
    const consent = {
      version: '1.0',
      timestamp: '2026-02-14T10:00:00.000Z'
    }
    localStorageMock['evaris_cookie_consent'] = JSON.stringify(consent)

    // Act
    const result = getConsentInfo()

    // Assert
    expect(result).toEqual(consent)
  })

  it('should return null when no consent exists', () => {
    // Arrange - no consent in localStorage

    // Act
    const result = getConsentInfo()

    // Assert
    expect(result).toBeNull()
  })

  it('should return null for malformed consent data', () => {
    // Arrange
    localStorageMock['evaris_cookie_consent'] = 'invalid-json'

    // Act
    const result = getConsentInfo()

    // Assert
    expect(result).toBeNull()
  })
})

describe('Cookie Workflow Integration', () => {
  it('should handle complete accept-update-reject workflow', () => {
    // Arrange & Act - Accept all
    acceptAllCookies()
    
    // Assert
    expect(hasConsent()).toBe(true)
    expect(isCategoryAllowed(COOKIE_CATEGORIES.ANALYTICS)).toBe(true)

    // Act - Update to custom preferences
    savePreferences({
      necessary: true,
      functional: true,
      analytics: false,
      marketing: false
    })

    // Assert
    expect(isCategoryAllowed(COOKIE_CATEGORIES.ANALYTICS)).toBe(false)
    expect(isCategoryAllowed(COOKIE_CATEGORIES.FUNCTIONAL)).toBe(true)

    // Act - Clear consent
    clearConsent()

    // Assert
    expect(hasConsent()).toBe(false)
  })
})
