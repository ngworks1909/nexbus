import { mockDeep } from 'jest-mock-extended';
import { PrismaClient } from '@repo/db/generated/prisma/client';

export const prisma = mockDeep<PrismaClient>();
