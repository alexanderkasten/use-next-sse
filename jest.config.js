module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  transform: {
    '^.+\\.(ts|js)$': 'ts-jest',
    '^.+\\.tsx?$': 'babel-jest',
  },
  testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[tj]s?(x)'],
  setupFilesAfterEnv: ['@testing-library/jest-dom', '@testing-library/react', './jest-setup.ts'],
};
