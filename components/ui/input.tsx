import * as React from "react"

import { cn } from "@/lib/utils"

export type InputProps = React.ComponentProps<"input"> & {
  startContent?: React.ReactNode
  endContent?: React.ReactNode
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, startContent, endContent, ...props }, ref) => {
  return (
    <div
      className={cn(
        "flex h-10 w-full items-center rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-within:border-primary focus-within:shadow-[0_0px_0px_1px_hsl(var(--primary))] focus-within:outline-none",
        className
      )}
    >
      {startContent && <span className='pointer-events-none flex items-center text-muted-foreground'>{startContent}</span>}
      <input
        type={type}
        ref={ref}
        {...props}
        className={cn(
          "w-full bg-transparent outline-none file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
          {
            "pl-1.5": !!startContent,
            "pr-1.5": !!endContent,
          }
        )}
      />
      {endContent && <span className='pointer-events-none flex items-center text-muted-foreground'>{endContent}</span>}
    </div>
  )
})
Input.displayName = "Input"

export { Input }
