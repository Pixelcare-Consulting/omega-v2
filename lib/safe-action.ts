import { getUserById } from "@/actions/user"
import { auth } from "@/auth"
import { createMiddleware, createSafeActionClient } from "next-safe-action"

function handleServerError(error: Error) {
  console.error(error)
  throw error
}

export const authenticationMiddleware = createMiddleware().define(async ({ next }) => {
  const session = await auth()

  if (!session || !session.user) throw { code: 401, message: "Unauthorized!", action: "AUTHENTICATION_MIDDLEWARE" }

  const user = await getUserById(session.user.id)

  if (!user) throw { code: 401, message: "Unauthorized!", action: "AUTHENTICATION_MIDDLEWARE" }

  return next({ ctx: { userId: session.user.id, role: user.role.code, roleId: user.role.id } })
})

//TODO: add authorization middle based on roles and permissions

export const action = createSafeActionClient({ handleServerError })
