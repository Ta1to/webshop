import { describe, it, expect, beforeEach, vi } from 'vitest'
import { CookieManager } from '@/services/utils/cookies'

// Mock document.cookie
let cookieStore = ''

beforeEach(() => {
  // Reset cookie store before each test
  cookieStore = ''
  
  // Mock document.cookie getter and setter
  Object.defineProperty(document, 'cookie', {
    get: () => cookieStore,
    set: (value) => {
      // Parse the cookie being set
      const [cookieString] = value.split(';')
      const [name, val] = cookieString.split('=')
      
      // Check if it's a deletion (expired date)
      if (value.includes('expires=Thu, 01 Jan 1970')) {
        // Remove the cookie from store
        const cookies = cookieStore.split(';').filter(c => {
          const trimmed = c.trim()
          return !trimmed.startsWith(`${name}=`)
        })
        cookieStore = cookies.join('; ')
      } else {
        // Add or update the cookie
        const existingCookies = cookieStore.split(';').filter(c => {
          const trimmed = c.trim()
          return trimmed && !trimmed.startsWith(`${name}=`)
        })
        existingCookies.push(cookieString)
        cookieStore = existingCookies.join('; ')
      }
    },
    configurable: true
  })
})

describe('CookieManager.set', () => {
  it('should set a cookie with a string value', () => {
    // Arrange
    const name = 'testCookie'
    const value = 'testValue'

    // Act
    CookieManager.set(name, value)

    // Assert
    expect(cookieStore).toContain(`${name}="${value}"`)
  })

  it('should set a cookie with an object value', () => {
    // Arrange
    const name = 'cartCookie'
    const value = { items: [{ id: 1, quantity: 2 }], total: 50 }

    // Act
    CookieManager.set(name, value)

    // Assert
    const retrieved = CookieManager.get(name)
    expect(retrieved).toEqual(value)
  })

  it('should set a cookie with an array value', () => {
    // Arrange
    const name = 'wishlist'
    const value = ['product1', 'product2', 'product3']

    // Act
    CookieManager.set(name, value)

    // Assert
    const retrieved = CookieManager.get(name)
    expect(retrieved).toEqual(value)
  })

  it('should throw error when name is not provided', () => {
    // Arrange
    const name = ''
    const value = 'test'

    // Act & Assert
    expect(() => CookieManager.set(name, value)).toThrow('Cookie name is required')
  })
})

describe('CookieManager.get', () => {
  it('should retrieve existing cookie value', () => {
    // Arrange
    const name = 'testCookie'
    const value = { data: 'test', count: 5 }
    CookieManager.set(name, value)

    // Act
    const result = CookieManager.get(name)

    // Assert
    expect(result).toEqual(value)
  })

  it('should return null for non-existent cookie', () => {
    // Arrange
    const name = 'nonExistentCookie'

    // Act
    const result = CookieManager.get(name)

    // Assert
    expect(result).toBeNull()
  })

  it('should return null when name is not provided', () => {
    // Arrange & Act
    const result = CookieManager.get('')

    // Assert
    expect(result).toBeNull()
  })

  it('should parse JSON values correctly', () => {
    // Arrange
    const name = 'complexCookie'
    const value = {
      user: { id: 123, name: 'John' },
      items: [1, 2, 3],
      active: true
    }
    CookieManager.set(name, value)

    // Act
    const result = CookieManager.get(name)

    // Assert
    expect(result).toEqual(value)
    expect(result.user.name).toBe('John')
    expect(result.items).toHaveLength(3)
  })

  it('should handle malformed JSON gracefully', () => {
    // Arrange
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    cookieStore = 'badCookie={invalid-json}'

    // Act
    const result = CookieManager.get('badCookie')

    // Assert
    expect(result).toBeNull()
    expect(consoleWarnSpy).toHaveBeenCalled()
    
    // Cleanup
    consoleWarnSpy.mockRestore()
  })
})

describe('CookieManager.delete', () => {
  it('should delete an existing cookie', () => {
    // Arrange
    const name = 'testCookie'
    const value = 'testValue'
    CookieManager.set(name, value)
    expect(CookieManager.exists(name)).toBe(true)

    // Act
    CookieManager.delete(name)

    // Assert
    expect(CookieManager.exists(name)).toBe(false)
    expect(CookieManager.get(name)).toBeNull()
  })

  it('should not throw error when deleting non-existent cookie', () => {
    // Arrange
    const name = 'nonExistentCookie'

    // Act & Assert
    expect(() => CookieManager.delete(name)).not.toThrow()
  })

  it('should do nothing when name is empty', () => {
    // Arrange & Act
    CookieManager.delete('')

    // Assert - No exception should be thrown
    expect(true).toBe(true)
  })
})

describe('CookieManager.exists', () => {
  it('should return true for existing cookie', () => {
    // Arrange
    const name = 'existingCookie'
    CookieManager.set(name, 'value')

    // Act
    const result = CookieManager.exists(name)

    // Assert
    expect(result).toBe(true)
  })

  it('should return false for non-existent cookie', () => {
    // Arrange
    const name = 'nonExistentCookie'

    // Act
    const result = CookieManager.exists(name)

    // Assert
    expect(result).toBe(false)
  })

  it('should return false after cookie is deleted', () => {
    // Arrange
    const name = 'tempCookie'
    CookieManager.set(name, 'value')
    
    // Act
    CookieManager.delete(name)
    const result = CookieManager.exists(name)

    // Assert
    expect(result).toBe(false)
  })
})

describe('CookieManager - Integration scenarios', () => {
  it('should handle cart workflow: set, update, retrieve, delete', () => {
    // Arrange
    const cartName = 'cart'
    const initialCart = { items: [], total: 0 }

    // Act - Set initial cart
    CookieManager.set(cartName, initialCart)
    expect(CookieManager.exists(cartName)).toBe(true)

    // Act - Update cart
    const updatedCart = { items: [{ id: 1, qty: 2 }], total: 50 }
    CookieManager.set(cartName, updatedCart)

    // Act - Retrieve cart
    const retrievedCart = CookieManager.get(cartName)

    // Assert
    expect(retrievedCart).toEqual(updatedCart)
    expect(retrievedCart.items).toHaveLength(1)
    expect(retrievedCart.total).toBe(50)

    // Act - Delete cart
    CookieManager.delete(cartName)

    // Assert
    expect(CookieManager.exists(cartName)).toBe(false)
  })

  it('should handle multiple cookies independently', () => {
    // Arrange
    const cookie1 = { name: 'cart', value: ['item1'] }
    const cookie2 = { name: 'wishlist', value: ['item2'] }
    const cookie3 = { name: 'preferences', value: { theme: 'dark' } }

    // Act
    CookieManager.set(cookie1.name, cookie1.value)
    CookieManager.set(cookie2.name, cookie2.value)
    CookieManager.set(cookie3.name, cookie3.value)

    // Assert - All cookies exist
    expect(CookieManager.exists(cookie1.name)).toBe(true)
    expect(CookieManager.exists(cookie2.name)).toBe(true)
    expect(CookieManager.exists(cookie3.name)).toBe(true)

    // Assert - Values are correct
    expect(CookieManager.get(cookie1.name)).toEqual(cookie1.value)
    expect(CookieManager.get(cookie2.name)).toEqual(cookie2.value)
    expect(CookieManager.get(cookie3.name)).toEqual(cookie3.value)

    // Act - Delete one cookie
    CookieManager.delete(cookie2.name)

    // Assert - Only deleted cookie is gone
    expect(CookieManager.exists(cookie1.name)).toBe(true)
    expect(CookieManager.exists(cookie2.name)).toBe(false)
    expect(CookieManager.exists(cookie3.name)).toBe(true)
  })
})
