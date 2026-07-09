import { Suspense } from 'react';
import ConsentForm from './ConsentForm';

export default function EinwilligungPage() {
  return (
    <main className="max-w-[640px] mx-auto px-6 py-24 text-on-surface">
      <h1 className="font-display-lg text-headline-lg mb-8">Ihre Einwilligung</h1>
      <Suspense fallback={<p className="font-body-md text-secondary">Lädt…</p>}>
        <ConsentForm />
      </Suspense>
    </main>
  );
}
