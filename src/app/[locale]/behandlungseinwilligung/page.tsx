export default function BehandlungseinwilligungPage() {
  return (
    <main className="max-w-[820px] mx-auto px-6 py-24 text-on-surface">
      <h1 className="font-display-lg text-headline-lg mb-8">Behandlungseinwilligung</h1>

      {/* TODO: Standardtext — vor Livegang anwaltlich prüfen lassen (medizinisch/
          kosmetisch fundierte Risikoaufklärung je nach tatsächlich angebotenen
          Behandlungen, insbesondere Laser-Haarentfernung, individuell ergänzen). */}

      <div className="font-body-md text-body-md text-secondary space-y-6">
        <section>
          <h2 className="font-headline-sm text-headline-sm text-on-surface mb-2">1. Zweck dieser Einwilligung</h2>
          <p>
            Kosmetische Behandlungen wie Laser-Haarentfernung, Gesichtsästhetik, Body-Contouring oder Injectables
            greifen in Ihr Hautbild bzw. Ihren Körper ein und können Risiken bergen. Mit dieser Einwilligung
            bestätigen Sie, über Ablauf, mögliche Risiken und Nachsorge der von Ihnen gebuchten Behandlung informiert
            worden zu sein, und stimmen der Durchführung zu.
          </p>
        </section>

        <section>
          <h2 className="font-headline-sm text-headline-sm text-on-surface mb-2">2. Allgemeine Risiken und Kontraindikationen</h2>
          <p>
            Je nach Behandlung können vorübergehende Hautrötungen, Schwellungen, Pigmentveränderungen oder
            Empfindlichkeiten auftreten. Bestimmte Vorerkrankungen, Schwangerschaft, Medikamenteneinnahme (u. a.
            photosensibilisierende Präparate) oder frische Sonnenbräune können eine Behandlung ausschließen oder
            eine besondere Vorsicht erfordern. Bitte informieren Sie uns vor der Behandlung über relevante
            gesundheitliche Umstände.
          </p>
        </section>

        <section>
          <h2 className="font-headline-sm text-headline-sm text-on-surface mb-2">3. Verarbeitung gesundheitsbezogener Angaben</h2>
          <p>
            Soweit Sie uns im Rahmen der Terminanfrage oder vor Ort gesundheitsbezogene Angaben mitteilen (z. B.
            Vorerkrankungen, Kontraindikationen), verarbeiten wir diese besonderen Kategorien personenbezogener Daten
            gemäß Art. 9 Abs. 2 lit. a DSGVO ausschließlich mit Ihrer ausdrücklichen Einwilligung und nur zum Zweck
            der sicheren Durchführung Ihrer Behandlung. Nähere Informationen zur Datenverarbeitung finden Sie in
            unserer Datenschutzerklärung.
          </p>
        </section>

        <section>
          <h2 className="font-headline-sm text-headline-sm text-on-surface mb-2">4. Nachsorge</h2>
          <p>
            Nach der Behandlung geben wir Ihnen individuelle Pflegehinweise mit. Die Nichtbeachtung dieser Hinweise
            kann das Behandlungsergebnis beeinträchtigen oder das Risiko unerwünschter Nebenwirkungen erhöhen.
          </p>
        </section>

        <section>
          <h2 className="font-headline-sm text-headline-sm text-on-surface mb-2">5. Widerruf</h2>
          <p>
            Sie können diese Einwilligung jederzeit mit Wirkung für die Zukunft widerrufen, z. B. per E-Mail an
            info@epilisse.de. Bereits begonnene Behandlungen sind hiervon nicht betroffen.
          </p>
        </section>
      </div>
    </main>
  );
}
