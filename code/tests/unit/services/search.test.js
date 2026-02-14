/**
 * Unit Tests for Search Service
 * Following the AAA (Arrange-Act-Assert) Pattern
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the dependencies before importing the module
vi.mock('@/services/db', () => ({
  getAllDocuments: vi.fn()
}))

vi.mock('@/services/errorHandler', () => ({
  errorHandler: {
    error: vi.fn(),
    warn: vi.fn()
  }
}))

import { searchProducts, getSearchSuggestions } from '@/services/search'
import { getAllDocuments } from '@/services/db'

// Mock products data
const mockProducts = [
  {
    id: '1',
    name: 'Gaming Laptop',
    description: 'High performance laptop for gaming',
    category: 'Electronics',
    tags: ['gaming', 'computer', 'laptop'],
    price: 1299.99,
    stock: 10,
    featured: true,
    imageUrl: '/laptop.jpg'
  },
  {
    id: '2',
    name: 'Wireless Mouse',
    description: 'Ergonomic wireless mouse',
    category: 'Accessories',
    tags: ['mouse', 'wireless', 'accessories'],
    price: 29.99,
    stock: 50,
    featured: false,
    imageUrl: '/mouse.jpg'
  },
  {
    id: '3',
    name: 'Gaming Mouse',
    description: 'RGB gaming mouse with high DPI',
    category: 'Accessories',
    tags: ['gaming', 'mouse', 'rgb'],
    price: 59.99,
    stock: 0,
    featured: false,
    imageUrl: '/gaming-mouse.jpg'
  },
  {
    id: '4',
    name: 'Laptop Stand',
    description: 'Adjustable laptop stand',
    category: 'Accessories',
    tags: ['laptop', 'stand', 'desk'],
    price: 39.99,
    stock: 25,
    featured: false,
    imageUrl: '/stand.jpg'
  }
]

const mockCategories = [
  { id: '1', name: 'Electronics', slug: 'electronics', icon: 'laptop' },
  { id: '2', name: 'Accessories', slug: 'accessories', icon: 'mouse' }
]

beforeEach(() => {
  // Reset mocks before each test
  vi.clearAllMocks()
  
  // Setup default mock responses
  getAllDocuments.mockImplementation((collection) => {
    if (collection === 'products') {
      return Promise.resolve({ success: true, data: mockProducts })
    }
    if (collection === 'categories') {
      return Promise.resolve({ success: true, data: mockCategories })
    }
    return Promise.resolve({ success: false, data: [] })
  })
})

describe('searchProducts', () => {
  it('should return empty array for empty search query', async () => {
    // Arrange
    const searchQuery = ''

    // Act
    const result = await searchProducts(searchQuery)

    // Assert
    expect(result).toEqual([])
  })

  it('should find products by exact name match', async () => {
    // Arrange
    const searchQuery = 'Gaming Laptop'

    // Act
    const result = await searchProducts(searchQuery)

    // Assert
    expect(result.length).toBeGreaterThan(0)
    expect(result[0].name).toBe('Gaming Laptop')
    expect(result[0].relevanceScore).toBeGreaterThan(0)
  })

  it('should find products by partial name match', async () => {
    // Arrange
    const searchQuery = 'laptop'

    // Act
    const result = await searchProducts(searchQuery)

    // Assert
    expect(result.length).toBeGreaterThan(0)
    const productNames = result.map(p => p.name)
    expect(productNames).toContain('Gaming Laptop')
    expect(productNames).toContain('Laptop Stand')
  })

  it('should find products by tag', async () => {
    // Arrange
    const searchQuery = 'gaming'

    // Act
    const result = await searchProducts(searchQuery)

    // Assert
    expect(result.length).toBeGreaterThan(0)
    const hasGamingTag = result.every(p => 
      p.tags && p.tags.some(tag => tag.toLowerCase().includes('gaming'))
    )
    expect(hasGamingTag).toBe(true)
  })

  it('should find products by category', async () => {
    // Arrange
    const searchQuery = 'accessories'

    // Act
    const result = await searchProducts(searchQuery)

    // Assert
    expect(result.length).toBeGreaterThan(0)
    const hasAccessories = result.some(p => p.category === 'Accessories')
    expect(hasAccessories).toBe(true)
  })

  it('should filter by category option', async () => {
    // Arrange
    const searchQuery = 'mouse'
    const options = { category: 'Accessories' }

    // Act
    const result = await searchProducts(searchQuery, options)

    // Assert
    expect(result.length).toBeGreaterThan(0)
    const allAccessories = result.every(p => p.category === 'Accessories')
    expect(allAccessories).toBe(true)
  })

  it('should filter out-of-stock products when inStock option is true', async () => {
    // Arrange
    const searchQuery = 'mouse'
    const options = { inStock: true }

    // Act
    const result = await searchProducts(searchQuery, options)

    // Assert
    const allInStock = result.every(p => p.stock > 0)
    expect(allInStock).toBe(true)
  })

  it('should limit results to maxResults', async () => {
    // Arrange
    const searchQuery = 'gaming'
    const options = { maxResults: 1 }

    // Act
    const result = await searchProducts(searchQuery, options)

    // Assert
    expect(result.length).toBeLessThanOrEqual(1)
  })

  it('should sort results by relevance score', async () => {
    // Arrange
    const searchQuery = 'laptop'

    // Act
    const result = await searchProducts(searchQuery)

    // Assert
    expect(result.length).toBeGreaterThan(1)
    // Check that scores are in descending order
    for (let i = 0; i < result.length - 1; i++) {
      expect(result[i].relevanceScore).toBeGreaterThanOrEqual(result[i + 1].relevanceScore)
    }
  })

  it('should handle case-insensitive search', async () => {
    // Arrange
    const searchQuery = 'LAPTOP'

    // Act
    const result = await searchProducts(searchQuery)

    // Assert
    expect(result.length).toBeGreaterThan(0)
    expect(result.some(p => p.name.toLowerCase().includes('laptop'))).toBe(true)
  })

  it('should boost featured products in relevance score', async () => {
    // Arrange
    const searchQuery = 'gaming laptop'

    // Act
    const result = await searchProducts(searchQuery)

    // Assert
    const featuredProduct = result.find(p => p.featured)
    expect(featuredProduct).toBeDefined()
    // Featured boost should be applied
    expect(featuredProduct.relevanceScore).toBeGreaterThan(0)
  })
})

describe('getSearchSuggestions', () => {
  it('should return empty suggestions for query less than 2 characters', async () => {
    // Arrange
    const searchQuery = 'a'

    // Act
    const result = await getSearchSuggestions(searchQuery)

    // Assert
    expect(result.products).toEqual([])
    expect(result.categories).toEqual([])
    expect(result.tags).toEqual([])
  })

  it('should return product suggestions', async () => {
    // Arrange
    const searchQuery = 'laptop'

    // Act
    const result = await getSearchSuggestions(searchQuery)

    // Assert
    expect(result.products.length).toBeGreaterThan(0)
    expect(result.products[0]).toHaveProperty('type', 'product')
    expect(result.products[0]).toHaveProperty('text')
    expect(result.products[0]).toHaveProperty('id')
    expect(result.products[0]).toHaveProperty('price')
  })

  it('should return category suggestions', async () => {
    // Arrange
    const searchQuery = 'acc'

    // Act
    const result = await getSearchSuggestions(searchQuery)

    // Assert
    expect(result.categories.length).toBeGreaterThan(0)
    expect(result.categories[0]).toHaveProperty('type', 'category')
    expect(result.categories[0]).toHaveProperty('text')
    expect(result.categories[0]).toHaveProperty('slug')
  })

  it('should return tag suggestions', async () => {
    // Arrange
    const searchQuery = 'gaming'

    // Act
    const result = await getSearchSuggestions(searchQuery)

    // Assert
    expect(result.tags.length).toBeGreaterThan(0)
    expect(result.tags[0]).toHaveProperty('type', 'tag')
    expect(result.tags[0]).toHaveProperty('text')
  })

  it('should limit product suggestions to 5', async () => {
    // Arrange
    const searchQuery = 'a'
    // Override mock to return many products
    getAllDocuments.mockImplementation((collection) => {
      if (collection === 'products') {
        const manyProducts = Array.from({ length: 20 }, (_, i) => ({
          ...mockProducts[0],
          id: `${i}`,
          name: `Product A${i}`
        }))
        return Promise.resolve({ success: true, data: manyProducts })
      }
      return Promise.resolve({ success: true, data: mockCategories })
    })

    // Act
    const result = await getSearchSuggestions(searchQuery, 10)

    // Assert
    expect(result.products.length).toBeLessThanOrEqual(5)
  })

  it('should return total suggestions count', async () => {
    // Arrange
    const searchQuery = 'gaming'

    // Act
    const result = await getSearchSuggestions(searchQuery)

    // Assert
    expect(result).toHaveProperty('totalSuggestions')
    expect(result.totalSuggestions).toBe(
      result.products.length + result.categories.length + result.tags.length
    )
  })
})
