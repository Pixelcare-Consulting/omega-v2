"use server"

import { prisma } from "@/lib/db"

export async function getPermissions() {
  try {
    return await prisma.permission.findMany({
      include: { permissions: { include: { role: true } } },
      orderBy: { name: "asc" },
    })
  } catch (error) {
    console.error(error)
    return []
  }
}
