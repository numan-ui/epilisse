export default function DatenschutzPage() {
  return (
    <main className="max-w-[820px] mx-auto px-6 py-24 text-on-surface">
      <h1 className="font-display-lg text-headline-lg mb-8">Datenschutzerklärung</h1>

      {/* TODO: Standardtext — vor Livegang anwaltlich prüfen lassen (u. a.
          echte Firmenadresse/Kontaktdaten statt Platzhalter einsetzen,
          Auftragsverarbeiter wie Supabase/Resend im AV-Verzeichnis führen). */}

      <div className="font-body-md text-body-md text-secondary space-y-6">
        <section>
          <h2 className="font-headline-sm text-headline-sm text-on-surface mb-2">1. Verantwortlicher</h2>
          <p>
            Verantwortlich für die Datenverarbeitung auf dieser Website ist:<br />
            EPILISSE<br />
            ADRESSE PLACEHOLDER, München, Deutschland<br />
            Telefon: +49 (0) 89 XXX XXX XX<br />
            E-Mail: info@epilisse.de
          </p>
        </section>

        <section>
          <h2 className="font-headline-sm text-headline-sm text-on-surface mb-2">2. Welche Daten wir verarbeiten</h2>
          <p>
            Wenn Sie über unsere Website einen Termin anfragen, verarbeiten wir folgende Daten: Name, E-Mail-Adresse,
            Telefonnummer, gewählte Behandlung(en), gewünschter Termin sowie ggf. von Ihnen angegebene Notizen. Diese
            Daten werden benötigt, um Ihre Terminanfrage zu bearbeiten, mit Ihnen in Kontakt zu treten und die
            Behandlung durchzuführen.
          </p>
        </section>

        <section>
          <h2 className="font-headline-sm text-headline-sm text-on-surface mb-2">3. Rechtsgrundlage und Zweck der Verarbeitung</h2>
          <p>
            Die Verarbeitung Ihrer Daten zur Terminvereinbarung und -abwicklung erfolgt auf Grundlage Ihrer
            Einwilligung (Art. 6 Abs. 1 lit. a DSGVO) sowie zur Erfüllung eines Vertrags bzw. vorvertraglicher
            Maßnahmen (Art. 6 Abs. 1 lit. b DSGVO). Erinnerungs-E-Mails zu einem von Ihnen gebuchten Termin versenden
            wir auf derselben Grundlage. Möchten Sie zusätzlich Informationen zu Angeboten und Aktionen per E-Mail
            erhalten, verarbeiten wir Ihre E-Mail-Adresse hierfür nur mit Ihrer gesonderten, jederzeit widerruflichen
            Einwilligung (Art. 6 Abs. 1 lit. a DSGVO).
          </p>
        </section>

        <section>
          <h2 className="font-headline-sm text-headline-sm text-on-surface mb-2">4. Speicherdauer</h2>
          <p>
            Wir speichern Ihre Daten so lange, wie es für die Terminverwaltung und die Erfüllung unserer vertraglichen
            und gesetzlichen (insbesondere steuer- und handelsrechtlichen) Aufbewahrungspflichten erforderlich ist.
            Nach Ablauf dieser Fristen bzw. nach Widerruf Ihrer Einwilligung werden Ihre Daten gelöscht, soweit keine
            gesetzliche Aufbewahrungspflicht entgegensteht.
          </p>
        </section>

        <section>
          <h2 className="font-headline-sm text-headline-sm text-on-surface mb-2">5. Weitergabe an Dritte / Auftragsverarbeiter</h2>
          <p>
            Zur Bereitstellung unserer Website und zum Versand von E-Mails setzen wir Dienstleister ein (u. a.
            Datenbank-/Hosting-Anbieter und einen E-Mail-Versanddienst), mit denen jeweils Verträge zur
            Auftragsverarbeitung gemäß Art. 28 DSGVO bestehen. Eine Weitergabe Ihrer Daten an sonstige Dritte erfolgt
            nicht, es sei denn, wir sind gesetzlich dazu verpflichtet.
          </p>
        </section>

        <section>
          <h2 className="font-headline-sm text-headline-sm text-on-surface mb-2">6. Ihre Rechte</h2>
          <p>
            Sie haben das Recht auf Auskunft, Berichtigung, Löschung und Einschränkung der Verarbeitung Ihrer Daten
            sowie auf Datenübertragbarkeit. Eine erteilte Einwilligung können Sie jederzeit mit Wirkung für die
            Zukunft widerrufen, z. B. per E-Mail an info@epilisse.de. Zudem steht Ihnen ein Beschwerderecht bei einer
            Datenschutzaufsichtsbehörde zu.
          </p>
        </section>
      </div>
    </main>
  );
}
