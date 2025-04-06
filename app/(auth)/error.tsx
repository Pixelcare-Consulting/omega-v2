'use client'

import { Icons } from '@/components/icons'
import { Button } from '@/components/ui/button'

export default function AuthErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className='flex h-screen items-center justify-center'>
      <div className='flex max-w-[480px] flex-col items-center justify-center gap-y-4'>
        <Icons.triangleAlert
          className='size-20 text-rose-500 [&>path:nth-child(2)]:stroke-white [&>path:nth-child(3)]:stroke-white'
          fill='#F43F5E'
        />
        <div className='flex flex-col items-center justify-center gap-y-2'>
          <h2 className='w-fit text-2xl font-semibold'>Something went wrong!</h2>
          <p className='text-center text-base text-muted-foreground text-slate-400'>Unexpected error occurred.</p>
        </div>

        <Button onClick={() => reset()}>Try Again</Button>
      </div>
    </div>
  )
}
