/**
 * Utility Functions
 * Common helper functions used across the application
 */

import { FORMATS, UI, PRODUCT } from '../constants'

/**
 * Format price in Euro
 * @param {number} price - Price value
 * @param {string} locale - Locale (default: de-DE)
 * @param {string} currency - Currency (default: EUR)
 * @returns {string} Formatted price
 */
export function formatPrice(price, locale = FORMATS.DATE_LOCALE, currency = FORMATS.CURRENCY) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency
  }).format(price)
}

/**
 * Format date
 * @param {Date|string|Timestamp} date - Date to format
 * @param {string} locale - Locale (default: de-DE)
 * @returns {string} Formatted date
 */
export function formatDate(date, locale = FORMATS.DATE_LOCALE) {
  if (!date) return 'Unbekannt'
  
  const dateObj = date.toDate ? date.toDate() : new Date(date)
  return dateObj.toLocaleDateString(locale, FORMATS.DATE_OPTIONS)
}

/**
 * Format date and time
 * @param {Date|string|Timestamp} date - Date to format
 * @param {string} locale - Locale (default: de-DE)
 * @returns {string} Formatted date and time
 */
export function formatDateTime(date, locale = FORMATS.DATE_LOCALE) {
  if (!date) return 'Unbekannt'
  
  const dateObj = date.toDate ? date.toDate() : new Date(date)
  return dateObj.toLocaleString(locale, {
    ...FORMATS.DATE_OPTIONS,
    ...FORMATS.TIME_OPTIONS
  })
}

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @param {string} suffix - Suffix to add (default: '...')
 * @returns {string} Truncated text
 */
export function truncateText(text, maxLength, suffix = UI.TRUNCATE_SUFFIX) {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength).trim() + suffix
}

/**
 * Check if product is new (within NEW_BADGE_DAYS)
 * @param {Date|string|Timestamp} createdAt - Product creation date
 * @returns {boolean}
 */
export function isProductNew(createdAt) {
  if (!createdAt) return false
  
  const now = new Date()
  const thresholdDate = new Date(now.getTime() - PRODUCT.NEW_BADGE_DAYS * 24 * 60 * 60 * 1000)
  const createdDate = createdAt.toDate ? createdAt.toDate() : new Date(createdAt)
  
  return createdDate >= thresholdDate
}

/**
 * Validate email address
 * @param {string} email - Email to validate
 * @returns {boolean}
 */
export function isValidEmail(email) {
  if (!email) return false
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Generate slug from text
 * @param {string} text - Text to convert
 * @returns {string} URL-friendly slug
 */
export function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')       // Replace spaces with -
    .replace(/[^\w\-]+/g, '')   // Remove all non-word chars
    .replace(/\-\-+/g, '-')     // Replace multiple - with single -
    .replace(/^-+/, '')         // Trim - from start of text
    .replace(/-+$/, '')         // Trim - from end of text
}

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in ms
 * @returns {Function} Debounced function
 */
export function debounce(func, wait = UI.DEBOUNCE_DELAY) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Deep clone an object
 * @param {any} obj - Object to clone
 * @returns {any} Cloned object
 */
export function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj))
}

/**
 * Calculate discount price
 * @param {number} originalPrice - Original price
 * @param {number} discountPercentage - Discount percentage
 * @returns {number} Final price after discount
 */
export function calculateDiscountPrice(originalPrice, discountPercentage) {
  const discount = originalPrice * (discountPercentage / 100)
  return originalPrice - discount
}

/**
 * Get stock status text
 * @param {number} stock - Stock quantity
 * @returns {string} Status text
 */
export function getStockStatus(stock) {
  if (stock === 0) return 'Nicht verfügbar'
  if (stock < PRODUCT.LOW_STOCK_THRESHOLD) return 'Wenige verfügbar'
  return 'Auf Lager'
}

/**
 * Get stock CSS class
 * @param {number} stock - Stock quantity
 * @returns {string} CSS class name
 */
export function getStockClass(stock) {
  if (stock === 0) return 'out-of-stock'
  if (stock < PRODUCT.LOW_STOCK_THRESHOLD) return 'low-stock'
  return 'in-stock'
}
