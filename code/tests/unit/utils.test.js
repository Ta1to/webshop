import { describe, it, expect } from 'vitest'
import {
  formatPrice,
  truncateText,
  isValidEmail,
  slugify,
  calculateDiscountPrice,
  getStockStatus,
  getStockClass,
  deepClone
} from '@/utils/index'

describe('formatPrice', () => {
  it('should format price in EUR currency', () => {
    // Arrange
    const price = 19.99

    // Act
    const result = formatPrice(price)

    // Assert
    expect(result).toContain('19,99')
    expect(result).toContain('€')
  })

  it('should format zero price correctly', () => {
    // Arrange
    const price = 0

    // Act
    const result = formatPrice(price)

    // Assert
    expect(result).toContain('0,00')
  })

  it('should format large prices with thousands separator', () => {
    // Arrange
    const price = 1234.56

    // Act
    const result = formatPrice(price)

    // Assert
    expect(result).toContain('1.234,56')
  })
})

describe('truncateText', () => {
  it('should truncate text longer than maxLength', () => {
    // Arrange
    const text = 'This is a very long text that needs truncation'
    const maxLength = 10

    // Act
    const result = truncateText(text, maxLength)

    // Assert
    expect(result).toBe('This is a...')
    expect(result.length).toBeLessThanOrEqual(maxLength + 3) // +3 for '...'
  })

  it('should not truncate text shorter than maxLength', () => {
    // Arrange
    const text = 'Short text'
    const maxLength = 20

    // Act
    const result = truncateText(text, maxLength)

    // Assert
    expect(result).toBe(text)
  })

  it('should return empty string for empty input', () => {
    // Arrange
    const text = ''
    const maxLength = 10

    // Act
    const result = truncateText(text, maxLength)

    // Assert
    expect(result).toBe('')
  })

  it('should handle custom suffix', () => {
    // Arrange
    const text = 'Long text here'
    const maxLength = 5
    const suffix = '---'

    // Act
    const result = truncateText(text, maxLength, suffix)

    // Assert
    expect(result).toBe('Long---')
  })
})

describe('isValidEmail', () => {
  it('should validate correct email addresses', () => {
    // Arrange
    const validEmails = [
      'test@example.com',
      'user.name@domain.de',
      'info@company.co.uk'
    ]

    validEmails.forEach(email => {
      // Act
      const result = isValidEmail(email)

      // Assert
      expect(result).toBe(true)
    })
  })

  it('should reject invalid email addresses', () => {
    // Arrange
    const invalidEmails = [
      'invalid',
      '@example.com',
      'user@',
      'user name@example.com',
      ''
    ]

    invalidEmails.forEach(email => {
      // Act
      const result = isValidEmail(email)

      // Assert
      expect(result).toBe(false)
    })
  })

  it('should return false for null or undefined', () => {
    // Arrange & Act
    const resultNull = isValidEmail(null)
    const resultUndefined = isValidEmail(undefined)

    // Assert
    expect(resultNull).toBe(false)
    expect(resultUndefined).toBe(false)
  })
})

describe('slugify', () => {
  it('should convert text to URL-friendly slug', () => {
    // Arrange
    const text = 'Hello World'

    // Act
    const result = slugify(text)

    // Assert
    expect(result).toBe('hello-world')
  })

  it('should remove special characters', () => {
    // Arrange
    const text = 'Test & Special @Characters!'

    // Act
    const result = slugify(text)

    // Assert
    expect(result).toBe('test-special-characters')
  })

  it('should handle multiple spaces', () => {
    // Arrange
    const text = 'Multiple    Spaces    Here'

    // Act
    const result = slugify(text)

    // Assert
    expect(result).toBe('multiple-spaces-here')
  })

  it('should trim leading and trailing hyphens', () => {
    // Arrange
    const text = '  Trim me  '

    // Act
    const result = slugify(text)

    // Assert
    expect(result).not.toMatch(/^-/)
    expect(result).not.toMatch(/-$/)
  })
})

describe('calculateDiscountPrice', () => {
  it('should calculate 10% discount correctly', () => {
    // Arrange
    const originalPrice = 100
    const discountPercentage = 10

    // Act
    const result = calculateDiscountPrice(originalPrice, discountPercentage)

    // Assert
    expect(result).toBe(90)
  })

  it('should calculate 50% discount correctly', () => {
    // Arrange
    const originalPrice = 200
    const discountPercentage = 50

    // Act
    const result = calculateDiscountPrice(originalPrice, discountPercentage)

    // Assert
    expect(result).toBe(100)
  })

  it('should handle 0% discount', () => {
    // Arrange
    const originalPrice = 150
    const discountPercentage = 0

    // Act
    const result = calculateDiscountPrice(originalPrice, discountPercentage)

    // Assert
    expect(result).toBe(150)
  })

  it('should handle decimal prices and percentages', () => {
    // Arrange
    const originalPrice = 19.99
    const discountPercentage = 15

    // Act
    const result = calculateDiscountPrice(originalPrice, discountPercentage)

    // Assert
    expect(result).toBeCloseTo(16.99, 2)
  })
})

describe('getStockStatus', () => {
  it('should return "Nicht verfügbar" for zero stock', () => {
    // Arrange
    const stock = 0

    // Act
    const result = getStockStatus(stock)

    // Assert
    expect(result).toBe('Nicht verfügbar')
  })

  it('should return "Wenige verfügbar" for low stock', () => {
    // Arrange
    const stock = 5 // Less than LOW_STOCK_THRESHOLD (10)

    // Act
    const result = getStockStatus(stock)

    // Assert
    expect(result).toBe('Wenige verfügbar')
  })

  it('should return "Auf Lager" for normal stock', () => {
    // Arrange
    const stock = 50

    // Act
    const result = getStockStatus(stock)

    // Assert
    expect(result).toBe('Auf Lager')
  })
})

describe('getStockClass', () => {
  it('should return "out-of-stock" for zero stock', () => {
    // Arrange
    const stock = 0

    // Act
    const result = getStockClass(stock)

    // Assert
    expect(result).toBe('out-of-stock')
  })

  it('should return "low-stock" for low stock', () => {
    // Arrange
    const stock = 3

    // Act
    const result = getStockClass(stock)

    // Assert
    expect(result).toBe('low-stock')
  })

  it('should return "in-stock" for normal stock', () => {
    // Arrange
    const stock = 100

    // Act
    const result = getStockClass(stock)

    // Assert
    expect(result).toBe('in-stock')
  })
})

describe('deepClone', () => {
  it('should create independent copy of object', () => {
    // Arrange
    const original = { name: 'Product', price: 99, tags: ['sale', 'new'] }

    // Act
    const cloned = deepClone(original)
    cloned.price = 150
    cloned.tags.push('featured')

    // Assert
    expect(cloned.price).toBe(150)
    expect(original.price).toBe(99) // Original unchanged
    expect(cloned.tags).toHaveLength(3)
    expect(original.tags).toHaveLength(2) // Original unchanged
  })

  it('should clone nested objects', () => {
    // Arrange
    const original = {
      product: {
        details: {
          name: 'Test',
          specs: { weight: 100 }
        }
      }
    }

    // Act
    const cloned = deepClone(original)
    cloned.product.details.specs.weight = 200

    // Assert
    expect(cloned.product.details.specs.weight).toBe(200)
    expect(original.product.details.specs.weight).toBe(100)
  })
})
