import { mockDeep } from 'jest-mock-extended';
import { PrismaClient } from '@repo/db';

export const prisma = mockDeep<PrismaClient>();
