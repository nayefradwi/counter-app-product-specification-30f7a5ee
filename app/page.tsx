import * as React from 'react';
import { Card } from '@/components/ui/card';
import { CounterWidget } from '@/components/counter-widget';

/**
 * Final, polished single-page layout for the counter app.
 *
 * The page is rendered as a full-viewport flex container so the card
 * (and the `<CounterWidget />` inside it) is perfectly centered both
 * horizontally and vertically on every viewport size from a 320px
 * mobile phone up through a wide desktop. A neutral muted background
 * provides contrast for the card without being garish.
 */
export default function HomePage() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-muted/40 px-4 py-10 sm:px-6">
      <h1 className="mb-8 text-2xl font-semibold tracking-tight">Counter</h1>

      <Card className="w-full max-w-md p-10 shadow-md">
        <CounterWidget />
      </Card>
    </main>
  );
}
