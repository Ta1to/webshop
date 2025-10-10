/**
 * Order Model
 */
export class Order {
  constructor(data = {}) {
    this.id = data.id || null
    this.userId = data.userId || ''
    this.items = data.items || []
    this.totalAmount = data.totalAmount || 0
    this.status = data.status || OrderStatus.PENDING
    this.shippingAddress = data.shippingAddress || {}
    this.paymentMethod = data.paymentMethod || ''
    this.createdAt = data.createdAt || null
    this.updatedAt = data.updatedAt || null
  }

  /**
   * Create Order from Firestore document
   */
  static fromFirestore(doc) {
    const data = doc.data()
    return new Order({
      id: doc.id,
      ...data
    })
  }

  /**
   * Convert to Firestore document data
   */
  toFirestore() {
    return {
      userId: this.userId,
      items: this.items,
      totalAmount: this.totalAmount,
      status: this.status,
      shippingAddress: this.shippingAddress,
      paymentMethod: this.paymentMethod,
      updatedAt: this.updatedAt
    }
  }

  /**
   * Get formatted total amount
   */
  getFormattedTotal(locale = 'de-DE', currency = 'EUR') {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency
    }).format(this.totalAmount)
  }

  /**
   * Get total item count
   */
  getTotalItems() {
    return this.items.reduce((total, item) => total + item.quantity, 0)
  }

  /**
   * Check if order can be cancelled
   */
  canBeCancelled() {
    return this.status === OrderStatus.PENDING || this.status === OrderStatus.PROCESSING
  }

  /**
   * Get status color for UI
   */
  getStatusColor() {
    const colors = {
      [OrderStatus.PENDING]: 'orange',
      [OrderStatus.PROCESSING]: 'blue',
      [OrderStatus.SHIPPED]: 'purple',
      [OrderStatus.DELIVERED]: 'green',
      [OrderStatus.CANCELLED]: 'red'
    }
    return colors[this.status] || 'gray'
  }

  /**
   * Validate order data
   */
  validate() {
    const errors = []
    
    if (!this.userId) {
      errors.push('User ID is required')
    }
    
    if (!this.items || this.items.length === 0) {
      errors.push('Order must have at least one item')
    }
    
    if (this.totalAmount <= 0) {
      errors.push('Total amount must be positive')
    }
    
    if (!this.shippingAddress || !this.shippingAddress.street) {
      errors.push('Shipping address is required')
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }
}

/**
 * Order status enum
 */
export const OrderStatus = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled'
}

/**
 * Order item model
 */
export class OrderItem {
  constructor(data = {}) {
    this.productId = data.productId || ''
    this.productName = data.productName || ''
    this.quantity = data.quantity || 1
    this.price = data.price || 0
  }

  /**
   * Get subtotal for this item
   */
  getSubtotal() {
    return this.quantity * this.price
  }

  /**
   * Get formatted subtotal
   */
  getFormattedSubtotal(locale = 'de-DE', currency = 'EUR') {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency
    }).format(this.getSubtotal())
  }
}
