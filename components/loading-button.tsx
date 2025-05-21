"use client"

import { forwardRef } from "react"

import { Button as ShadcnButton, ButtonProps as ShadcnButtonProps } from "./ui/button"
import { Icons } from "./icons"

type ButtonProps = ShadcnButtonProps & { isLoading?: boolean; loadingText?: string }

const LoadingButton = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ isLoading, loadingText = "Saving", children, disabled, ...props }, ref) => (
    <ShadcnButton ref={ref} disabled={disabled || isLoading} {...props}>
      {isLoading && <Icons.spinner className='mr-2 size-4 animate-spin' />}
      {!isLoading && children}
      {isLoading && <span>{loadingText}...</span>}
    </ShadcnButton>
  )
)

LoadingButton.displayName = "LoadingButton"

export default LoadingButton
