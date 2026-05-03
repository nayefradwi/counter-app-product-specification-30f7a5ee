'use client';

import * as React from 'react';

export interface CounterDisplayProps {
  value: number | null;
  loading: boolean;
}

/**
 * CounterDisplay renders the current counter value in a large, prominent
 * typographic style. While `loading` is true (or `value` is null) it shows
 * an animated pulse skeleton placeholder where the number would appear.
 *
 * The numeric region is wrapped in an `aria-live="polite"` region so that
 * screen readers announce updates when the value changes.
 */
export function CounterDisplay({ value, loading }: CounterDisplayProps) {
  const showSkeleton = loading || value === null;

  return (
    <div
      aria-live="polite"
      aria-busy={showSkeleton}
      role="status"
      className="flex items-center justify-center w-full min-h-[10rem]"
    >
      {showSkeleton ? (
        <div
          data-testid="counter-display-skeleton"
          aria-label="Loading counter value"
          className="h-32 w-48 rounded-lg bg-muted animate-pulse"
        />
      ) : (
        <span
          data-testid="counter-display-value"
          className="text-8xl font-bold tabular-nums tracking-tight"
        >
          {value}
        </span>
      )}
    </div>
  );
}

export default CounterDisplay;
