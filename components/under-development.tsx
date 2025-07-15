import React from "react"
import { Icons } from "./icons"
import { cn } from "@/lib/utils"

type UnderDevelopmentProps = {
  title?: string
  description?: string
  className?: string
}

export default function UnderDevelopment({
  title = "Under Development",
  description = "This feature is under development.",
  className,
}: UnderDevelopmentProps) {
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className='flex flex-col items-center justify-center'>
        <Icons.construction className='size-14 text-destructive' />
        <div className='mt-2.5 flex flex-col items-center justify-center gap-1'>
          <h1 className='text-center text-xl font-bold'>Under Development</h1>
          <p className='text-center text-sm text-slate-500 dark:text-slate-400'>This feature is under development.</p>
        </div>
      </div>
    </div>
  )
}
