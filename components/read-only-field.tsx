import { cn } from "@/lib/utils"

type ReadOnlyFieldProps = {
  className?: string
  title: string
  value: React.ReactNode
}

export default function ReadOnlyField({ className, title, value }: ReadOnlyFieldProps) {
  return (
    <div className={cn("flex flex-col justify-start", className)}>
      <h2 className='mb-1 text-sm text-muted-foreground'>{title}:</h2>
      <span className='inline-block h-full rounded bg-muted/80 p-3 text-sm font-semibold'>{value}</span>
    </div>
  )
}
