"use client"

import "./styles/index.css"

import { useMemo } from "react"
import { cn } from "@/lib/utils"

type HtmlContentProps = {
  className?: string
  value?: string | null
}

export default function HtmlContent({ className, value }: HtmlContentProps) {
  const html = useMemo(() => {
    if (!value) return null
    return value
  }, [value])

  if (!html) return null

  return (
    <div
      className={cn(
        "minimal-tiptap-editor prose prose-sm prose-slate dark:prose-invert prose-p:mb-[10px] prose-p:mt-0 max-w-full",
        className
      )}
      dangerouslySetInnerHTML={{ __html: html }}
      suppressHydrationWarning
    />
  )
}
