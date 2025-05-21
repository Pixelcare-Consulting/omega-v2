import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog"
import { Button } from "./ui/button"

type ExtendedProps = {
  alertDialogProps?: Omit<React.ComponentPropsWithRef<typeof AlertDialog>, "open" | "onOpenChange">
  alertDialogTriggerProps?: Omit<React.ComponentPropsWithRef<typeof AlertDialogTrigger>, "asChild">
  alertDialogContentProps?: React.ComponentPropsWithRef<typeof AlertDialogContent>
  alertDialogHeaderProps?: React.ComponentPropsWithRef<typeof AlertDialogHeader>
  alertDialogFooterProps?: React.ComponentPropsWithRef<typeof AlertDialogFooter>
  alertDialogTitleProps?: React.ComponentPropsWithRef<typeof AlertDialogTitle>
  alertDialogDescriptionProps?: React.ComponentPropsWithRef<typeof AlertDialogDescription>
  alertDialogActionProps?: Omit<React.ComponentPropsWithRef<typeof Button>, "onClick">
  alertDialogCancelProps?: Omit<React.ComponentPropsWithRef<typeof Button>, "onClick">
}

type AlertModalProps = {
  isOpen?: boolean
  title: string
  description: string
  onConfirm: () => void
  onConfirmText?: string
  onCancel?: () => void
  onCancelText?: string
  children?: React.ReactNode
  extendedProps?: ExtendedProps
}

export default function AlertModal({
  isOpen,
  title,
  description,
  children,
  onConfirm,
  onConfirmText,
  onCancel,
  onCancelText,
  extendedProps,
}: AlertModalProps) {
  return (
    <AlertDialog open={isOpen} {...extendedProps?.alertDialogProps}>
      <AlertDialogTrigger asChild {...extendedProps?.alertDialogTriggerProps}>
        {children}
      </AlertDialogTrigger>
      <AlertDialogContent {...extendedProps?.alertDialogContentProps}>
        <AlertDialogHeader {...extendedProps?.alertDialogHeaderProps}>
          <AlertDialogTitle {...extendedProps?.alertDialogTitleProps}>{title}</AlertDialogTitle>
          <AlertDialogDescription {...extendedProps?.alertDialogDescriptionProps}>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter {...extendedProps?.alertDialogFooterProps}>
          <Button variant='outline' {...extendedProps?.alertDialogCancelProps} onClick={onCancel}>
            {onCancelText ?? "Cancel"}
          </Button>
          <Button variant='destructive' {...extendedProps?.alertDialogActionProps} onClick={onConfirm}>
            {onConfirmText ?? "Continue"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
