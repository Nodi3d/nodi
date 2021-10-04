// process.env.NODE_ENV = null;
process.env.NODE_ENV = 'test';

module.exports = {
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^~/(.*)$': '<rootDir>/$1',
    // '^vue$': 'vue/dist/vue.common.js'
    'three/examples/jsm/*': '<rootDir>/jest/MockModule.js'
  },
  moduleFileExtensions: [
    'ts',
    'js'
    // 'vue'
  ],
  transform: {
    '^.+\\.ts$': 'ts-jest',
    '^.+\\.(vert|frag|glsl)$': 'jest-raw-loader',
    '^.+\\.js$': 'babel-jest',
    '.*\\.(vue)$': 'vue-jest'
  },
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json'
    }
  },
  transformIgnorePatterns: [
    '/node_modules/'
  ],
  collectCoverage: false,
  collectCoverageFrom: [
    // '<rootDir>/components/**/*.vue',
    // '<rootDir>/pages/**/*.vue'
  ]
};
