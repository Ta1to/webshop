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
import { db } from './config'
import { Offer } from '../models/Offers'

const COLLECTION_NAME = 'offers'

/**
 * Get all offers
 */
export const getAllOffers = async () => {
  try {
    const offersRef = collection(db, COLLECTION_NAME)
    const q = query(offersRef, orderBy('createdAt', 'desc'))
    const snapshot = await getDocs(q)
    
    return snapshot.docs.map(doc => Offer.fromFirestore(doc))
  } catch (error) {
    console.error('Error fetching offers:', error)
    throw error
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
    console.error('Error fetching active offers:', error)
    throw error
  }
}

/**
 * Get offer by ID
 */
export const getOfferById = async (offerId) => {
  try {
    const offerRef = doc(db, COLLECTION_NAME, offerId)
    const offerDoc = await getDoc(offerRef)
    
    if (!offerDoc.exists()) {
      throw new Error('Offer not found')
    }
    
    return Offer.fromFirestore(offerDoc)
  } catch (error) {
    console.error('Error fetching offer:', error)
    throw error
  }
}

/**
 * Get offer by product ID
 */
export const getOfferByProductId = async (productId) => {
  try {
    const offersRef = collection(db, COLLECTION_NAME)
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
    console.error('Error fetching offer by product ID:', error)
    throw error
  }
}

/**
 * Create a new offer
 */
export const createOffer = async (offerData) => {
  try {
    const offer = new Offer({
      ...offerData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
    
    const offersRef = collection(db, COLLECTION_NAME)
    const docRef = await addDoc(offersRef, offer.toFirestore())
    
    return {
      id: docRef.id,
      ...offerData
    }
  } catch (error) {
    console.error('Error creating offer:', error)
    throw error
  }
}

/**
 * Update an existing offer
 */
export const updateOffer = async (offerId, offerData) => {
  try {
    const offerRef = doc(db, COLLECTION_NAME, offerId)
    
    const updateData = {
      ...offerData,
      updatedAt: serverTimestamp()
    }
    
    await updateDoc(offerRef, updateData)
    
    return {
      id: offerId,
      ...offerData
    }
  } catch (error) {
    console.error('Error updating offer:', error)
    throw error
  }
}

/**
 * Delete an offer
 */
export const deleteOffer = async (offerId) => {
  try {
    const offerRef = doc(db, COLLECTION_NAME, offerId)
    await deleteDoc(offerRef)
  } catch (error) {
    console.error('Error deleting offer:', error)
    throw error
  }
}

/**
 * Calculate discounted price
 */
export const calculateDiscountedPrice = (originalPrice, discountPercentage) => {
  if (!discountPercentage || discountPercentage <= 0) {
    return originalPrice
  }
  
  const discount = (originalPrice * discountPercentage) / 100
  return Math.max(0, originalPrice - discount)
}

/**
 * Get products with offers
 */
export const getProductsWithOffers = async (products) => {
  try {
    const offers = await getActiveOffers()
    
    return products.map(product => {
      const offer = offers.find(o => o.productId === product.id)
      
      if (offer) {
        return {
          ...product,
          offer,
          originalPrice: product.price,
          price: calculateDiscountedPrice(product.price, offer.discountPercentage)
        }
      }
      
      return product
    })
  } catch (error) {
    console.error('Error getting products with offers:', error)
    return products
  }
}
