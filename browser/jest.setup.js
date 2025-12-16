// Polyfill TextEncoder/TextDecoder for Jest/jsdom environment
if (typeof TextEncoder === 'undefined') {
  const { TextEncoder, TextDecoder } = require('util');
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}

// Optionally mock matchMedia if needed by components
if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = () => ({
    matches: false,
    addEventListener: () => { },
    removeEventListener: () => { },
    addListener: () => { },
    removeListener: () => { },
    dispatchEvent: () => false,
  });
}

// add jest-dom matchers
try {
  // prefer explicit extend so it works in CommonJS and when run as setupFilesAfterEnv
  try {
    const matchers = require('@testing-library/jest-dom/matchers')
    const { expect } = require('@jest/globals')
    if (expect && matchers) {
      expect.extend(matchers)
    }
  } catch (e) {
    // fallback to simple require which may work in some setups
    require('@testing-library/jest-dom')
  }
} catch (e) {
  // ignore if not installed in environment
}
