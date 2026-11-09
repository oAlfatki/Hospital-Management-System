import React from 'react';
import { AppProviders } from '@/src/core/providers';
import { AppRouter } from '@/src/router';

export default function App() {
  return (
    <AppProviders>
      <React.Suspense fallback={<div role="status" className="p-8 text-center">Loading…</div>}><AppRouter /></React.Suspense>
    </AppProviders>
  );
}
