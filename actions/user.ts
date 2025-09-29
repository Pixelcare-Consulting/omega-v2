"use server"

import { prisma } from "@/lib/db"
import { action, authenticationMiddleware } from "@/lib/safe-action"
import { paramsSchema } from "@/schema/common"
import { userFormSchema } from "@/schema/user"
import { Prisma, User } from "@prisma/client"
import bcrypt from "bcryptjs"

export async function getUserByEmail(email: string) {
  try {
    return await prisma.user.findUnique({ where: { email }, include: { profile: true } })
  } catch (err) {
    return null
  }
}

export async function getUserById(id: string) {
  try {
    if (!id) {
      console.error("getUserById called with empty id")
      return null
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        profile: true,
        settings: true,
        roleId: true,
        role: { include: { permissions: { include: { permission: true } } } },
        isOnline: true,
        isActive: true,
        lastActiveAt: true,
      },
    })

    if (!user) {
      console.log(`No user found with id: ${id}`)
      return null
    }

    return user
  } catch (err) {
    console.error(`Error fetching user with id: ${id}`, err)
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

export async function getUsers() {
  try {
    return await prisma.user.findMany({
      where: { deletedAt: null, deletedBy: null },
      include: { role: true, profile: true },
    })
  } catch (error) {
    console.error(error)
    return []
  }
}

export const getUsersClient = action.use(authenticationMiddleware).action(async () => {
  return getUsers()
})

export const upsertUser = action
  .use(authenticationMiddleware)
  .schema(userFormSchema)
  .action(async ({ ctx, parsedInput }) => {
    const { id, password, confirmPassword, oldPassword, newPassword, newConfirmPassword, ...data } = parsedInput
    const { userId } = ctx

    try {
      if (id && id !== "add") {
        const user = await prisma.user.findUnique({ where: { id } })

        if (!user) return { error: true, status: 404, message: "User not found!", action: "DELETE_USER" }

        let hashedPassword = user.password

        if (oldPassword && newPassword) {
          //* if old password is provided, check if it matches the current password
          if (user.password) {
            const isPasswordMatch = await bcrypt.compare(oldPassword, user.password)
            if (!isPasswordMatch) return { error: true, status: 409, message: "Old password does not match", action: "DELETE_USER" }
          }

          hashedPassword = await bcrypt.hash(newPassword, 10)
        }

        const updatedUser = await prisma.user.update({
          where: { id },
          data: { ...data, password: hashedPassword, updatedBy: userId },
        })

        return { status: 200, message: "User updated successfully", action: "UPSERT_USER", data: { user: updatedUser } }
      }

      const hashedPassword = await bcrypt.hash(password!, 10)

      const newUser = await prisma.user.create({
        data: {
          ...data,
          password: hashedPassword,
          createdBy: userId,
          updatedBy: userId,
          profile: {
            create: { details: {} },
          },
        },
      })

      return { status: 200, message: "User created successfully", action: "UPSERT_USER", data: { user: newUser } }
    } catch (error) {
      console.error(error)

      return {
        error: true,
        status: 500,
        message: error instanceof Error ? error.message : "Something went wrong!",
        action: "UPSERT_USER",
      }
    }
  })

export const deleteUser = action
  .use(authenticationMiddleware)
  .schema(paramsSchema)
  .action(async ({ ctx, parsedInput: data }) => {
    try {
      const user = await prisma.user.findUnique({ where: { id: data.id } })

      if (!user) return { error: true, status: 404, message: "User not found!", action: "DELETE_USER" }

      await prisma.user.update({ where: { id: data.id }, data: { deletedAt: new Date(), deletedBy: ctx.userId } })
      return { status: 200, message: "User deleted successfully!", action: "DELETE_USER" }
    } catch (error) {
      console.error(error)

      return {
        error: true,
        status: 500,
        message: error instanceof Error ? error.message : "Something went wrong!",
        action: "DELETE_USER",
      }
    }
  })
