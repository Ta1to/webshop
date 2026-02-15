/**
 * Offers Service
 * Handles all offer-related operations with Firestore
 */

import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  orderBy,
  serverTimestamp 
} from 'firebase/firestore'
import { db } from '../firebase/config'
import { Offer } from '../../models/Offers'
import { errorHandler } from '../utils/errorHandler'
import { COLLECTIONS } from '../../constants'
import { calculateDiscountPrice } from '../../utils'

/**
 * Get all offers
 */
export const getAllOffers = async () => {
  try {
    const offersRef = collection(db, COLLECTIONS.OFFERS)
    const q = query(offersRef, orderBy('createdAt', 'desc'))
    const snapshot = await getDocs(q)
    
    return snapshot.docs.map(doc => Offer.fromFirestore(doc))
  } catch (error) {
    errorHandler.error('Offers could not be loaded', error)
    return []
  }
}

/**
 * Get active offers
 */
export const getActiveOffers = async () => {
  try {
    const offers = await getAllOffers()
    const now = new Date()
    
    return offers.filter(offer => {
      const startDate = offer.startDate ? new Date(offer.startDate) : null
      const endDate = offer.endDate ? new Date(offer.endDate) : null
      
      const isStarted = !startDate || startDate <= now
      const isNotEnded = !endDate || endDate >= now
      
      return isStarted && isNotEnded
    })
  } catch (error) {
    errorHandler.error('Active offers could not be loaded', error)
    return []
  }
}

/**
 * Get offer by ID
 */
export const getOfferById = async (offerId) => {
  try {
    // Input validation
    if (!offerId || typeof offerId !== 'string') {
      throw new Error('Invalid offer ID')
    }
    
    const offerRef = doc(db, COLLECTIONS.OFFERS, offerId)
    const offerDoc = await getDoc(offerRef)
    
    if (!offerDoc.exists()) {
      return null
    }
    
    return Offer.fromFirestore(offerDoc)
  } catch (error) {
    errorHandler.error('Offer could not be loaded', error)
    return null
  }
}

/**
 * Get offer by product ID
 */
export const getOfferByProductId = async (productId) => {
  try {
    // Input validation
    if (!productId || typeof productId !== 'string') {
      return null
    }
    
    const offersRef = collection(db, COLLECTIONS.OFFERS)
    const q = query(offersRef, where('productId', '==', productId))
    const snapshot = await getDocs(q)
    
    if (snapshot.empty) {
      return null
    }
    
    // Return the first active offer for this product
    const offers = snapshot.docs.map(doc => Offer.fromFirestore(doc))
    const now = new Date()
    
    return offers.find(offer => {
      const startDate = offer.startDate ? new Date(offer.startDate) : null
      const endDate = offer.endDate ? new Date(offer.endDate) : null
      
      const isStarted = !startDate || startDate <= now
      const isNotEnded = !endDate || endDate >= now
      
      return isStarted && isNotEnded
    }) || null
  } catch (error) {
    errorHandler.warn('Offer for product could not be loaded', error, { productId })
    return null
  }
}

/**
 * Create a new offer
 */
export const createOffer = async (offerData) => {
  try {
    // Input validation
    if (!offerData || typeof offerData !== 'object') {
      throw new Error('Invalid offer data')
    }
    
    if (!offerData.productId) {
      throw new Error('Product ID is required')
    }
    
    const offer = new Offer({
      ...offerData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
    
    const offersRef = collection(db, COLLECTIONS.OFFERS)
    const docRef = await addDoc(offersRef, offer.toFirestore())
    
    return {
      success: true,
      id: docRef.id,
      ...offerData
    }
  } catch (error) {
    errorHandler.error('Offer could not be created', error)
    return { success: false, error: error.message }
  }
}

/**
 * Update an existing offer
 */
export const updateOffer = async (offerId, offerData) => {
  try {
    // Input validation
    if (!offerId || typeof offerId !== 'string') {
      throw new Error('Invalid offer ID')
    }
    
    if (!offerData || typeof offerData !== 'object') {
      throw new Error('Invalid offer data')
    }
    
    const offerRef = doc(db, COLLECTIONS.OFFERS, offerId)
    
    const updateData = {
      ...offerData,
      updatedAt: serverTimestamp()
    }
    
    await updateDoc(offerRef, updateData)
    
    return {
      success: true,
      id: offerId,
      ...offerData
    }
  } catch (error) {
    errorHandler.error('Offer could not be updated', error)
    return { success: false, error: error.message }
  }
}

/**
 * Delete an offer
 */
export const deleteOffer = async (offerId) => {
  try {
    // Input validation
    if (!offerId || typeof offerId !== 'string') {
      throw new Error('Invalid offer ID')
    }
    
    const offerRef = doc(db, COLLECTIONS.OFFERS, offerId)
    await deleteDoc(offerRef)
    
    return { success: true }
  } catch (error) {
    errorHandler.error('Offer could not be deleted', error)
    return { success: false, error: error.message }
  }
}

/**
 * Get products with offers
 */
export const getProductsWithOffers = async (products) => {
  try {
    if (!Array.isArray(products)) {
      return []
    }
    
    const offers = await getActiveOffers()
    
    return products.map(product => {
      const offer = offers.find(o => o.productId === product.id)
      
      if (offer) {
        return {
          ...product,
          offer,
          originalPrice: product.price,
          price: calculateDiscountPrice(product.price, offer.discountPercentage)
        }
      }
      
      return product
    })
  } catch (error) {
    errorHandler.error('Products with offers could not be loaded', error)
    return products || []
  }
}
