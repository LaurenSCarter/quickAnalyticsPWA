require('@testing-library/jest-dom');
require('fake-indexeddb/auto');

global.fetch = jest.fn();

// Load CategoryData for tests
global.CategoryData = require('../data.js');

Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  },
  writable: true,
});

global.navigator.serviceWorker = {
  register: jest.fn(() => Promise.resolve()),
};

beforeEach(() => {
  fetch.mockClear();
  localStorage.getItem.mockClear();
  localStorage.setItem.mockClear();
  localStorage.removeItem.mockClear();
  localStorage.clear.mockClear();
});