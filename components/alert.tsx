import { cva, type VariantProps } from 'class-variance-authority'
import { Icons } from './icons'
import { cn } from '@/lib/utils'

type AlertProps = {
  className?: string
  message?: string
} & VariantProps<typeof alertVariants>

const alertVariants = cva('p-3 text-sm rounded-md flex items-center gap-x-2', {
  variants: {
    variant: {
      default: 'bg-base-primary/10 text-base-primary',
      error: 'bg-rose-500/15 text-rose-500',
      success: 'bg-teal-500/15 text-teal-500',
      warning: 'bg-amber-500/15 text-amber-500'
    }
  },
  defaultVariants: {
    variant: 'default'
  }
})

const icons: Record<NonNullable<AlertProps['variant']>, JSX.Element> = {
  default: <Icons.info className='text-base-primary size-5' />,
  error: <Icons.circleAlert className='size-5 text-rose-500' />,
  success: <Icons.checkCircle className='green-teal-500 size-5' />,
  warning: <Icons.triangleAlert className='size-5 text-amber-500' />
}

export default function Alert({ message, variant, className }: AlertProps) {
  const alertVariant = variant ?? 'default'
  const Icon = icons[alertVariant as NonNullable<AlertProps['variant']>]

  if (!message) return null

  return (
    <div className={cn(alertVariants({ variant, className }))}>
      {Icon}
      <p className='inline-block w-full break-words font-medium'>{message}</p>
    </div>
  )
}
