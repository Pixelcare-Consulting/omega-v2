import { z } from "zod"

//* Zod Schema
export const userFormSchema = z
  .object({
    id: z.string().min(1, { message: "ID is required" }),
    name: z.string().min(1, { message: "Name is required" }),
    email: z.string().email().min(1, { message: "Email is required" }),
    password: z.string().nullish(),
    confirmPassword: z.string().nullish(),
    roleId: z.string().min(1, { message: "Role is required" }),
    isActive: z.boolean(),
    oldPassword: z.string().nullish(),
    newPassword: z.string().nullish(),
    newConfirmPassword: z.string().nullish(),
  })
  .refine(
    (formObj) => {
      if (formObj.id && formObj.id === "add") {
        if (formObj.password && formObj.password !== null && formObj.password !== undefined) return formObj.password.length >= 8
      } else return true
    },
    { message: "Password must be at least 8 characters", path: ["password"] }
  )
  .refine(
    (formObj) => {
      if (formObj.id && formObj.id === "add") {
        if (formObj.confirmPassword && formObj.confirmPassword !== null && formObj.confirmPassword !== undefined)
          return formObj.confirmPassword.length >= 8
      } else return true
    },
    { message: "Confirm password must be at least 8 characters", path: ["confirmPassword"] }
  )
  .refine(
    (formObj) => {
      if (formObj.id && formObj.id === "add") return formObj.password === formObj.confirmPassword
      else return true
    },
    { message: "Passwords don't match", path: ["confirmPassword"] }
  )
  .refine(
    (formObj) => {
      if (formObj.id && formObj.id !== "add") {
        if (formObj.oldPassword && formObj.oldPassword !== null && formObj.oldPassword !== undefined) {
          return formObj.oldPassword.length >= 8
        }

        return true
      } else return true
    },
    { message: "Old password must be at least 8 characters", path: ["oldPassword"] }
  )
  .refine(
    (formObj) => {
      if (formObj.id && formObj.id !== "add") {
        if (formObj.oldPassword && formObj.oldPassword !== null && formObj.oldPassword !== undefined) {
          if (formObj.newPassword !== null && formObj.newPassword !== undefined) {
            return formObj.newPassword.length >= 8
          } else return true
        }

        return true
      } else return true
    },
    { message: "New password must be at least 8 characters", path: ["newPassword"] }
  )
  .refine(
    (formObj) => {
      if (formObj.id && formObj.id !== "add") {
        if (formObj.oldPassword && formObj.oldPassword !== null && formObj.oldPassword !== undefined) {
          if (formObj.newConfirmPassword !== null && formObj.newConfirmPassword !== undefined) {
            return formObj.newConfirmPassword.length >= 8
          } else true
        }

        return true
      } else return true
    },
    { message: "new confirm password must be at least 8 characters", path: ["newConfirmPassword"] }
  )
  .refine(
    (formObj) => {
      if (formObj.id && formObj.id !== "add") {
        if (formObj.oldPassword && formObj.oldPassword !== null && formObj.oldPassword !== undefined) {
          if (
            formObj.newPassword &&
            formObj.newPassword !== null &&
            formObj.newPassword !== undefined &&
            formObj.newConfirmPassword &&
            formObj.newConfirmPassword !== null &&
            formObj.newConfirmPassword !== undefined
          ) {
            return formObj.newPassword === formObj.newConfirmPassword
          } else return true
        }

        return true
      } else return true
    },
    { message: "New confirm passwords don't match", path: ["newConfirmPassword"] }
  )

//* Type
export type UserForm = z.infer<typeof userFormSchema>
