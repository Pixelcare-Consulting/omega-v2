"use client"

import { FallbackProps } from "react-error-boundary"
import { cn } from "@/lib/utils"
import { Button } from "./ui/button"

type FallbackComponentProps = FallbackProps & Record<string, any>

type ComponentErrorFallbackProps = {
  className?: string
  title: string
  description: string
  icon: React.ReactNode
}

export function ComponentErrorFallback({ error, resetErrorBoundary, ...extendedProps }: FallbackComponentProps) {
  const { className, title, description, icon } = extendedProps.componentErrorFallback as ComponentErrorFallbackProps

  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      {icon}
      <div className='mt-2.5 flex flex-col items-center justify-center gap-1'>
        <h1 className='text-center text-xl font-bold'>{title}</h1>
        <p className='text-center text-sm text-slate-500 dark:text-slate-400'>{description || error.message}</p>
      </div>

      <Button className='mt-4' size='sm' variant='destructive' onClick={() => resetErrorBoundary()}>
        Try Again
      </Button>
    </div>
  )
}
