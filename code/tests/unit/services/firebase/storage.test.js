/**
 * Unit Tests for Firebase Storage Service
 * Following the AAA (Arrange-Act-Assert) Pattern
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  uploadImage,
  deleteImage,
  validateImageUrl,
  compressImage
} from '@/services/firebase/storage'
import { VALIDATION } from '@/constants'

// Mock Firebase Storage
vi.mock('firebase/storage', () => ({
  ref: vi.fn(),
  uploadBytes: vi.fn(),
  getDownloadURL: vi.fn(),
  deleteObject: vi.fn()
}))

// Mock Firebase Config
vi.mock('@/services/firebase/config', () => ({
  storage: {}
}))

// Mock Error Handler
vi.mock('@/services/utils/errorHandler', () => ({
  errorHandler: {
    error: vi.fn(),
    warn: vi.fn()
  }
}))

import * as firebaseStorage from 'firebase/storage'

describe('uploadImage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should successfully upload a valid image', async () => {
    // Arrange
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
    Object.defineProperty(file, 'size', { value: 1024 * 1024 }) // 1MB
    const folder = 'products'
    const downloadURL = 'https://example.com/image.jpg'

    firebaseStorage.ref.mockReturnValue({ fullPath: 'products/test.jpg' })
    firebaseStorage.uploadBytes.mockResolvedValue({ ref: { fullPath: 'products/test.jpg' } })
    firebaseStorage.getDownloadURL.mockResolvedValue(downloadURL)

    // Act
    const result = await uploadImage(file, folder)

    // Assert
    expect(result).toBe(downloadURL)
    expect(firebaseStorage.uploadBytes).toHaveBeenCalled()
    expect(firebaseStorage.getDownloadURL).toHaveBeenCalled()
  })

  it('should reject invalid file types', async () => {
    // Arrange
    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' })

    // Act & Assert
    await expect(uploadImage(file)).rejects.toThrow('Invalid file type')
  })

  it('should reject files that are too large', async () => {
    // Arrange
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
    Object.defineProperty(file, 'size', { value: 10 * 1024 * 1024 }) // 10MB

    // Act & Assert
    await expect(uploadImage(file)).rejects.toThrow('File is too large')
  })

  it('should upload to custom folder', async () => {
    // Arrange
    const file = new File(['test'], 'test.png', { type: 'image/png' })
    Object.defineProperty(file, 'size', { value: 500 * 1024 }) // 500KB
    const customFolder = 'avatars'
    const downloadURL = 'https://example.com/avatar.png'

    firebaseStorage.ref.mockReturnValue({ fullPath: 'avatars/test.png' })
    firebaseStorage.uploadBytes.mockResolvedValue({ ref: { fullPath: 'avatars/test.png' } })
    firebaseStorage.getDownloadURL.mockResolvedValue(downloadURL)

    // Act
    const result = await uploadImage(file, customFolder)

    // Assert
    expect(result).toBe(downloadURL)
  })

  it('should generate unique filenames', async () => {
    // Arrange
    const file1 = new File(['test1'], 'test.jpg', { type: 'image/jpeg' })
    const file2 = new File(['test2'], 'test.jpg', { type: 'image/jpeg' })
    Object.defineProperty(file1, 'size', { value: 1024 })
    Object.defineProperty(file2, 'size', { value: 1024 })

    let callCount = 0
    firebaseStorage.ref.mockImplementation((storage, path) => {
      callCount++
      return { fullPath: path }
    })
    firebaseStorage.uploadBytes.mockResolvedValue({ ref: {} })
    firebaseStorage.getDownloadURL.mockResolvedValue('https://example.com/image.jpg')

    // Act
    await uploadImage(file1)
    await uploadImage(file2)

    // Assert
    expect(firebaseStorage.ref).toHaveBeenCalledTimes(2)
    const calls = firebaseStorage.ref.mock.calls
    expect(calls[0][1]).not.toBe(calls[1][1]) // Different paths
  })

  it('should handle upload errors', async () => {
    // Arrange
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
    Object.defineProperty(file, 'size', { value: 1024 })
    const errorMessage = 'Upload failed'

    firebaseStorage.ref.mockReturnValue({})
    firebaseStorage.uploadBytes.mockRejectedValue(new Error(errorMessage))

    // Act & Assert
    await expect(uploadImage(file)).rejects.toThrow(errorMessage)
  })

  it('should accept WebP images', async () => {
    // Arrange
    const file = new File(['test'], 'test.webp', { type: 'image/webp' })
    Object.defineProperty(file, 'size', { value: 1024 })
    const downloadURL = 'https://example.com/image.webp'

    firebaseStorage.ref.mockReturnValue({})
    firebaseStorage.uploadBytes.mockResolvedValue({ ref: {} })
    firebaseStorage.getDownloadURL.mockResolvedValue(downloadURL)

    // Act
    const result = await uploadImage(file)

    // Assert
    expect(result).toBe(downloadURL)
  })
})

describe('deleteImage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should successfully delete an image', async () => {
    // Arrange
    const imageUrl = 'https://firebasestorage.googleapis.com/v0/b/bucket/o/products%2Ftest.jpg?alt=media'

    firebaseStorage.ref.mockReturnValue({})
    firebaseStorage.deleteObject.mockResolvedValue()

    // Act
    await deleteImage(imageUrl)

    // Assert
    expect(firebaseStorage.deleteObject).toHaveBeenCalled()
  })

  it('should handle empty URL gracefully', async () => {
    // Arrange
    const imageUrl = ''

    // Act
    await deleteImage(imageUrl)

    // Assert
    expect(firebaseStorage.deleteObject).not.toHaveBeenCalled()
  })

  it('should handle null URL gracefully', async () => {
    // Arrange
    const imageUrl = null

    // Act
    await deleteImage(imageUrl)

    // Assert
    expect(firebaseStorage.deleteObject).not.toHaveBeenCalled()
  })

  it('should handle invalid URLs gracefully', async () => {
    // Arrange
    const imageUrl = 'invalid-url-without-o-parameter'

    firebaseStorage.ref.mockReturnValue({})

    // Act
    await deleteImage(imageUrl)

    // Assert
    // Should not throw even with invalid URL - path extraction returns undefined
    // deleteObject should not be called with undefined path
  })

  it('should not throw on delete errors', async () => {
    // Arrange
    const imageUrl = 'https://firebasestorage.googleapis.com/v0/b/bucket/o/products%2Ftest.jpg?alt=media'
    const errorMessage = 'Delete failed'

    firebaseStorage.ref.mockReturnValue({})
    firebaseStorage.deleteObject.mockRejectedValue(new Error(errorMessage))

    // Act & Assert
    await expect(deleteImage(imageUrl)).resolves.not.toThrow()
  })
})

describe('validateImageUrl', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should validate a valid image URL', async () => {
    // Arrange
    const url = 'https://example.com/image.jpg'
    
    // Mock Image constructor
    global.Image = class {
      constructor() {
        setTimeout(() => {
          this.onload?.()
        }, 0)
      }
    }

    // Act
    const promise = validateImageUrl(url)
    await vi.runAllTimersAsync()
    const result = await promise

    // Assert
    expect(result).toBe(true)
  })

  it('should reject invalid image URL', async () => {
    // Arrange
    const url = 'https://example.com/invalid.jpg'
    
    global.Image = class {
      constructor() {
        setTimeout(() => {
          this.onerror?.()
        }, 0)
      }
    }

    // Act
    const promise = validateImageUrl(url)
    await vi.runAllTimersAsync()
    const result = await promise

    // Assert
    expect(result).toBe(false)
  })

  it('should timeout after configured duration', async () => {
    // Arrange
    const url = 'https://example.com/slow-image.jpg'
    
    global.Image = class {
      constructor() {
        // Never call onload or onerror
      }
    }

    // Act
    const promise = validateImageUrl(url)
    await vi.runAllTimersAsync()
    const result = await promise

    // Assert
    expect(result).toBe(false)
  })
})

describe('compressImage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should compress an image', async () => {
    // Arrange
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
    const maxWidth = 800
    const quality = 0.7

    // Mock FileReader
    class MockFileReader {
      readAsDataURL() {
        // Simulate async operation
        Promise.resolve().then(() => {
          this.onload?.({ target: { result: 'data:image/jpeg;base64,test' } })
        })
      }
    }
    global.FileReader = MockFileReader

    // Mock Image
    class MockImage {
      constructor() {
        this.width = 1600
        this.height = 1200
        // Simulate async loading
        Promise.resolve().then(() => {
          this.onload?.()
        })
      }
    }
    global.Image = MockImage

    // Mock Canvas
    const mockCanvas = {
      width: 0,
      height: 0,
      toBlob(callback) {
        const blob = new Blob(['compressed'], { type: 'image/jpeg' })
        callback(blob)
      },
      getContext() {
        return {
          drawImage: vi.fn()
        }
      }
    }
    global.document = {
      createElement: () => mockCanvas
    }

    // Act
    const result = await compressImage(file, maxWidth, quality)

    // Assert
    expect(result).toBeInstanceOf(File)
    expect(result.name).toBe('test.jpg')
    expect(result.type).toBe('image/jpeg')
  })

  it('should not resize images smaller than maxWidth', async () => {
    // Arrange
    const file = new File(['test'], 'small.jpg', { type: 'image/jpeg' })
    const maxWidth = 1200

    class MockFileReader {
      readAsDataURL() {
        Promise.resolve().then(() => {
          this.onload?.({ target: { result: 'data:image/jpeg;base64,test' } })
        })
      }
    }
    global.FileReader = MockFileReader

    let canvasWidth = 0
    class MockImage {
      constructor() {
        this.width = 800 // Smaller than maxWidth
        this.height = 600
        Promise.resolve().then(() => {
          this.onload?.()
        })
      }
    }
    global.Image = MockImage

    const mockCanvas = {
      set width(val) { canvasWidth = val },
      get width() { return canvasWidth },
      height: 0,
      toBlob(callback) {
        callback(new Blob(['compressed'], { type: 'image/jpeg' }))
      },
      getContext() {
        return {
          drawImage: vi.fn()
        }
      }
    }
    global.document = {
      createElement: () => mockCanvas
    }

    // Act
    const result = await compressImage(file, maxWidth)

    // Assert
    expect(canvasWidth).toBe(800) // Should keep original width
  })

  it('should handle compression errors', async () => {
    // Arrange
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })

    class MockFileReader {
      readAsDataURL() {
        Promise.resolve().then(() => {
          this.onerror?.()
        })
      }
    }
    global.FileReader = MockFileReader

    // Act & Assert
    await expect(compressImage(file)).rejects.toThrow('Fehler beim Lesen der Datei')
  })

  it('should handle image loading errors', async () => {
    // Arrange
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })

    class MockFileReader {
      readAsDataURL() {
        Promise.resolve().then(() => {
          this.onload?.({ target: { result: 'data:image/jpeg;base64,test' } })
        })
      }
    }
    global.FileReader = MockFileReader

    class MockImage {
      constructor() {
        Promise.resolve().then(() => {
          this.onerror?.()
        })
      }
    }
    global.Image = MockImage

    // Act & Assert
    await expect(compressImage(file)).rejects.toThrow('Fehler beim Laden des Bildes')
  })
})
