'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface CounterResponse {
  value: number;
}

type Action = 'increment' | 'decrement';

/**
 * CounterWidget is a self-contained client component that:
 *  - fetches the current counter value from `GET /api/counter` on mount
 *    (rendering a Skeleton while the request is in flight),
 *  - displays the value in a large, accessible aria-live region so screen
 *    readers announce updates,
 *  - exposes "+" / "−" buttons that POST to
 *    `/api/counter/increment` and `/api/counter/decrement`, disabling
 *    both buttons while a mutation request is in flight,
 *  - surfaces a subtle inline error message if any request fails.
 *
 * The component accepts no props; it is intended to be dropped into a
 * page as a standalone widget.
 */
export function CounterWidget() {
  const [value, setValue] = React.useState<number | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [pending, setPending] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);

  // Initial load.
  React.useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch('/api/counter', {
          method: 'GET',
          headers: { Accept: 'application/json' },
          cache: 'no-store',
        });

        if (!res.ok) {
          throw new Error(`Request failed with status ${res.status}`);
        }

        const data = (await res.json()) as CounterResponse;

        if (cancelled) return;

        if (typeof data?.value !== 'number') {
          throw new Error('Malformed response from /api/counter');
        }

        setValue(data.value);
      } catch (err) {
        if (cancelled) return;
        const message =
          err instanceof Error ? err.message : 'Failed to load counter';
        setError(message);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  const mutate = React.useCallback(async (action: Action) => {
    setPending(true);
    setError(null);

    try {
      const res = await fetch(`/api/counter/${action}`, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        cache: 'no-store',
      });

      if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}`);
      }

      const data = (await res.json()) as CounterResponse;

      if (typeof data?.value !== 'number') {
        throw new Error(`Malformed response from /api/counter/${action}`);
      }

      setValue(data.value);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : `Failed to ${action} counter`;
      setError(message);
    } finally {
      setPending(false);
    }
  }, []);

  const showSkeleton = loading || value === null;
  const buttonsDisabled = showSkeleton || pending;

  return (
    <section
      aria-label="Counter"
      className="flex w-full flex-col items-center justify-center gap-6"
    >
      <div
        className="flex min-h-[6rem] w-full items-center justify-center"
        aria-busy={showSkeleton || pending}
      >
        {showSkeleton ? (
          <Skeleton
            data-testid="counter-widget-skeleton"
            aria-label="Loading counter value"
            className="h-24 w-40"
          />
        ) : (
          <span
            data-testid="counter-widget-value"
            tabIndex={0}
            aria-live="polite"
            aria-atomic="true"
            className="text-7xl font-bold tabular-nums tracking-tight"
          >
            {value}
          </span>
        )}
      </div>

      <div
        className="flex items-center justify-center gap-4"
        aria-label="Counter controls"
      >
        <Button
          size="lg"
          aria-label="Increment counter"
          onClick={() => void mutate('increment')}
          disabled={buttonsDisabled}
        >
          +
        </Button>
        <Button
          size="lg"
          variant="outline"
          aria-label="Decrement counter"
          onClick={() => void mutate('decrement')}
          disabled={buttonsDisabled}
        >
          −
        </Button>
      </div>

      {error ? (
        <p
          role="alert"
          data-testid="counter-widget-error"
          className="text-sm text-muted-foreground"
        >
          {error}
        </p>
      ) : null}
    </section>
  );
}

export default CounterWidget;
