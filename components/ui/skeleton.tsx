import * as React from 'react';

/**
 * shadcn/ui-compatible Skeleton primitive.
 *
 * Renders a pulsing, rounded placeholder block. Forwards all standard
 * `<div>` props so callers can size/position it via Tailwind classes.
 */
export type SkeletonProps = React.HTMLAttributes<HTMLDivElement>;

export function Skeleton({ className, ...props }: SkeletonProps) {
  const base = 'animate-pulse rounded-md bg-muted';
  const merged = className ? `${base} ${className}` : base;
  return <div className={merged} {...props} />;
}

export default Skeleton;
