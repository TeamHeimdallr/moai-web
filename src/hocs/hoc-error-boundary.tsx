import { ReactNode, Suspense, SuspenseProps } from 'react';
import {
  ErrorBoundary as ReactErrorBoundary,
  ErrorBoundaryPropsWithRender,
} from 'react-error-boundary';

type ExceptFallbackErrorBoundaryAttributes = Omit<
  ErrorBoundaryPropsWithRender,
  'fallbackRender' | 'fallback' | 'FallbackComponent'
>;

type AsyncBoundaryProps = {
  children: ReactNode;
  errorFallback?: ErrorBoundaryPropsWithRender['fallbackRender'];
  suspenseFallback?: SuspenseProps['fallback'];
} & ExceptFallbackErrorBoundaryAttributes;

export const AsyncBoundary = ({
  children,
  errorFallback,
  suspenseFallback,
  ...restErrorBoundaryAttributes
}: AsyncBoundaryProps) => {
  if (errorFallback && suspenseFallback) {
    return (
      <ReactErrorBoundary fallbackRender={errorFallback} {...restErrorBoundaryAttributes}>
        <Suspense fallback={suspenseFallback}>{children}</Suspense>
      </ReactErrorBoundary>
    );
  }

  if (errorFallback) {
    return (
      <ReactErrorBoundary fallbackRender={errorFallback} {...restErrorBoundaryAttributes}>
        {children}
      </ReactErrorBoundary>
    );
  }

  if (suspenseFallback) {
    <Suspense fallback={suspenseFallback}>{children}</Suspense>;
  }

  return <>{children}</>;
};

export const ErrorBoundary = ReactErrorBoundary;
