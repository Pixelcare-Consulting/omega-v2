'use server'

import { auth, signIn } from '@/auth'
import { AuthError } from 'next-auth'

import { getUserByEmail } from './user'
import { action } from '@/lib/safe-action'
import { loginFormSchema } from '@/schema/auth'
import { DEFAULT_LOGIN_REDIRECT } from '@/constant/route'

export async function getCurrentUser() {
  const session = await auth()
  return session?.user
}

export const loginUser = action.schema(loginFormSchema).action(async ({ parsedInput: data }) => {
  const { email, password, callbackUrl } = data

  const user = await getUserByEmail(email)

  if (!user || !user.email || !user.password) {
    return { error: true, code: 401, message: 'User does not exist!', action: 'SIGNIN_USER' }
  }

  try {
    await signIn('credentials', {
      email,
      password,
      redirectTo: callbackUrl || DEFAULT_LOGIN_REDIRECT
    })
  } catch (err) {
    if (err instanceof AuthError) {
      const authError = err as any

      console.log({ authErrorZZZ: authError })

      switch (authError?.code) {
        case 'credentials':
          return { error: true, code: 401, message: 'Invalid Credentials!', action: 'SIGNIN_USER' }
        default:
          return { error: true, code: 500, message: 'Failed to login! Please try again later.', action: 'SIGNIN_USER' }
      }
    }

    throw err //* need to throw error here else redirect not working for some reason in auth.js
  }
})
