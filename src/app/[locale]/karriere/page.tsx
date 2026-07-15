export default function KarrierePage() {
  return (
    <main className="max-w-[820px] mx-auto px-6 py-24 text-on-surface">
      <h1 className="font-display-lg text-headline-lg mb-8">Karriere</h1>

      <div className="font-body-md text-body-md text-secondary space-y-6">
        <p>
          Aktuell haben wir keine offenen Stellen ausgeschrieben. Wir freuen uns aber immer über
          Initiativbewerbungen von motivierten Fachkräften aus der Kosmetik- und Beautybranche.
        </p>
        <p>
          Senden Sie uns Ihre Bewerbungsunterlagen gerne per E-Mail an{" "}
          <a href="mailto:info@epilisse.de" className="text-primary hover:underline">
            info@epilisse.de
          </a>.
        </p>
      </div>
    </main>
  );
}
