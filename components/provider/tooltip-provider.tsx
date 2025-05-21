import React from "react"
import { ToolTipContentProps, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip"
import { cn } from "@/lib/utils"

type ActionTooltipProviderProps = ToolTipContentProps & {
  label: string | React.ReactNode
  children: React.ReactNode & { asChild?: boolean }
  delayDuration?: number
  labelClassName?: string
}

export default function ActionTooltipProvider({
  label,
  labelClassName,
  children,
  delayDuration = 500,
  ...props
}: ActionTooltipProviderProps) {
  function renderLabel(label: string | React.ReactNode) {
    if (typeof label === "string") return <p className={cn("text-sm font-medium capitalize", labelClassName)}>{label}</p>
    return label
  }

  return (
    <TooltipProvider>
      <Tooltip delayDuration={delayDuration}>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent {...props}>{renderLabel(label)}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
