"use server"

import { prisma } from "@/lib/db"

export async function getActivityLogs() {
  try {
    return await prisma.activityLog.findMany()
  } catch (error) {
    console.error(error)
    return []
  }
}
