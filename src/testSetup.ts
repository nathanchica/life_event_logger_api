import { vi } from 'vitest';

// Mock Prisma Client
vi.mock('../src/prisma/client.js', () => ({
    default: () => import('./prisma/__mocks__/client.js')
}));
