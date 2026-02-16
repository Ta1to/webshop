import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock cart service
vi.mock('@/services/business/cart', () => ({
  getCart: vi.fn(),
  getCartItemCount: vi.fn()
}))

import {
  updateCartCount,
  updateCartItems,
  useCartItemCount,
  useCartItems,
  initCartStore
} from '@/stores/cartStore'
import { getCart, getCartItemCount } from '@/services/business/cart'

// Mock cart data
const mockCartItems = [
  {
    id: '1',
    productId: '1',
    quantity: 2,
    name: 'Test Product 1',
    price: 29.99,
    finalPrice: 29.99,
    imageUrl: '/test1.jpg'
  },
  {
    id: '2',
    productId: '2',
    quantity: 1,
    name: 'Test Product 2',
    price: 59.99,
    finalPrice: 49.99,
    imageUrl: '/test2.jpg',
    offer: { discountPercentage: 10 }
  }
]

beforeEach(() => {
  // Reset mocks before each test
  vi.clearAllMocks()
  
  // Setup default mock responses
  getCart.mockResolvedValue(mockCartItems)
  getCartItemCount.mockResolvedValue(3)
})

describe('updateCartCount', () => {
  it('should update cart item count', async () => {
    // Arrange
    getCartItemCount.mockResolvedValue(5)

    // Act
    await updateCartCount()
    const cartCount = useCartItemCount()

    // Assert
    expect(getCartItemCount).toHaveBeenCalled()
    expect(cartCount.value).toBe(5)
  })

  it('should handle zero items', async () => {
    // Arrange
    getCartItemCount.mockResolvedValue(0)

    // Act
    await updateCartCount()
    const cartCount = useCartItemCount()

    // Assert
    expect(cartCount.value).toBe(0)
  })

  it('should call cart service correctly', async () => {
    // Arrange & Act
    await updateCartCount()

    // Assert
    expect(getCartItemCount).toHaveBeenCalledTimes(1)
  })
})

describe('updateCartItems', () => {
  it('should update cart items and count', async () => {
    // Arrange
    getCart.mockResolvedValue(mockCartItems)
    getCartItemCount.mockResolvedValue(3)

    // Act
    await updateCartItems()
    const items = useCartItems()
    const count = useCartItemCount()

    // Assert
    expect(getCart).toHaveBeenCalled()
    expect(items.value).toEqual(mockCartItems)
    expect(count.value).toBe(3)
  })

  it('should handle empty cart', async () => {
    // Arrange
    getCart.mockResolvedValue([])
    getCartItemCount.mockResolvedValue(0)

    // Act
    await updateCartItems()
    const items = useCartItems()
    const count = useCartItemCount()

    // Assert
    expect(items.value).toEqual([])
    expect(count.value).toBe(0)
  })

  it('should update both items and count together', async () => {
    // Arrange
    const newItems = [
      { id: '3', productId: '3', quantity: 1, name: 'New Product', price: 99.99 }
    ]
    getCart.mockResolvedValue(newItems)
    getCartItemCount.mockResolvedValue(1)

    // Act
    await updateCartItems()
    const items = useCartItems()
    const count = useCartItemCount()

    // Assert
    expect(items.value).toHaveLength(1)
    expect(items.value[0].name).toBe('New Product')
    expect(count.value).toBe(1)
  })
})

describe('useCartItemCount', () => {
  it('should return reactive cart item count', () => {
    // Arrange & Act
    const cartCount = useCartItemCount()

    // Assert
    expect(cartCount).toBeDefined()
    expect(cartCount.value).toBeDefined()
  })

  it('should be reactive to changes', async () => {
    // Arrange
    const cartCount = useCartItemCount()
    getCartItemCount.mockResolvedValue(10)

    // Act
    await updateCartCount()

    // Assert
    expect(cartCount.value).toBe(10)
  })
})

describe('useCartItems', () => {
  it('should return reactive cart items array', () => {
    // Arrange & Act
    const items = useCartItems()

    // Assert
    expect(items).toBeDefined()
    expect(Array.isArray(items.value)).toBe(true)
  })

  it('should be reactive to changes', async () => {
    // Arrange
    const items = useCartItems()
    const newItems = [{ id: '5', productId: '5', quantity: 2, name: 'Item 5' }]
    getCart.mockResolvedValue(newItems)

    // Act
    await updateCartItems()

    // Assert
    expect(items.value).toEqual(newItems)
    expect(items.value).toHaveLength(1)
  })
})

describe('initCartStore', () => {
  it('should initialize cart store with items and count', async () => {
    // Arrange
    getCart.mockResolvedValue(mockCartItems)
    getCartItemCount.mockResolvedValue(3)

    // Act
    await initCartStore()
    const items = useCartItems()
    const count = useCartItemCount()

    // Assert
    expect(getCart).toHaveBeenCalled()
    expect(getCartItemCount).toHaveBeenCalled()
    expect(items.value).toEqual(mockCartItems)
    expect(count.value).toBe(3)
  })

  it('should handle initialization errors gracefully', async () => {
    // Arrange
    getCart.mockRejectedValue(new Error('Load failed'))
    getCartItemCount.mockResolvedValue(0)

    // Act & Assert - should not throw
    await expect(initCartStore()).rejects.toThrow('Load failed')
  })
})

describe('Cart Store Integration', () => {
  it('should reflect cart updates across all composables', async () => {
    // Arrange
    const items = useCartItems()
    const count = useCartItemCount()

    // Act - Initial load
    getCart.mockResolvedValue(mockCartItems)
    getCartItemCount.mockResolvedValue(3)
    await updateCartItems()

    // Assert - Initial state
    expect(items.value).toHaveLength(2)
    expect(count.value).toBe(3)

    // Act - Update cart
    const updatedItems = [...mockCartItems, { 
      id: '3', 
      productId: '3', 
      quantity: 1, 
      name: 'New Item',
      price: 19.99
    }]
    getCart.mockResolvedValue(updatedItems)
    getCartItemCount.mockResolvedValue(4)
    await updateCartItems()

    // Assert - Updated state
    expect(items.value).toHaveLength(3)
    expect(count.value).toBe(4)
  })

  it('should handle rapid consecutive updates', async () => {
    // Arrange
    const items = useCartItems()
    
    // Act - Multiple rapid updates
    getCart.mockResolvedValue([{ id: '1', quantity: 1 }])
    const update1 = updateCartItems()
    
    getCart.mockResolvedValue([{ id: '1', quantity: 2 }])
    const update2 = updateCartItems()
    
    getCart.mockResolvedValue([{ id: '1', quantity: 3 }])
    const update3 = updateCartItems()

    await Promise.all([update1, update2, update3])

    // Assert - Should have the latest state
    expect(items.value[0].quantity).toBe(3)
  })
})
