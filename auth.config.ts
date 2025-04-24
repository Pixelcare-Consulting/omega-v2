import bcrypt from 'bcryptjs'
import type { NextAuthConfig } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'

import { loginFormSchema } from './schema/auth'
import { prisma } from './lib/db'
import { logActivity } from './lib/activity-logger'

const getClientInfo = (req: Request) => {
  const forwardedFor = req.headers.get('x-forwarded-for');
  const userAgent = req.headers.get('user-agent') || undefined;
  const ipAddress = forwardedFor ? forwardedFor.split(',')[0] : undefined;
  
  return { ipAddress, userAgent };
};

export default {
  providers: [
    Credentials({
      authorize: async (credentials, request) => {
        try {
          const validatedFields = loginFormSchema.safeParse(credentials)

          if (validatedFields.success) {
            const { email, password } = validatedFields.data
            const { ipAddress, userAgent } = getClientInfo(request);

            const user = await prisma.user.findUnique({ where: { email }, include: { profile: true } })

            if (!user || !user.password) {
              // Log failed login attempt - user not found
              await logActivity({
                user: email,
                action: 'Login Attempt',
                eventType: 'security',
                severity: 'warning',
                details: 'Failed login attempt - User not found',
                ipAddress,
                userAgent,
                metadata: { reason: 'user_not_found' }
              });
              return null;
            }

            const isPasswordMatch = await bcrypt.compare(password, user.password)

            if (isPasswordMatch) {
              // Log successful login
              await logActivity({
                user: user.email,
                action: 'Login Success',
                eventType: 'security',
                severity: 'info',
                details: 'Successful login',
                ipAddress,
                userAgent,
                metadata: { userId: user.id }
              });

              return {
                id: user.id,
                name: user.name,
                email: user.email,
                profile: user?.profile
              }
            }

            // Log failed login attempt - wrong password
            await logActivity({
              user: email,
              action: 'Login Attempt',
              eventType: 'security',
              severity: 'warning',
              details: 'Failed login attempt - Invalid credentials',
              ipAddress,
              userAgent,
              metadata: { reason: 'invalid_credentials' }
            });
          }

          return null
        } catch (error) {
          // Log system error during login
          if (credentials && typeof credentials === 'object' && 'email' in credentials) {
            const { ipAddress, userAgent } = getClientInfo(request);
            await logActivity({
              user: credentials.email as string,
              action: 'Login Error',
              eventType: 'system',
              severity: 'error',
              details: 'System error during login attempt',
              ipAddress,
              userAgent,
              metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
            });
          }
          return null
        }
      }
    })
  ]
} satisfies NextAuthConfig
