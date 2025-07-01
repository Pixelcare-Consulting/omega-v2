import { cn } from "@/lib/utils"

type ContentContainerProps = {
  className?: string
  children: React.ReactNode
}

export default function ContentContainer({ className, children }: ContentContainerProps) {
  return <div className={cn("min-h-[calc(100vh-56px-64px-20px-24px-56px-48px)]", className)}>{children}</div>
}
