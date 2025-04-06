import 'next-auth/jwt'

import NextAuth, { NextAuthConfig } from 'next-auth'
import bcrypt from 'bcryptjs'
import { PrismaAdapter } from '@auth/prisma-adapter'
import Credentials from 'next-auth/providers/credentials'
import authConfig from './auth.config'
import { prisma } from './lib/db'
import { loginFormSchema } from './schema/auth'
import { getAccountByUserId, getUserById } from './actions/user'

//* module augmentation for next-auth\
export type ExtendedUser = {
  id: string
  name: string | null
  email: string
  emailVerified: Date | null
  role: string | null
  profile: Record<string, any> | null
  isOnline: boolean
  isActive: boolean
  lastActiveAt: Date | null
  isOAuth: boolean
}

declare module 'next-auth' {
  interface Session {
    user: ExtendedUser
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    user: ExtendedUser
  }
}

export const callbacks: NextAuthConfig['callbacks'] = {
  jwt: async ({ token, session, trigger }) => {
    //* anything returned here will be saved in the JWT and forwarded to the session callback

    if (!token.sub) return token

    const existingUser = await getUserById(token.sub)

    if (!existingUser) return token

    const existingAccount = await getAccountByUserId(existingUser.id)

    const { id, name, email, emailVerified, role, profile, isOnline, isActive, lastActiveAt } = existingUser

    token.user = {
      id,
      name,
      email,
      emailVerified,
      role,
      profile,
      isOnline,
      isActive,
      lastActiveAt,
      isOAuth: !!existingAccount
    }

    //* update token.user when triggered update of session
    if (trigger === 'update') token.user = session.user

    return token
  },
  session: async ({ token, session }) => {
    //* anything returned here will be avaible to the client
    if (token.user) session.user = token.user
    return session
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  callbacks,
  pages: {
    signIn: '/login',
    error: '/auth-error'
  },
  ...authConfig
})
