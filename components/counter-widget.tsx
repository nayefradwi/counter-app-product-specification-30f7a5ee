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
 *    `/api/counter/increment` and `/api/counter/decrement`,
 *  - disables each mutation button while *its* request is in flight (the
 *    increment path uses React 19 `useTransition` so the "+" button has
 *    its own pending flag and is independent of the decrement button),
 *  - surfaces a subtle inline error message if any request fails.
 *
 * The component accepts no props; it is intended to be dropped into a
 * page as a standalone widget.
 */
export function CounterWidget() {
  const [value, setValue] = React.useState<number | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);
  // Dedicated pending flag for the "+" button (task: 'Wire + button to
  // increment API'). Using `useTransition` here gives us a non-blocking,
  // React-managed pending flag scoped to the increment action only.
  const [incrementPending, startIncrementTransition] = React.useTransition();
  // Decrement keeps a plain `useState` flag for symmetry with how the
  // existing widget tracked in-flight mutations.
  const [decrementPending, setDecrementPending] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);

  // Initial load.
  //
  // On every page load / refresh / new tab, this `useEffect` fires once on
  // mount and pulls the canonical counter value from `GET /api/counter`,
  // which is backed by the persisted `counters` row in Postgres. This is
  // the contract that guarantees the displayed value is sourced from the
  // database — never from React state left over from a previous session
  // or from a stale browser cache (we pass `cache: 'no-store'`). Until
  // the fetch resolves, `value` is `null` and the render path below shows
  // a Skeleton so users see an explicit loading state instead of a flash
  // of an incorrect "0".
  //
  // We use an `AbortController` so that if the component unmounts mid-
  // flight (e.g. fast navigation away), the underlying request is
  // actually cancelled rather than just having its result ignored.
  React.useEffect(() => {
    const controller = new AbortController();

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch('/api/counter', {
          method: 'GET',
          headers: { Accept: 'application/json' },
          cache: 'no-store',
          signal: controller.signal,
        });

        if (!res.ok) {
          throw new Error(`Request failed with status ${res.status}`);
        }

        const data = (await res.json()) as CounterResponse;

        if (controller.signal.aborted) return;

        if (typeof data?.value !== 'number') {
          throw new Error('Malformed response from /api/counter');
        }

        setValue(data.value);
      } catch (err) {
        // Ignore abort errors triggered by unmount — they are expected.
        if (controller.signal.aborted) return;
        const message =
          err instanceof Error ? err.message : 'Failed to load counter';
        setError(message);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      controller.abort();
    };
  }, []);

  /**
   * Shared POST helper used by both the increment and decrement paths.
   * Throws on non-2xx or malformed JSON so the caller can surface the
   * error to the user.
   */
  const postMutation = React.useCallback(
    async (action: Action): Promise<number> => {
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

      return data.value;
    },
    [],
  );

  /**
   * Click handler for the "+" button. Calls `POST /api/counter/increment`,
   * disables itself while in flight via `useTransition`, and updates the
   * displayed counter value with the response payload. On failure, an
   * inline error message is shown beneath the controls.
   */
  const handleIncrement = React.useCallback(() => {
    setError(null);
    startIncrementTransition(async () => {
      try {
        const next = await postMutation('increment');
        setValue(next);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to increment counter';
        setError(message);
      }
    });
  }, [postMutation]);

  /**
   * Click handler for the "−" button. Mirrors the increment path but uses
   * a plain `useState` pending flag.
   */
  const handleDecrement = React.useCallback(async () => {
    setDecrementPending(true);
    setError(null);
    try {
      const next = await postMutation('decrement');
      setValue(next);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to decrement counter';
      setError(message);
    } finally {
      setDecrementPending(false);
    }
  }, [postMutation]);

  const showSkeleton = loading || value === null;
  // While *any* mutation is in flight we disable *both* buttons to prevent
  // double-submits (e.g. a user mashing "+" then "−" before the first POST
  // resolves and racing two concurrent writes against the counter row).
  // Each button still carries its own `aria-busy` so assistive tech can
  // tell which action is actually pending.
  const anyMutationPending = incrementPending || decrementPending;
  // Buttons are also disabled until the initial GET resolves, otherwise a
  // user could fire a mutation before we know the current value.
  const incrementDisabled = showSkeleton || anyMutationPending;
  const decrementDisabled = showSkeleton || anyMutationPending;

  return (
    <section
      aria-label="Counter"
      className="flex w-full flex-col items-center justify-center gap-6"
    >
      <div
        className="flex min-h-[6rem] w-full flex-col items-center justify-center gap-2"
        aria-busy={showSkeleton || incrementPending || decrementPending}
      >
        {showSkeleton ? (
          <>
            <Skeleton
              data-testid="counter-widget-skeleton"
              aria-label="Loading counter value"
              className="h-24 w-40"
            />
            <p
              data-testid="counter-widget-loading-caption"
              className="text-sm text-muted-foreground"
            >
              Loading counter…
            </p>
          </>
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
          aria-busy={incrementPending}
          onClick={handleIncrement}
          disabled={incrementDisabled}
        >
          +
        </Button>
        <Button
          size="lg"
          variant="outline"
          aria-label="Decrement counter"
          aria-busy={decrementPending}
          onClick={() => void handleDecrement()}
          disabled={decrementDisabled}
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
