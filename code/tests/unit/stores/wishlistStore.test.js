import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock wishlist service
vi.mock('@/services/business/wishlist', () => ({
  getWishlistItems: vi.fn(),
  getWishlistItemCount: vi.fn()
}))

import {
  updateWishlistCount,
  updateWishlistItems,
  useWishlistItemCount,
  useWishlistItems,
  initWishlistStore
} from '@/stores/wishlistStore'
import { getWishlistItems, getWishlistItemCount } from '@/services/business/wishlist'

// Mock wishlist data
const mockWishlistItems = [
  {
    productId: '1',
    addedAt: '2026-02-01T10:00:00.000Z',
    name: 'Wishlist Product 1',
    price: 49.99,
    imageUrl: '/wishlist1.jpg',
    stock: 10
  },
  {
    productId: '2',
    addedAt: '2026-02-10T15:30:00.000Z',
    name: 'Wishlist Product 2',
    price: 99.99,
    imageUrl: '/wishlist2.jpg',
    stock: 5
  },
  {
    productId: '3',
    addedAt: '2026-02-14T08:00:00.000Z',
    name: 'Wishlist Product 3',
    price: 29.99,
    imageUrl: '/wishlist3.jpg',
    stock: 0
  }
]

beforeEach(() => {
  // Reset mocks before each test
  vi.clearAllMocks()
  
  // Setup default mock responses
  getWishlistItems.mockResolvedValue(mockWishlistItems)
  getWishlistItemCount.mockResolvedValue(3)
})

describe('updateWishlistCount', () => {
  it('should update wishlist item count', async () => {
    // Arrange
    getWishlistItemCount.mockResolvedValue(7)

    // Act
    await updateWishlistCount()
    const wishlistCount = useWishlistItemCount()

    // Assert
    expect(getWishlistItemCount).toHaveBeenCalled()
    expect(wishlistCount.value).toBe(7)
  })

  it('should handle zero items in wishlist', async () => {
    // Arrange
    getWishlistItemCount.mockResolvedValue(0)

    // Act
    await updateWishlistCount()
    const wishlistCount = useWishlistItemCount()

    // Assert
    expect(wishlistCount.value).toBe(0)
  })

  it('should call wishlist service correctly', async () => {
    // Arrange & Act
    await updateWishlistCount()

    // Assert
    expect(getWishlistItemCount).toHaveBeenCalledTimes(1)
  })
})

describe('updateWishlistItems', () => {
  it('should update wishlist items and count', async () => {
    // Arrange
    getWishlistItems.mockResolvedValue(mockWishlistItems)
    getWishlistItemCount.mockResolvedValue(3)

    // Act
    await updateWishlistItems()
    const items = useWishlistItems()
    const count = useWishlistItemCount()

    // Assert
    expect(getWishlistItems).toHaveBeenCalled()
    expect(items.value).toEqual(mockWishlistItems)
    expect(count.value).toBe(3)
  })

  it('should handle empty wishlist', async () => {
    // Arrange
    getWishlistItems.mockResolvedValue([])
    getWishlistItemCount.mockResolvedValue(0)

    // Act
    await updateWishlistItems()
    const items = useWishlistItems()
    const count = useWishlistItemCount()

    // Assert
    expect(items.value).toEqual([])
    expect(count.value).toBe(0)
  })

  it('should update both items and count together', async () => {
    // Arrange
    const newItems = [
      { 
        productId: '10', 
        addedAt: new Date().toISOString(),
        name: 'New Wishlist Item', 
        price: 79.99,
        stock: 15
      }
    ]
    getWishlistItems.mockResolvedValue(newItems)
    getWishlistItemCount.mockResolvedValue(1)

    // Act
    await updateWishlistItems()
    const items = useWishlistItems()
    const count = useWishlistItemCount()

    // Assert
    expect(items.value).toHaveLength(1)
    expect(items.value[0].name).toBe('New Wishlist Item')
    expect(count.value).toBe(1)
  })

  it('should handle items with different stock levels', async () => {
    // Arrange
    const itemsWithVariedStock = [
      { productId: '1', name: 'In Stock', stock: 100 },
      { productId: '2', name: 'Low Stock', stock: 2 },
      { productId: '3', name: 'Out of Stock', stock: 0 }
    ]
    getWishlistItems.mockResolvedValue(itemsWithVariedStock)

    // Act
    await updateWishlistItems()
    const items = useWishlistItems()

    // Assert
    expect(items.value).toHaveLength(3)
    expect(items.value.find(i => i.productId === '1').stock).toBe(100)
    expect(items.value.find(i => i.productId === '3').stock).toBe(0)
  })
})

describe('useWishlistItemCount', () => {
  it('should return reactive wishlist item count', () => {
    // Arrange & Act
    const wishlistCount = useWishlistItemCount()

    // Assert
    expect(wishlistCount).toBeDefined()
    expect(wishlistCount.value).toBeDefined()
  })

  it('should be reactive to changes', async () => {
    // Arrange
    const wishlistCount = useWishlistItemCount()
    getWishlistItemCount.mockResolvedValue(15)

    // Act
    await updateWishlistCount()

    // Assert
    expect(wishlistCount.value).toBe(15)
  })
})

describe('useWishlistItems', () => {
  it('should return reactive wishlist items array', () => {
    // Arrange & Act
    const items = useWishlistItems()

    // Assert
    expect(items).toBeDefined()
    expect(Array.isArray(items.value)).toBe(true)
  })

  it('should be reactive to changes', async () => {
    // Arrange
    const items = useWishlistItems()
    const newItems = [
      { productId: '99', name: 'Special Item', price: 199.99, stock: 1 }
    ]
    getWishlistItems.mockResolvedValue(newItems)

    // Act
    await updateWishlistItems()

    // Assert
    expect(items.value).toEqual(newItems)
    expect(items.value).toHaveLength(1)
  })

  it('should preserve item properties', async () => {
    // Arrange
    const items = useWishlistItems()
    getWishlistItems.mockResolvedValue(mockWishlistItems)

    // Act
    await updateWishlistItems()

    // Assert
    expect(items.value[0]).toHaveProperty('productId')
    expect(items.value[0]).toHaveProperty('name')
    expect(items.value[0]).toHaveProperty('price')
    expect(items.value[0]).toHaveProperty('imageUrl')
    expect(items.value[0]).toHaveProperty('stock')
  })
})

describe('initWishlistStore', () => {
  it('should initialize wishlist store with items and count', async () => {
    // Arrange
    getWishlistItems.mockResolvedValue(mockWishlistItems)
    getWishlistItemCount.mockResolvedValue(3)

    // Act
    await initWishlistStore()
    const items = useWishlistItems()
    const count = useWishlistItemCount()

    // Assert
    expect(getWishlistItems).toHaveBeenCalled()
    expect(getWishlistItemCount).toHaveBeenCalled()
    expect(items.value).toEqual(mockWishlistItems)
    expect(count.value).toBe(3)
  })

  it('should handle initialization errors gracefully', async () => {
    // Arrange
    getWishlistItems.mockRejectedValue(new Error('Failed to load wishlist'))
    getWishlistItemCount.mockResolvedValue(0)

    // Act & Assert - should propagate error
    await expect(initWishlistStore()).rejects.toThrow('Failed to load wishlist')
  })

  it('should initialize empty wishlist', async () => {
    // Arrange
    getWishlistItems.mockResolvedValue([])
    getWishlistItemCount.mockResolvedValue(0)

    // Act
    await initWishlistStore()
    const items = useWishlistItems()
    const count = useWishlistItemCount()

    // Assert
    expect(items.value).toEqual([])
    expect(count.value).toBe(0)
  })
})

describe('Wishlist Store Integration', () => {
  it('should reflect wishlist updates across all composables', async () => {
    // Arrange
    const items = useWishlistItems()
    const count = useWishlistItemCount()

    // Act - Initial load
    getWishlistItems.mockResolvedValue(mockWishlistItems)
    getWishlistItemCount.mockResolvedValue(3)
    await updateWishlistItems()

    // Assert - Initial state
    expect(items.value).toHaveLength(3)
    expect(count.value).toBe(3)

    // Act - Add item to wishlist
    const updatedItems = [...mockWishlistItems, { 
      productId: '4',
      addedAt: new Date().toISOString(),
      name: 'New Wishlist Item',
      price: 39.99,
      stock: 20
    }]
    getWishlistItems.mockResolvedValue(updatedItems)
    getWishlistItemCount.mockResolvedValue(4)
    await updateWishlistItems()

    // Assert - Updated state
    expect(items.value).toHaveLength(4)
    expect(count.value).toBe(4)
  })

  it('should handle item removal from wishlist', async () => {
    // Arrange
    const items = useWishlistItems()
    const count = useWishlistItemCount()

    // Act - Initial state with 3 items
    getWishlistItems.mockResolvedValue(mockWishlistItems)
    getWishlistItemCount.mockResolvedValue(3)
    await updateWishlistItems()

    // Assert - Initial state
    expect(items.value).toHaveLength(3)

    // Act - Remove one item
    const remainingItems = mockWishlistItems.slice(0, 2)
    getWishlistItems.mockResolvedValue(remainingItems)
    getWishlistItemCount.mockResolvedValue(2)
    await updateWishlistItems()

    // Assert - After removal
    expect(items.value).toHaveLength(2)
    expect(count.value).toBe(2)
  })

  it('should handle multiple rapid updates', async () => {
    // Arrange
    const items = useWishlistItems()
    
    // Act - Multiple rapid updates
    getWishlistItems.mockResolvedValue([{ productId: '1', name: 'Item 1' }])
    const update1 = updateWishlistItems()
    
    getWishlistItems.mockResolvedValue([
      { productId: '1', name: 'Item 1' },
      { productId: '2', name: 'Item 2' }
    ])
    const update2 = updateWishlistItems()
    
    getWishlistItems.mockResolvedValue([
      { productId: '1', name: 'Item 1' },
      { productId: '2', name: 'Item 2' },
      { productId: '3', name: 'Item 3' }
    ])
    const update3 = updateWishlistItems()

    await Promise.all([update1, update2, update3])

    // Assert - Should have the latest state
    expect(items.value).toHaveLength(3)
    expect(items.value[2].name).toBe('Item 3')
  })

  it('should maintain separate state from cart store', async () => {
    // Arrange
    const wishlistItems = useWishlistItems()
    const wishlistCount = useWishlistItemCount()

    // Act
    getWishlistItems.mockResolvedValue(mockWishlistItems)
    getWishlistItemCount.mockResolvedValue(3)
    await updateWishlistItems()

    // Assert - Wishlist should have its own independent state
    expect(wishlistItems.value).toHaveLength(3)
    expect(wishlistCount.value).toBe(3)
    expect(wishlistItems.value[0]).toHaveProperty('productId')
  })
})
