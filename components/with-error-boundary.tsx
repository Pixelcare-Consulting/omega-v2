'use client'

import { ErrorBoundary, ErrorBoundaryProps } from 'react-error-boundary'

type WithErrorBoundaryProps = Omit<ErrorBoundaryProps, 'fallback' | 'fallbackRender'> & { extendedProps?: Record<string, any> }

export default function WithErrorBoundary({ children, extendedProps, ...props }: WithErrorBoundaryProps) {
  const FallbackComponent = props.FallbackComponent

  return (
    <ErrorBoundary
      {...props}
      FallbackComponent={(props) => (FallbackComponent ? <FallbackComponent {...props} {...extendedProps} /> : null)}
    >
      {children}
    </ErrorBoundary>
  )
}
