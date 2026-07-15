export default function ImpressumPage() {
  return (
    <main className="max-w-[820px] mx-auto px-6 py-24 text-on-surface">
      <h1 className="font-display-lg text-headline-lg mb-8">Impressum</h1>

      {/* TODO: Standardtext — vor Livegang anwaltlich prüfen lassen (u. a.
          echte Firmenadresse/Handelsregister/USt-IdNr. statt Platzhalter einsetzen). */}

      <div className="font-body-md text-body-md text-secondary space-y-6">
        <section>
          <h2 className="font-headline-sm text-headline-sm text-on-surface mb-2">Angaben gemäß § 5 TMG</h2>
          <p>
            EPILISSE<br />
            ADRESSE PLACEHOLDER, München, Deutschland
          </p>
        </section>

        <section>
          <h2 className="font-headline-sm text-headline-sm text-on-surface mb-2">Kontakt</h2>
          <p>
            Telefon: +49 (0) 89 XXX XXX XX<br />
            E-Mail: info@epilisse.de
          </p>
        </section>

        <section>
          <h2 className="font-headline-sm text-headline-sm text-on-surface mb-2">Umsatzsteuer-ID</h2>
          <p>
            Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz: USt-IdNr. PLACEHOLDER
          </p>
        </section>

        <section>
          <h2 className="font-headline-sm text-headline-sm text-on-surface mb-2">Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</h2>
          <p>
            EPILISSE<br />
            ADRESSE PLACEHOLDER, München, Deutschland
          </p>
        </section>

        <section>
          <h2 className="font-headline-sm text-headline-sm text-on-surface mb-2">Streitschlichtung</h2>
          <p>
            Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{" "}
            https://ec.europa.eu/consumers/odr/. Wir sind nicht verpflichtet und nicht bereit, an einem
            Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
          </p>
        </section>
      </div>
    </main>
  );
}
