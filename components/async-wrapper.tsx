import { ReactNode, Suspense, SuspenseProps } from 'react'
import { ErrorBoundaryProps } from 'react-error-boundary'

import WithErrorBoundary from './with-error-boundary'

type AsyncWrapperProps = {
  children: ReactNode
  errorBoundaryProps: ErrorBoundaryProps & { extendedProps?: Record<string, any> }
  suspenseProps: SuspenseProps
}

export default function AsyncWrapper({ children, errorBoundaryProps, suspenseProps }: AsyncWrapperProps) {
  return (
    <WithErrorBoundary {...errorBoundaryProps}>
      <Suspense {...suspenseProps}>{children}</Suspense>
    </WithErrorBoundary>
  )
}
