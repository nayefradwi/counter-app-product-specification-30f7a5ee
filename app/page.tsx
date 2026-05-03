'use client';

import * as React from 'react';
import { CounterDisplay } from '@/components/CounterDisplay';

interface CounterResponse {
  value: number;
}

export default function HomePage() {
  const [value, setValue] = React.useState<number | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    async function fetchCounter() {
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

    void fetchCounter();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center gap-8 p-6">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
        Counter App
      </h1>

      {error ? (
        <div
          role="alert"
          className="max-w-md rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-center text-sm text-destructive"
        >
          <p className="font-medium">Couldn&apos;t load the counter.</p>
          <p className="mt-1 opacity-80">{error}</p>
        </div>
      ) : (
        <CounterDisplay value={value} loading={loading} />
      )}

      <div
        className="flex items-center justify-center gap-4"
        aria-label="Counter controls"
      >
        {/* '−' decrement button slot — wired in a later task */}
        {/* '+' increment button slot — wired in a later task */}
      </div>
    </main>
  );
}
