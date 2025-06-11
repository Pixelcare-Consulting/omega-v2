import { z } from "zod"

//* Zod Schema
const rolePermissionsFormSchema = z.object({
  id: z.string().min(1, { message: "Id is required" }),
  actions: z.array(z.string()),
})

export const roleFormSchema = z.object({
  id: z.string().min(1, { message: "Id is required" }),
  code: z.string().min(1, { message: "Code is required" }),
  name: z.string().min(1, { message: "Name is required" }),
  description: z.string().nullish(),
  permissions: z.array(rolePermissionsFormSchema),
})

//* Types
export type RoleForm = z.infer<typeof roleFormSchema>
