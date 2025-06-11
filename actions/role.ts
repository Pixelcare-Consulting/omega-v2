"use server"

import { prisma } from "@/lib/db"
import { action } from "@/lib/safe-action"
import { paramsSchema } from "@/schema/common"
import { roleFormSchema } from "@/schema/role"

export async function getRoles() {
  try {
    return await prisma.role.findMany({
      where: { deletedAt: null, deletedBy: null },
      include: { permissions: { include: { permission: true } } },
    })
  } catch (error) {
    console.error(error)
    return []
  }
}

export async function getRoleById(id: string) {
  try {
    return await prisma.role.findUnique({ where: { id }, include: { permissions: true } })
  } catch (error) {
    console.error(error)
    return null
  }
}

//TODO: Add authentication & authorization middleware to server action using save action's createMiddleware
export const upsertRole = action.schema(roleFormSchema).action(async ({ ctx, parsedInput: data }) => {
  const { id, code, name, description, permissions } = data

  try {
    const existingRole = await prisma.role.findFirst({ where: { code, ...(id && id !== "add" && { id: { not: id } }) } })

    //* check if existing
    if (existingRole) return { error: true, status: 401, message: "Role code already exists!", action: "UPSERT_ROLE" }

    //* if update
    if (id && id !== "add") {
      const [updatedRole] = await prisma.$transaction([
        //* update role
        prisma.role.update({
          where: { id },
          data: { code, name, description },
        }),

        //* delete the existing role permissions record
        prisma.rolePermissions.deleteMany({ where: { roleId: id } }),

        //* create new role permissions record
        prisma.rolePermissions.createManyAndReturn({
          data: permissions.map((p) => ({ roleId: id, permissionId: p.id, actions: p.actions })),
        }),
      ])

      return {
        status: 200,
        message: "Role updated successfully!",
        action: "UPSERT_ROLE",
        data: { role: updatedRole },
      }
    }

    //* create role
    const newRole = await prisma.role.create({
      data: {
        code,
        name,
        description,
        permissions: {
          create: permissions.map((p) => ({ permissionId: p.id, actions: p.actions })),
        },
      },
    })

    return { status: 200, message: "Role created successfully!", action: "UPSERT_ROLE", data: { role: newRole } }
  } catch (error) {
    console.error(error)

    return {
      error: true,
      status: 500,
      message: error instanceof Error ? error.message : "An unexpected error occurred",
      action: "UPSERT_ROLE",
    }
  }
})

export const deleleteRole = action.schema(paramsSchema).action(async ({ ctx, parsedInput: data }) => {
  try {
    const role = await prisma.role.findUnique({ where: { id: data.id } })

    if (!role) return { error: true, code: 404, message: "Role not found", action: "DELETE_ROLE" }

    await prisma.role.update({ where: { id: data.id }, data: { deletedAt: new Date() } })

    return { status: 200, message: "Role deleted successfully", action: "DELETE_ROLE" }
  } catch (error) {
    console.error(error)
    return {
      error: true,
      status: 500,
      message: error instanceof Error ? error.message : "An unexpected error occurred",
      action: "DELETE_ROLE",
    }
  }
})
