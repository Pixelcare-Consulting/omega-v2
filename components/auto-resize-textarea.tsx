import * as React from "react"

import { cn } from "@/lib/utils"
import { useAutoResizeTextArea } from "@/hooks/use-autosize-textarea"

export interface AutoResizeTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  maxHeight?: number
  minHeight?: number
}

export type AutoResizeTextAreaRef = {
  textArea: HTMLTextAreaElement
  maxHeight: number
  minHeight: number
}

const AutoResizeTextarea = React.forwardRef<AutoResizeTextAreaRef, AutoResizeTextareaProps>(
  (
    { maxHeight = Number.MAX_SAFE_INTEGER, minHeight = 40, className, onChange, value, ...props },
    ref: React.Ref<AutoResizeTextAreaRef>
  ) => {
    const textAreaRef = React.useRef<HTMLTextAreaElement | null>(null)
    const [triggerAutoResize, setTriggerAutoResize] = React.useState("")

    useAutoResizeTextArea({
      textAreaRef: textAreaRef.current,
      triggerAutoResize,
      maxHeight,
      minHeight,
    })

    React.useImperativeHandle(ref, () => ({
      textArea: textAreaRef.current as HTMLTextAreaElement,
      focus: () => textAreaRef.current?.focus(),
      maxHeight,
      minHeight,
    }))

    return (
      <textarea
        {...props}
        value={value}
        className={cn(
          "flex min-h-[40px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-muted",
          className
        )}
        ref={textAreaRef}
        onChange={(e) => {
          setTriggerAutoResize(e.target.value)
          onChange?.(e)
        }}
        style={{ height: minHeight + 2 }}
      />
    )
  }
)
AutoResizeTextarea.displayName = "AutoResizeTextarea"

export default AutoResizeTextarea
