export default {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/src'],
    testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
    collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts', '!src/prisma/client.ts'],
    setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts']
};
