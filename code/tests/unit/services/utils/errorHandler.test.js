import { describe, it, expect, beforeEach, vi } from 'vitest'
import { errorHandler, ErrorLevel, withErrorHandling } from '@/services/utils/errorHandler'

describe('ErrorHandler', () => {
  // Spy on console methods
  let consoleErrorSpy
  let consoleWarnSpy
  let consoleInfoSpy

  beforeEach(() => {
    // Reset listeners before each test
    errorHandler.listeners = []
    
    // Setup console spies
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => {})
  })

  afterEach(() => {
    // Restore console methods
    consoleErrorSpy.mockRestore()
    consoleWarnSpy.mockRestore()
    consoleInfoSpy.mockRestore()
  })

  describe('error()', () => {
    it('should log error with message and error object', () => {
      // Arrange
      const message = 'Database connection failed'
      const error = new Error('Connection timeout')

      // Act
      errorHandler.error(message, error)

      // Assert
      expect(consoleErrorSpy).toHaveBeenCalled()
      const callArgs = consoleErrorSpy.mock.calls[0]
      expect(callArgs).toContain(message)
      expect(callArgs).toContain(error)
    })

    it('should log error without error object', () => {
      // Arrange
      const message = 'Something went wrong'

      // Act
      errorHandler.error(message)

      // Assert
      expect(consoleErrorSpy).toHaveBeenCalled()
      const callArgs = consoleErrorSpy.mock.calls[0]
      expect(callArgs).toContain(message)
    })

    it('should include context in error log', () => {
      // Arrange
      const message = 'Failed to save'
      const error = new Error('Save failed')
      const context = { userId: '123', action: 'update' }

      // Act
      errorHandler.error(message, error, context)

      // Assert
      expect(consoleErrorSpy).toHaveBeenCalled()
      const callArgs = consoleErrorSpy.mock.calls[0]
      expect(callArgs).toContain(context)
    })
  })

  describe('warn()', () => {
    it('should log warning with message', () => {
      // Arrange
      const message = 'Low stock warning'

      // Act
      errorHandler.warn(message)

      // Assert
      expect(consoleWarnSpy).toHaveBeenCalled()
      const callArgs = consoleWarnSpy.mock.calls[0]
      expect(callArgs).toContain(message)
    })

    it('should log warning with error object', () => {
      // Arrange
      const message = 'API rate limit approaching'
      const error = new Error('429 Too Many Requests')

      // Act
      errorHandler.warn(message, error)

      // Assert
      expect(consoleWarnSpy).toHaveBeenCalled()
      const callArgs = consoleWarnSpy.mock.calls[0]
      expect(callArgs).toContain(message)
      expect(callArgs).toContain(error)
    })
  })

  describe('info()', () => {
    it('should log info message', () => {
      // Arrange
      const message = 'User logged in successfully'

      // Act
      errorHandler.info(message)

      // Assert
      expect(consoleInfoSpy).toHaveBeenCalled()
      const callArgs = consoleInfoSpy.mock.calls[0]
      expect(callArgs).toContain(message)
    })

    it('should log info with context', () => {
      // Arrange
      const message = 'Order placed'
      const context = { orderId: 'ORD-123', amount: 99.99 }

      // Act
      errorHandler.info(message, context)

      // Assert
      expect(consoleInfoSpy).toHaveBeenCalled()
      const callArgs = consoleInfoSpy.mock.calls[0]
      expect(callArgs).toContain(message)
      expect(callArgs).toContain(context)
    })
  })

  describe('addListener() and removeListener()', () => {
    it('should add listener and call it on error', () => {
      // Arrange
      const listener = vi.fn()
      errorHandler.addListener(listener)
      const message = 'Test error'

      // Act
      errorHandler.error(message)

      // Assert
      expect(listener).toHaveBeenCalledTimes(1)
      const callArg = listener.mock.calls[0][0]
      expect(callArg).toHaveProperty('message', message)
      expect(callArg).toHaveProperty('level', ErrorLevel.ERROR)
    })

    it('should call multiple listeners', () => {
      // Arrange
      const listener1 = vi.fn()
      const listener2 = vi.fn()
      errorHandler.addListener(listener1)
      errorHandler.addListener(listener2)

      // Act
      errorHandler.warn('Warning message')

      // Assert
      expect(listener1).toHaveBeenCalledTimes(1)
      expect(listener2).toHaveBeenCalledTimes(1)
    })

    it('should remove listener successfully', () => {
      // Arrange
      const listener = vi.fn()
      errorHandler.addListener(listener)

      // Act
      errorHandler.removeListener(listener)
      errorHandler.error('Test error')

      // Assert
      expect(listener).not.toHaveBeenCalled()
    })

    it('should only remove specified listener', () => {
      // Arrange
      const listener1 = vi.fn()
      const listener2 = vi.fn()
      errorHandler.addListener(listener1)
      errorHandler.addListener(listener2)

      // Act
      errorHandler.removeListener(listener1)
      errorHandler.info('Test info')

      // Assert
      expect(listener1).not.toHaveBeenCalled()
      expect(listener2).toHaveBeenCalledTimes(1)
    })
  })

  describe('notifyListeners()', () => {
    it('should pass correct entry structure to listeners', () => {
      // Arrange
      const listener = vi.fn()
      errorHandler.addListener(listener)
      const message = 'Test message'
      const error = new Error('Test error')
      const context = { test: true }

      // Act
      errorHandler.error(message, error, context)

      // Assert
      expect(listener).toHaveBeenCalled()
      const entry = listener.mock.calls[0][0]
      expect(entry).toHaveProperty('timestamp')
      expect(entry).toHaveProperty('level', ErrorLevel.ERROR)
      expect(entry).toHaveProperty('message', message)
      expect(entry).toHaveProperty('error', error.message)
      expect(entry).toHaveProperty('context', context)
    })

    it('should handle listener errors gracefully', () => {
      // Arrange
      const faultyListener = vi.fn(() => {
        throw new Error('Listener error')
      })
      const goodListener = vi.fn()
      errorHandler.addListener(faultyListener)
      errorHandler.addListener(goodListener)

      // Act
      errorHandler.error('Test error')

      // Assert - Good listener should still be called
      expect(faultyListener).toHaveBeenCalled()
      expect(goodListener).toHaveBeenCalled()
    })
  })

  describe('log() - internal method', () => {
    it('should create log entry with all properties', () => {
      // Arrange
      const listener = vi.fn()
      errorHandler.addListener(listener)
      const level = ErrorLevel.WARN
      const message = 'Test log'
      const error = new Error('Test')
      const context = { key: 'value' }

      // Act
      errorHandler.log(level, message, error, context)

      // Assert
      const entry = listener.mock.calls[0][0]
      expect(entry.level).toBe(level)
      expect(entry.message).toBe(message)
      expect(entry.error).toBe(error.message)
      expect(entry.stack).toBe(error.stack)
      expect(entry.context).toEqual(context)
      expect(entry.timestamp).toBeDefined()
    })
  })
})

describe('withErrorHandling', () => {
  let consoleErrorSpy

  beforeEach(() => {
    errorHandler.listeners = []
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    consoleErrorSpy.mockRestore()
  })

  it('should execute function successfully when no error occurs', async () => {
    // Arrange
    const successFn = vi.fn(async (x, y) => x + y)
    const wrappedFn = withErrorHandling(successFn, 'Calculation failed')

    // Act
    const result = await wrappedFn(5, 3)

    // Assert
    expect(result).toBe(8)
    expect(successFn).toHaveBeenCalledWith(5, 3)
    expect(consoleErrorSpy).not.toHaveBeenCalled()
  })

  it('should catch and log errors from wrapped function', async () => {
    // Arrange
    const errorMessage = 'Operation failed'
    const error = new Error('Something went wrong')
    const faultyFn = vi.fn(async () => {
      throw error
    })
    const wrappedFn = withErrorHandling(faultyFn, errorMessage)

    // Act & Assert
    await expect(wrappedFn()).rejects.toThrow(error)
    expect(consoleErrorSpy).toHaveBeenCalled()
  })

  it('should use default error message when not provided', async () => {
    // Arrange
    const faultyFn = vi.fn(async () => {
      throw new Error('Test error')
    })
    const wrappedFn = withErrorHandling(faultyFn)

    // Act & Assert
    await expect(wrappedFn()).rejects.toThrow()
    expect(consoleErrorSpy).toHaveBeenCalled()
  })

  it('should pass arguments correctly to wrapped function', async () => {
    // Arrange
    const mockFn = vi.fn(async (a, b, c) => a + b + c)
    const wrappedFn = withErrorHandling(mockFn, 'Error')

    // Act
    const result = await wrappedFn(1, 2, 3)

    // Assert
    expect(result).toBe(6)
    expect(mockFn).toHaveBeenCalledWith(1, 2, 3)
  })

  it('should notify listeners when error occurs', async () => {
    // Arrange
    const listener = vi.fn()
    errorHandler.addListener(listener)
    const faultyFn = async () => {
      throw new Error('Test error')
    }
    const wrappedFn = withErrorHandling(faultyFn, 'Wrapped error')

    // Act
    try {
      await wrappedFn()
    } catch (e) {
      // Expected to throw
    }

    // Assert
    expect(listener).toHaveBeenCalled()
    const entry = listener.mock.calls[0][0]
    expect(entry.message).toBe('Wrapped error')
    expect(entry.level).toBe(ErrorLevel.ERROR)
  })
})

describe('ErrorLevel constants', () => {
  it('should define all error levels', () => {
    // Assert
    expect(ErrorLevel.ERROR).toBe('error')
    expect(ErrorLevel.WARN).toBe('warn')
    expect(ErrorLevel.INFO).toBe('info')
  })
})
