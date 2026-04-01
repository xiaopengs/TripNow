import '@testing-library/jest-dom'

// Mock navigator.vibrate for tests
Object.defineProperty(navigator, 'vibrate', {
  value: jest.fn(),
  writable: true,
})

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// Mock geolocation
const geolocationMock = {
  getCurrentPosition: jest.fn(),
  watchPosition: jest.fn(),
  clearWatch: jest.fn(),
}
Object.defineProperty(navigator, 'geolocation', {
  value: geolocationMock,
})

// Suppress console errors in tests
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
}
