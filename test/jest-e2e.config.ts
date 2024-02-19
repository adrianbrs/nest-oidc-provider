import type { Config } from 'jest';

const config: Config = {
  forceExit: true,
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '../',
  testEnvironment: 'node',
  verbose: true,
  testMatch: ['<rootDir>/test/e2e/**/*.e2e-spec.ts'],
  extensionsToTreatAsEsm: ['.ts'],
  setupFiles: ['<rootDir>/test/setup.ts'],
  transform: {
    '^.+\\.(t|j)s$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/test/tsconfig.json',
        useESM: true,
      },
    ],
  }
};

export default config;
