'use server'

import { prisma } from '@/lib/db'

export async function getUserByEmail(email: string) {
  try {
    return await prisma.user.findUnique({ where: { email }, include: { profile: true } })
  } catch (err) {
    return null
  }
}

export async function getUserById(id: string) {
  try {
    return await prisma.user.findUnique({ where: { id }, include: { profile: true } })
  } catch (err) {
    return null
  }
}

export async function getAccountByUserId(userId: string) {
  try {
    return await prisma.account.findFirst({ where: { userId } })
  } catch (err) {
    return null
  }
}
