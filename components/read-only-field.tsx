import { cn } from "@/lib/utils"
import { Icons } from "./icons"

type ReadOnlyFieldProps = {
  className?: string
  title: string
  value: React.ReactNode
  isLoading?: boolean
  description?: string
}

export default function ReadOnlyField({ className, title, value, isLoading, description }: ReadOnlyFieldProps) {
  return (
    <div className={cn("flex flex-col justify-start", className)}>
      <h2 className='mb-1 text-sm text-muted-foreground'>{title}:</h2>
      <span className='inline-block h-full rounded bg-muted/80 p-3 text-sm font-semibold'>
        {!isLoading && value}

        {isLoading && (
          <div className='flex items-center justify-between'>
            <span className='text-muted-foreground'>Loading value...</span>
            <Icons.spinner className='size-4 animate-spin' />
          </div>
        )}
      </span>
      <span className='mt-1 text-xs text-muted-foreground'>{description}</span>
    </div>
  )
}
