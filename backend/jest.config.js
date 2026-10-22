export default {
  testEnvironment: 'node',
  transform: {},
  // La build ESM de astronomy-engine (.js sin "type": "module") no la interpreta Jest: se usa la CommonJS
  moduleNameMapper: { '^astronomy-engine$': '<rootDir>/node_modules/astronomy-engine/astronomy.js' },
  testTimeout: 30000,
  setupFiles: ['./__tests__/setup.js'],
  globalSetup: './__tests__/globalSetup.js',
  testPathIgnorePatterns: ['/node_modules/', '/__tests__/setup.js', '/__tests__/helpers/', '/__tests__/globalSetup.js'],
};
