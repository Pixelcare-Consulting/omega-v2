"use client"

import { Icons } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { useRouter } from "nextjs-toploader/app"

export default function UnAuthorizedPage() {
  const router = useRouter()

  return (
    <div className='flex h-screen items-center justify-center'>
      <div className='flex max-w-[480px] flex-col items-center justify-center gap-y-4'>
        <Icons.lockKeyHole className='size-20 text-red-500' />

        <div className='flex flex-col items-center justify-center gap-y-2'>
          <h2 className='w-fit text-2xl font-semibold'>You are not authorized</h2>
          <p className='text-center text-base text-muted-foreground text-slate-400'>
            You don&prime;t have permission to access this page. Go Home!
          </p>
        </div>

        <Button onClick={() => router.push("/")}>Back to Home</Button>
      </div>
    </div>
  )
}
