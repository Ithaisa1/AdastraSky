export default {
  testEnvironment: 'node',
  transform: {},
  testTimeout: 30000,
  setupFiles: ['./__tests__/setup.js'],
  globalSetup: './__tests__/globalSetup.js',
  testPathIgnorePatterns: ['/node_modules/', '/__tests__/setup.js', '/__tests__/helpers/', '/__tests__/globalSetup.js'],
};
