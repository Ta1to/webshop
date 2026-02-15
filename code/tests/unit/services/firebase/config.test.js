/**
 * Unit Tests for Firebase Configuration
 * Following the AAA (Arrange-Act-Assert) Pattern
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock Firebase SDK
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn((config) => ({ config }))
}))

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn((app) => ({ app, type: 'firestore' }))
}))

vi.mock('firebase/storage', () => ({
  getStorage: vi.fn((app) => ({ app, type: 'storage' }))
}))

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn((app) => ({ app, type: 'auth' }))
}))

describe('Firebase Configuration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Clear module cache to get fresh imports
    vi.resetModules()
  })

  it('should initialize Firebase app', async () => {
    // Arrange
    const { initializeApp } = await import('firebase/app')

    // Act
    await import('@/services/firebase/config')

    // Assert
    expect(initializeApp).toHaveBeenCalled()
    const configUsed = initializeApp.mock.calls[0][0]
    expect(configUsed).toHaveProperty('apiKey')
    expect(configUsed).toHaveProperty('authDomain')
    expect(configUsed).toHaveProperty('projectId')
  })

  it('should export Firebase app instance', async () => {
    // Act
    const { app } = await import('@/services/firebase/config')

    // Assert
    expect(app).toBeDefined()
    expect(app.config).toBeDefined()
  })

  it('should export Firestore database instance', async () => {
    // Act
    const { db } = await import('@/services/firebase/config')

    // Assert
    expect(db).toBeDefined()
    expect(db.type).toBe('firestore')
  })

  it('should export Storage instance', async () => {
    // Act
    const { storage } = await import('@/services/firebase/config')

    // Assert
    expect(storage).toBeDefined()
    expect(storage.type).toBe('storage')
  })

  it('should export Auth instance', async () => {
    // Act
    const { auth } = await import('@/services/firebase/config')

    // Assert
    expect(auth).toBeDefined()
    expect(auth.type).toBe('auth')
  })

  it('should initialize Firestore with app instance', async () => {
    // Arrange
    const { getFirestore } = await import('firebase/firestore')

    // Act
    const { app, db } = await import('@/services/firebase/config')

    // Assert
    expect(getFirestore).toHaveBeenCalledWith(app)
    expect(db.app).toBe(app)
  })

  it('should initialize Storage with app instance', async () => {
    // Arrange
    const { getStorage } = await import('firebase/storage')

    // Act
    const { app, storage } = await import('@/services/firebase/config')

    // Assert
    expect(getStorage).toHaveBeenCalledWith(app)
    expect(storage.app).toBe(app)
  })

  it('should initialize Auth with app instance', async () => {
    // Arrange
    const { getAuth } = await import('firebase/auth')

    // Act
    const { app, auth } = await import('@/services/firebase/config')

    // Assert
    expect(getAuth).toHaveBeenCalledWith(app)
    expect(auth.app).toBe(app)
  })
})

describe('Firebase Configuration - Environment Variables', () => {
  it('should use environment variables for configuration', async () => {
    // Arrange
    const { initializeApp } = await import('firebase/app')

    // Act
    await import('@/services/firebase/config')
    const configUsed = initializeApp.mock.calls[0][0]

    // Assert - Just check that config has values, not specific values
    expect(configUsed.apiKey).toBeTruthy()
    expect(configUsed.authDomain).toBeTruthy()
    expect(configUsed.projectId).toBeTruthy()
    expect(configUsed.storageBucket).toBeTruthy()
    expect(configUsed.messagingSenderId).toBeTruthy()
    expect(configUsed.appId).toBeTruthy()
  })

  it('should have all required config properties', async () => {
    // Arrange
    const { initializeApp } = await import('firebase/app')

    // Act
    await import('@/services/firebase/config')
    const configUsed = initializeApp.mock.calls[0][0]

    // Assert
    expect(configUsed).toHaveProperty('apiKey')
    expect(configUsed).toHaveProperty('authDomain')
    expect(configUsed).toHaveProperty('projectId')
    expect(configUsed).toHaveProperty('storageBucket')
    expect(configUsed).toHaveProperty('messagingSenderId')
    expect(configUsed).toHaveProperty('appId')
    expect(configUsed).toHaveProperty('measurementId')
  })
})
