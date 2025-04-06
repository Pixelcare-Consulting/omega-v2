'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { useAction } from 'next-safe-action/hooks'

import Alert from '@/components/alert'
import { Form } from '@/components/ui/form'
import InputField from '@/components/form/input-field'
import { zodResolver } from '@hookform/resolvers/zod'
import { LoginForm, loginFormSchema } from '@/schema/auth'
import { loginUser } from '@/actions/auth'
import { useSearchParams } from 'next/navigation'
import LoadingButton from '@/components/loading-button'

const SigninForm = () => {
  const [error, setError] = useState<string | undefined>()
  const [success, setSuccess] = useState<string | undefined>()

  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl')

  const form = useForm<LoginForm>({
    mode: 'onChange',
    defaultValues: { email: '', password: '', callbackUrl },
    resolver: zodResolver(loginFormSchema)
  })

  const { executeAsync, isExecuting } = useAction(loginUser)

  const handleSubmit = async (formValues: LoginForm) => {
    setError('')
    setSuccess('')

    try {
      const response = await executeAsync(formValues)
      const result = response?.data

      if (result && !result.error) {
        setSuccess('Successfully logged in!')
        form.reset()
        return
      }

      if (result && result.error) setError(result.message)
    } catch (err) {
      console.error(err)
      setError('Something went wrong! Please try again later.')
    }
  }

  return (
    <div className='flex flex-col gap-6'>
      <div className='flex flex-col items-center gap-2 text-center'>
        <h1 className='text-2xl font-bold'>Login to your account</h1>
        <p className='text-balance text-sm text-muted-foreground'>Enter your email below to login to your account</p>
      </div>

      <Alert variant='success' message={success} />
      <Alert variant='error' message={error} />

      <Form {...form}>
        <form id='login-form' className='flex flex-col' onSubmit={form.handleSubmit(handleSubmit)}>
          <div className='space-y-3'>
            <InputField
              control={form.control}
              name='email'
              label='Email'
              extendedProps={{ inputProps: { placeholder: 'm@example.com' } }}
            />

            <div>
              <InputField
                control={form.control}
                name='password'
                label='Password'
                extendedProps={{ inputProps: { placeholder: '**************', type: 'password' } }}
              />

              <Button asChild className='w-full justify-end px-0 font-normal' variant='link'>
                <Link href='/#' className='text-xs'>
                  Forgot Password?
                </Link>
              </Button>
            </div>

            <LoadingButton type='submit' className='w-full' isLoading={isExecuting} loadingText='Submitting'>
              Login
            </LoadingButton>
          </div>
        </form>
      </Form>
    </div>
  )
}

export default SigninForm
