export default {
  testEnvironment: 'node',
  transform: {},
  testTimeout: 30000,
  setupFiles: ['./__tests__/setup.js'],
  testPathIgnorePatterns: ['/node_modules/', '/__tests__/setup.js'],
};
