/**
 * Product Model
 */
import { PRODUCT } from '../constants'

export class Product {
  constructor(data = {}) {
    this.id = data.id || null
    this.name = data.name || ''
    this.description = data.description || ''
    this.price = data.price || 0
    this.category = data.category || ''
    this.imageUrl = data.imageUrl || ''
    this.stock = data.stock || 0
    this.featured = data.featured || false
    this.tags = data.tags || []
    this.createdAt = data.createdAt || null
    this.updatedAt = data.updatedAt || null
  }

  /**
   * Create Product from Firestore document
   */
  static fromFirestore(doc) {
    const data = doc.data()
    return new Product({
      id: doc.id,
      ...data
    })
  }

  /**
   * Convert to Firestore document data
   */
  toFirestore() {
    return {
      name: this.name,
      description: this.description,
      price: this.price,
      category: this.category,
      imageUrl: this.imageUrl,
      stock: this.stock,
      featured: this.featured,
      tags: this.tags,
      updatedAt: this.updatedAt
    }
  }

  /**
   * Get formatted price
   */
  getFormattedPrice(locale = 'de-DE', currency = 'EUR') {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency
    }).format(this.price)
  }

  /**
   * Check if product is in stock
   */
  isInStock() {
    return this.stock > 0
  }

  /**
   * Check if product is low stock
   */
  isLowStock() {
    return this.stock > 0 && this.stock < PRODUCT.LOW_STOCK_THRESHOLD
  }

  /**
   * Validate product data
   */
  validate() {
    const errors = []
    
    if (!this.name || this.name.length < 3) {
      errors.push('Product name must be at least 3 characters')
    }
    
    if (this.price < 0) {
      errors.push('Price must be positive')
    }
    
    if (this.stock < 0) {
      errors.push('Stock must be positive')
    }
    
    if (!this.category) {
      errors.push('Category is required')
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }
}

/**
 * Product categories enum
 */
export const ProductCategory = {
  ELECTRONICS: 'electronics',
  CLOTHING: 'clothing',
  BOOKS: 'books',
  HOME: 'home',
  SPORTS: 'sports',
  TOYS: 'toys',
  OTHER: 'other'
}
