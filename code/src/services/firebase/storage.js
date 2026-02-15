import { storage } from './config'
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { errorHandler } from '../utils/errorHandler'
import { VALIDATION, UI } from '../../constants'

/**
 * Uploads an image file to Firebase Storage
 * @param {File} file - The image file to upload
 * @param {string} folder - The folder path in storage (default: 'products')
 * @returns {Promise<string>} The download URL of the uploaded image
 */
export async function uploadImage(file, folder = 'products') {
  try {
    // Validate file type
    if (!VALIDATION.ALLOWED_IMAGE_TYPES.includes(file.type)) {
      throw new Error('Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.')
    }

    // Validate file size (max 5MB)
    if (file.size > VALIDATION.MAX_IMAGE_SIZE_BYTES) {
      throw new Error(`File is too large. Maximum: ${VALIDATION.MAX_IMAGE_SIZE_MB}MB`)
    }

    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 9)
    const extension = file.name.split('.').pop()
    const filename = `${timestamp}_${randomString}.${extension}`
    
    // Create storage reference
    const imageRef = storageRef(storage, `${folder}/${filename}`)
    
    // Upload file with metadata
    const metadata = {
      contentType: file.type,
      customMetadata: {
        originalName: file.name,
        uploadedAt: new Date().toISOString()
      }
    }
    
    const snapshot = await uploadBytes(imageRef, file, metadata)
    
    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref)
    
    return downloadURL
  } catch (error) {
    errorHandler.error('Image could not be uploaded', error)
    throw error
  }
}

/**
 * Deletes an image from Firebase Storage
 * @param {string} imageUrl - The download URL of the image to delete
 * @returns {Promise<void>}
 */
export async function deleteImage(imageUrl) {
  try {
    if (!imageUrl) return
    
    // Extract the path from the URL
    const path = decodeURIComponent(imageUrl.split('/o/')[1]?.split('?')[0])
    if (!path) return
    
    const imageRef = storageRef(storage, path)
    await deleteObject(imageRef)
  } catch (error) {
    errorHandler.warn('Image could not be deleted', error)
    // Don't throw - deletion errors shouldn't prevent other operations
  }
}

/**
 * Validates if a URL is a valid image URL
 * @param {string} url - The URL to validate
 * @returns {Promise<boolean>}
 */
export async function validateImageUrl(url) {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve(true)
    img.onerror = () => resolve(false)
    img.src = url
    
    // Timeout after configured seconds
    setTimeout(() => resolve(false), UI.IMAGE_VALIDATION_TIMEOUT)
  })
}

/**
 * Compresses an image file before upload
 * @param {File} file - The image file to compress
 * @param {number} maxWidth - Maximum width (default: 1200)
 * @param {number} quality - Compression quality 0-1 (default: 0.8)
 * @returns {Promise<File>}
 */
export async function compressImage(file, maxWidth = 1200, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      const img = new Image()
      
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height
        
        // Calculate new dimensions
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }
        
        canvas.width = width
        canvas.height = height
        
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)
        
        canvas.toBlob(
          (blob) => {
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now()
            })
            resolve(compressedFile)
          },
          file.type,
          quality
        )
      }
      
      img.onerror = () => reject(new Error('Fehler beim Laden des Bildes'))
      img.src = e.target.result
    }
    
    reader.onerror = () => reject(new Error('Fehler beim Lesen der Datei'))
    reader.readAsDataURL(file)
  })
}
