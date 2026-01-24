import { getAllDocuments } from './db'
import { errorHandler } from './errorHandler'
import { COLLECTIONS } from '../constants'

/**
 * Search Service
 * Provides search functionality for products with suggestions and autocomplete
 */

// Cache configuration
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

// Relevance scoring weights
const RELEVANCE_SCORES = {
  EXACT_NAME_MATCH: 100,
  NAME_STARTS_WITH: 50,
  NAME_CONTAINS: 30,
  EXACT_TAG_MATCH: 40,
  EXACT_CATEGORY_MATCH: 25,
  TAG_CONTAINS: 15,
  CATEGORY_CONTAINS: 10,
  DESCRIPTION_CONTAINS: 10,
  FEATURED_BOOST: 5
}

let productsCache = null
let categoriesCache = null
let lastCacheUpdate = null

/**
 * Load and cache products and categories from Firestore
 */
const loadSearchData = async (forceRefresh = false) => {
  const now = Date.now()
  
  if (!forceRefresh && productsCache && categoriesCache && lastCacheUpdate && (now - lastCacheUpdate < CACHE_DURATION)) {
    return { products: productsCache, categories: categoriesCache }
  }

  try {
    const [productsResult, categoriesResult] = await Promise.all([
      getAllDocuments(COLLECTIONS.PRODUCTS),
      getAllDocuments(COLLECTIONS.CATEGORIES)
    ])

    if (productsResult.success) {
      productsCache = productsResult.data
    } else {
      productsCache = []
    }

    if (categoriesResult.success) {
      categoriesCache = categoriesResult.data
    } else {
      categoriesCache = []
    }

    lastCacheUpdate = now
    return { products: productsCache, categories: categoriesCache }
  } catch (error) {
    errorHandler.error('Search data could not be loaded', error)
    return { products: [], categories: [] }
  }
}

/**
 * Normalize text for search comparison
 */
const normalizeText = (text) => {
  if (!text) return ''
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .trim()
}

/**
 * Calculate relevance score for a product
 */
const calculateRelevance = (product, searchTerm) => {
  const term = normalizeText(searchTerm)
  const name = normalizeText(product.name)
  const description = normalizeText(product.description)
  const tags = (product.tags || []).map(tag => normalizeText(tag))
  const category = normalizeText(product.category)

  let score = 0

  // Exact match in name (highest priority)
  if (name === term) score += RELEVANCE_SCORES.EXACT_NAME_MATCH

  // Name starts with search term
  if (name.startsWith(term)) score += RELEVANCE_SCORES.NAME_STARTS_WITH

  // Name contains search term
  if (name.includes(term)) score += RELEVANCE_SCORES.NAME_CONTAINS

  // Description contains search term
  if (description.includes(term)) score += RELEVANCE_SCORES.DESCRIPTION_CONTAINS

  // Tag matches
  tags.forEach(tag => {
    if (tag === term) score += RELEVANCE_SCORES.EXACT_TAG_MATCH
    else if (tag.includes(term)) score += RELEVANCE_SCORES.TAG_CONTAINS
  })

  // Category matches
  if (category === term) score += RELEVANCE_SCORES.EXACT_CATEGORY_MATCH
  else if (category.includes(term)) score += RELEVANCE_SCORES.CATEGORY_CONTAINS

  // Boost featured products slightly
  if (product.featured) score += RELEVANCE_SCORES.FEATURED_BOOST

  return score
}

/**
 * Search products with relevance ranking
 * @param {string} searchQuery - Search term
 * @param {object} options - Search options
 */
export const searchProducts = async (searchQuery, options = {}) => {
  const {
    maxResults = 50,
    minScore = 0,
    category = null,
    inStock = false
  } = options

  if (!searchQuery || searchQuery.trim().length < 1) {
    return []
  }

  const { products } = await loadSearchData()
  const term = normalizeText(searchQuery)

  // Filter and score products
  let results = products
    .map(product => ({
      ...product,
      relevanceScore: calculateRelevance(product, term)
    }))
    .filter(product => product.relevanceScore > minScore)

  // Apply additional filters
  if (category) {
    results = results.filter(p => normalizeText(p.category) === normalizeText(category))
  }

  if (inStock) {
    results = results.filter(p => p.stock > 0)
  }

  // Sort by relevance score (highest first)
  results.sort((a, b) => b.relevanceScore - a.relevanceScore)

  // Limit results
  return results.slice(0, maxResults)
}

/**
 * Get search suggestions for autocomplete
 * @param {string} searchQuery - Partial search term
 * @param {number} maxSuggestions - Maximum number of suggestions
 */
export const getSearchSuggestions = async (searchQuery, maxSuggestions = 8) => {
  if (!searchQuery || searchQuery.trim().length < 2) {
    return {
      products: [],
      categories: [],
      tags: []
    }
  }

  const { products, categories } = await loadSearchData()
  const term = normalizeText(searchQuery)

  // Get product name suggestions
  const productSuggestions = products
    .filter(product => {
      const name = normalizeText(product.name)
      return name.includes(term)
    })
    .map(product => ({
      type: 'product',
      text: product.name,
      id: product.id,
      imageUrl: product.imageUrl,
      price: product.price,
      category: product.category
    }))
    .slice(0, 5)

  // Get category suggestions
  const categorySuggestions = categories
    .filter(category => {
      const name = normalizeText(category.name)
      return name.includes(term)
    })
    .map(category => ({
      type: 'category',
      text: category.name,
      slug: category.slug,
      icon: category.icon
    }))
    .slice(0, 3)

  // Get tag suggestions (unique tags from products)
  const allTags = new Set()
  products.forEach(product => {
    if (product.tags && Array.isArray(product.tags)) {
      product.tags.forEach(tag => {
        if (normalizeText(tag).includes(term)) {
          allTags.add(tag)
        }
      })
    }
  })

  const tagSuggestions = Array.from(allTags)
    .slice(0, 5)
    .map(tag => ({
      type: 'tag',
      text: tag
    }))

  return {
    products: productSuggestions,
    categories: categorySuggestions,
    tags: tagSuggestions,
    totalSuggestions: productSuggestions.length + categorySuggestions.length + tagSuggestions.length
  }
}

/**
 * Get popular search terms based on product data
 */
export const getPopularSearchTerms = async (limit = 10) => {
  const { products } = await loadSearchData()

  // Count tag frequencies
  const tagFrequency = {}
  products.forEach(product => {
    if (product.tags && Array.isArray(product.tags)) {
      product.tags.forEach(tag => {
        tagFrequency[tag] = (tagFrequency[tag] || 0) + 1
      })
    }
  })

  // Sort by frequency and return top terms
  return Object.entries(tagFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([term, count]) => ({ term, count }))
}

/**
 * Refresh search cache
 */
export const refreshSearchCache = async () => {
  return await loadSearchData(true)
}
