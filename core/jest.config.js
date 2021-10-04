// process.env.NODE_ENV = null;
process.env.NODE_ENV = 'test';

module.exports = {
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^~/(.*)$': '<rootDir>/$1',
    'three/examples/jsm/*': '<rootDir>/jest/MockModule.js',
    'd3-delaunay': '<rootDir>/jest/MockModule.js',
    '\\.worker': '<rootDir>/jest/MockModule.js',
    'NFrepMarchingCubes': '<rootDir>/jest/MockModule.js',
  },
  moduleFileExtensions: [
    'ts',
    'js'
  ],
  transform: {
    '^.+\\.ts$': 'ts-jest',
    '^.+\\.js$': 'babel-jest',
    '^.+\\.(vert|frag|glsl)$': 'jest-raw-loader',
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
  collectCoverageFrom: []
};
