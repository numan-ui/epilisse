export default function AGBPage() {
  return (
    <main className="max-w-[820px] mx-auto px-6 py-24 text-on-surface">
      <h1 className="font-display-lg text-headline-lg mb-8">Allgemeine Geschäftsbedingungen</h1>

      {/* TODO: Standardtext — vor Livegang anwaltlich prüfen lassen (u. a.
          echte Firmenadresse statt Platzhalter einsetzen, Storno-/Ausfallfristen
          und Gewährleistungsregelungen gegen tatsächliche Salon-Policy abgleichen). */}

      <div className="font-body-md text-body-md text-secondary space-y-6">
        <section>
          <h2 className="font-headline-sm text-headline-sm text-on-surface mb-2">1. Geltungsbereich</h2>
          <p>
            Diese Allgemeinen Geschäftsbedingungen gelten für alle Behandlungsverträge zwischen EPILISSE,
            ADRESSE PLACEHOLDER, München, Deutschland, und den Kundinnen und Kunden, die über unsere Website
            oder direkt im Studio einen Termin buchen.
          </p>
        </section>

        <section>
          <h2 className="font-headline-sm text-headline-sm text-on-surface mb-2">2. Terminvereinbarung</h2>
          <p>
            Termine können online über unsere Website oder telefonisch vereinbart werden. Mit der Buchung
            kommt ein Behandlungsvertrag über die gewählte Leistung zustande.
          </p>
        </section>

        <section>
          <h2 className="font-headline-sm text-headline-sm text-on-surface mb-2">3. Terminabsage und Stornierung</h2>
          <p>
            Termine können bis 24 Stunden vor dem vereinbarten Zeitpunkt kostenfrei storniert oder verschoben
            werden. Bei späteren Absagen oder Nichterscheinen behalten wir uns vor, die vereinbarte Leistung
            ganz oder teilweise in Rechnung zu stellen.
          </p>
        </section>

        <section>
          <h2 className="font-headline-sm text-headline-sm text-on-surface mb-2">4. Preise und Zahlung</h2>
          <p>
            Es gelten die zum Zeitpunkt der Buchung im Studio bzw. auf der Website ausgewiesenen Preise. Die
            Zahlung erfolgt vor Ort im Studio, sofern nicht anders vereinbart.
          </p>
        </section>

        <section>
          <h2 className="font-headline-sm text-headline-sm text-on-surface mb-2">5. Gewährleistung</h2>
          <p>
            Für erbrachte Behandlungen gelten die gesetzlichen Gewährleistungsregelungen. Beanstandungen sind
            uns zeitnah nach der Behandlung mitzuteilen.
          </p>
        </section>

        <section>
          <h2 className="font-headline-sm text-headline-sm text-on-surface mb-2">6. Haftung</h2>
          <p>
            Wir haften nur für Schäden, die auf einer vorsätzlichen oder grob fahrlässigen Pflichtverletzung
            beruhen, soweit gesetzlich nichts anderes bestimmt ist.
          </p>
        </section>

        <section>
          <h2 className="font-headline-sm text-headline-sm text-on-surface mb-2">7. Schlussbestimmungen</h2>
          <p>
            Es gilt das Recht der Bundesrepublik Deutschland. Sollten einzelne Bestimmungen dieser AGB
            unwirksam sein, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt.
          </p>
        </section>
      </div>
    </main>
  );
}
