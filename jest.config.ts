import type { Config } from 'jest';

const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  testEnvironment: 'node',
  verbose: true,
  testMatch: ['<rootDir>/lib/**/*.spec.ts'],
  extensionsToTreatAsEsm: ['.ts'],
  setupFiles: ['<rootDir>/test/setup.ts'],
  transform: {
    '^.+\\.(t|j)s$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.test.json',
        useESM: true,
      },
    ],
  },
  coverageDirectory: './coverage',
  collectCoverageFrom: [
    'lib/**/*.ts',
    '!lib/common/*.decorators.ts',
    '!lib/**/index.ts',
    '!lib/**/*.constants.ts',
    '!lib/**/*.module.ts',
    '!lib/**/*.interface.ts',
    '!**/node_modules/**',
  ],
};

export default config;
