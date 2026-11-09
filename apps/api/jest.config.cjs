module.exports = {
  rootDir: '.test-dist',
  testEnvironment: 'node',
  setupFiles: ['reflect-metadata'],
  transform: {},
  testMatch: ['<rootDir>/src/**/*.spec.js', '<rootDir>/test/**/*.e2e-spec.js'],
};
