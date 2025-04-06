import { PrismaClient } from '@prisma/client'
import { global } from 'styled-jsx/css'

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface Global {
      prisma: PrismaClient
    }
  }
}

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
