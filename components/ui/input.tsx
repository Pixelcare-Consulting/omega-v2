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
        "flex h-10 w-full items-center overflow-hidden rounded-md border border-input bg-background text-sm ring-offset-background focus-within:border-primary focus-within:shadow-[0_0px_0px_1px_hsl(var(--primary))] focus-within:outline-none",
        className
      )}
    >
      {startContent && (
        <span className={cn("pointer-events-none flex h-full items-center pl-3 text-muted-foreground", props.disabled && "bg-muted")}>
          {startContent}
        </span>
      )}
      <input
        type={type}
        ref={ref}
        {...props}
        className={cn(
          "w-full bg-transparent px-3 py-[9.5px] outline-none file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:bg-muted",
          {
            "pl-1.5": !!startContent,
            "pr-1.5": !!endContent,
          }
        )}
      />
      {endContent && (
        <span className={cn("pointer-events-none flex items-center pr-3 text-muted-foreground", props.disabled && "bg-muted")}>
          {endContent}
        </span>
      )}
    </div>
  )
})
Input.displayName = "Input"

export { Input }
