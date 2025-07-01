import { cn } from "@/lib/utils"
import React from "react"

type ReadOnlyFieldHeaderProps = {
  className?: string
  title: string
  description: string
  actions?: React.ReactNode
}

export default function ReadOnlyFieldHeader({ className, title, description, actions }: ReadOnlyFieldHeaderProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-4 lg:flex-row lg:justify-between", className)}>
      <div className='flex flex-col justify-center'>
        <h2 className='mb-0 font-bold'>{title}</h2>
        <p className='text-sm text-muted-foreground'>{description}</p>
      </div>

      {actions}
    </div>
  )
}
