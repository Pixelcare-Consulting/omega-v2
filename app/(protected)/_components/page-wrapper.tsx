import { Icon } from "@/components/icons"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Link from "next/link"

type PageWrapper = {
  title: string
  description?: string
  children: React.ReactNode
  defaultAction?: {
    label: string
    href: string
    icon?: Icon
  }
  actions?: React.ReactNode
}

export default function PageWrapper({ title, description, children, defaultAction, actions }: PageWrapper) {
  const DefaultActionIcon = defaultAction?.icon

  return (
    <div className='h-full w-full px-4 py-5'>
      <header className='flex flex-col items-center justify-center gap-4 lg:flex-row lg:justify-between'>
        <div className='max-w-3xl flex-1'>
          <h1 className='text-center text-xl font-bold tracking-tight sm:text-xl md:text-2xl lg:text-left lg:text-3xl'>{title}</h1>
          <p className='text-center text-sm text-muted-foreground lg:text-left'>{description}</p>
        </div>

        <div>
          {defaultAction && (
            <Link className={cn(buttonVariants({ variant: "default" }))} href={defaultAction.href}>
              {DefaultActionIcon && <DefaultActionIcon className='mr-2 size-4' />} {defaultAction.label}
            </Link>
          )}

          {actions}
        </div>
      </header>

      <div className='mt-5 h-full space-y-4'>{children}</div>
    </div>
  )
}
