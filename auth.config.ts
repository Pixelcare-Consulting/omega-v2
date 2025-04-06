import bcrypt from 'bcryptjs'
import type { NextAuthConfig } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'

import { loginFormSchema } from './schema/auth'
import { prisma } from './lib/db'

export default {
  providers: [
    Credentials({
      authorize: async (credentials) => {
        try {
          const validatedFields = loginFormSchema.safeParse(credentials)

          if (validatedFields.success) {
            const { email, password } = validatedFields.data

            const user = await prisma.user.findUnique({ where: { email }, include: { profile: true } })

            if (!user || !user.password) return null

            const isPasswordMatch = await bcrypt.compare(password, user.password)

            if (isPasswordMatch) {
              return {
                id: user.id,
                name: user.name,
                email: user.email,
                profile: user?.profile
              }
            }
          }

          return null
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
          return null
        }
      }
    })
  ]
} satisfies NextAuthConfig
