import { z } from 'zod'

//* Zod Schema
export const loginFormSchema = z.object({
  callbackUrl: z.string().nullish(),
  email: z.string().min(1, { message: 'Please enter an email' }).email({ message: 'Please enter a valid email' }),
  password: z.string().min(1, { message: 'Please enter a password' })
})

//* Types
export type LoginForm = z.infer<typeof loginFormSchema>
