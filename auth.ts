import "next-auth/jwt"

import NextAuth, { NextAuthConfig } from "next-auth"
import { authenticateSAPServiceLayer } from "./lib/sap-service-layer"
import { PrismaAdapter } from "@auth/prisma-adapter"
import authConfig from "./auth.config"
import { prisma } from "./lib/db"
import { isProd } from "./constant/common"
import { getUserById } from "./actions/user"

//* use secure cookies only for production and prefix with __Secure-
const isSecureCookies = isProd ? true : false
const cookiePrefix = isSecureCookies ? "__Secure-" : ""

//* module augmentation for next-auth
export type ExtendedUser = {
  id: string
  name: string | null
  email: string
  emailVerified: Date | null // Required by adapter
  role: string
  roleId: string
  avatarUrl?: string | null
  rolePermissions: { id: string; code: string; actions: string[] }[]
  sapSession?: { b1session: string; routeid: string }
}

declare module "next-auth" {
  interface Session {
    user: ExtendedUser
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    sub: string
    name?: string | null
    email?: string | null
    role: string
    roleId: string
    avatarUrl?: string | null
    rolePermissions: { id: string; code: string; actions: string[] }[]
    sapSession?: { b1session: string; routeid: string }
  }
}

export const callbacks: NextAuthConfig["callbacks"] = {
  jwt: async ({ token, session, trigger, user }) => {
    try {
      if (!token.sub) return token

      //* query existing user based on token.sub (userID)
      //* fetching the the user using the token.sub, make sure to get the up to date data of the user
      const existingUser = await getUserById(token.sub)

      if (!existingUser) return token

      const { id, name, email, role, roleId } = existingUser

      token.sub = id
      token.name = name
      token.email = email
      token.role = role.code
      token.roleId = roleId
      token.rolePermissions = role.permissions.map((p) => ({
        id: p.permissionId,
        code: p.permission.code,
        actions: p.actions,
      }))

      //* user - fields only available after login and for the next subsequent calls it will be undefined
      //* trigger authenticate SAP only once after login, on subsequent calls it will not be triggered
      if (user) {
        //* Authenticate with SAP Service Layer and add session to token
        //* Only do this in Node.js environment, not in Edge Runtime
        if (typeof process !== "undefined" && typeof process.cwd === "function") {
          try {
            const { authenticateSAPServiceLayer } = await import("./lib/sap-service-layer")
            const sapCredentials = {
              BaseURL: process.env.SAP_BASE_URL || "",
              CompanyDB: process.env.SAP_COMPANY_DB || "",
              UserName: process.env.SAP_USERNAME || "",
              Password: process.env.SAP_PASSWORD || "",
            }
            const sapSession = await authenticateSAPServiceLayer(sapCredentials)
            token.sapSession = sapSession
          } catch (sapError: any) {
            const { authLogger } = await import("./lib/logger")
            authLogger.error(`SAP Service Layer authentication failed: ${sapError.message}`)
            // Decide how to handle SAP authentication failure - maybe prevent login or show an error
          }
        }

        //* Query only the avatar URL separately - avoid including profile in token
        const userProfile = await prisma.profile.findUnique({
          where: { userId: id },
          select: { details: true },
        })

        if (userProfile?.details) {
          const details = userProfile.details as Record<string, any>
          token.avatarUrl = details.avatarUrl || null
        }
      }

      //* Handle session updates
      if (trigger === "update" && session) {
        //* Only update specific fields to keep token small
        if (session.user.avatarUrl !== undefined) {
          token.avatarUrl = session.user.avatarUrl
        }
        if (session.user.name) token.name = session.user.name
        if (session.user.email) token.email = session.user.email
      }

      return token
    } catch (error: any) {
      const { authLogger } = await import("./lib/logger")
      authLogger.error(`Error in JWT callback: ${error.message}`)
      return token
    }
  },

  session: async ({ token, session }) => {
    try {
      if (token && token.sub) {
        session.user = {
          id: token.sub,
          name: token.name || null,
          email: token.email || "",
          emailVerified: null, //* Add this field to satisfy type requirements
          role: token.role,
          roleId: token.roleId,
          rolePermissions: token.rolePermissions,
          avatarUrl: token.avatarUrl || null,
          sapSession: token.sapSession,
        }
      }

      return session
    } catch (error: any) {
      const { authLogger } = await import("./lib/logger")
      authLogger.error(`Error in session callback: ${error.message}`)
      return session
    }
  },
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60, //* 8 hours
    updateAge: 4 * 60 * 60, //* 4 hours
  },
  cookies: {
    sessionToken: {
      name: `${cookiePrefix}authjs.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: isSecureCookies,
      },
    },
  },
  callbacks,
  pages: {
    signIn: "/login",
    error: "/auth-error",
  },
  debug: false, //* Disable debug to reduce token size from logs
  logger: {
    error: async (error: Error) => {
      const { authLogger } = await import("./lib/logger")
      authLogger.error(`Auth error: ${error.message}`)
    },
    warn: async (code: string) => {
      const { authLogger } = await import("./lib/logger")
      if (code !== "debug-enabled") {
        authLogger.info(`Auth warning (${code})`)
      }
    },
  },
  ...authConfig,
})
