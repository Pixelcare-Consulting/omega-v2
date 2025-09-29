import React from "react"
import { FormItem, FormLabel } from "./ui/form"
import { Icons } from "./icons"

type ReadOnlyFormFieldProps = {
  label: string
  value: React.ReactNode
  isLoading?: boolean
  className?: string
}

export default function ReadOnlyFormField({ label, value, isLoading, className }: ReadOnlyFormFieldProps) {
  return (
    <FormItem className={className}>
      <FormLabel className='space-x-1'>{label}</FormLabel>
      <div className='min-h-10 w-full cursor-not-allowed rounded-md border border-input bg-muted px-3 py-[9.5px] text-sm ring-offset-background'>
        {!isLoading && value}

        {isLoading && (
          <div className='flex items-center justify-between'>
            <span className='text-muted-foreground'>Loading value...</span>
            <Icons.spinner className='size-4 animate-spin' />
          </div>
        )}
      </div>
    </FormItem>
  )
}
