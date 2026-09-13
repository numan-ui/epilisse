/**
 * FAQ chatbot source content — one free-text box per category, per locale
 * (see src/lib/faq/parseFaqChat.ts for the "F: .../A: ..." format it's
 * written in). Kept separate from the SiteContent bundle in
 * admin/behandlungen/data.ts since it has its own dedicated table/API
 * (faq_chat_content, /api/faq-chat) rather than living inside the
 * site_content jsonb blob.
 */
export type FaqChatCategoryContent = Record<string, string>;
export type FaqChatContent = Record<string, FaqChatCategoryContent>; // keyed by locale ('de' | 'en')

/**
 * Seed draft, written by Claude as a starting point — the admin edits/extends
 * this from /admin/faq-bot. Category keys match CATEGORIES[].id (laser,
 * gesicht, mani, aktionen), plus 'general' for studio-wide questions not tied
 * to one treatment (hours, address, payment, cancellation, booking).
 */
export const INIT_FAQ_CHAT_CONTENT: FaqChatContent = {
  de: {
    general: `F: Wo befindet sich das Studio?
A: Wir befinden uns in der Berlepschstraße 2, 81373 München-Sendling.

F: Wie sind eure Öffnungszeiten?
A: Montag bis Freitag 09:00–19:00/20:00 Uhr, Samstag 10:00–17:00 Uhr, Sonntag geschlossen. Die genauen Zeiten finden Sie auf der Kontakt-Seite.

F: Wie kann ich einen Termin buchen?
A: Am einfachsten direkt über unser Online-Buchungssystem auf der Webseite — klicken Sie auf "Termin buchen" und wählen Sie Behandlung, Datum und Uhrzeit.

F: Kann ich meinen Termin verschieben oder stornieren?
A: Ja, das ist bis 24 Stunden vor dem Termin kostenlos möglich. Bitte melden Sie sich telefonisch oder per E-Mail bei uns.

F: Welche Zahlungsmethoden akzeptiert ihr?
A: Wir akzeptieren Barzahlung sowie gängige Kartenzahlungen vor Ort im Studio.

F: Muss ich für den ersten Termin etwas mitbringen?
A: Nein, bringen Sie einfach sich selbst mit. Bei bestimmten Behandlungen (z. B. Laser) führen wir vorab ein kurzes Beratungsgespräch.

F: Bekomme ich eine Erinnerung an meinen Termin?
A: Ja, Sie erhalten automatisch eine Erinnerung per E-Mail vor Ihrem Termin.

F: Bietet ihr Gutscheine an?
A: Ja, sprechen Sie uns gerne im Studio oder per Kontaktformular an, wir erstellen Ihnen gerne einen Gutschein.

F: Wie erreiche ich euch telefonisch oder per E-Mail?
A: Alle Kontaktdaten finden Sie auf unserer Kontakt-Seite — dort können Sie uns auch direkt eine Nachricht schreiben.

F: Ist das Studio gut mit öffentlichen Verkehrsmitteln erreichbar?
A: Ja, das Studio liegt zentral in München-Sendling und ist gut angebunden. Details zur Anfahrt finden Sie auf der Kontakt-Seite.

F: Gibt es Parkplätze in der Nähe?
A: In der Umgebung des Studios finden Sie öffentliche Parkmöglichkeiten. Details erfragen Sie gerne bei der Terminbestätigung.

F: Was passiert, wenn ich zu spät zu meinem Termin komme?
A: Bitte informieren Sie uns kurz telefonisch — je nach Verspätung kann sich die Behandlungszeit verkürzen oder der Termin muss verschoben werden.

F: Kann ich eine Begleitperson mitbringen?
A: Aus Platzgründen bitten wir, nach Möglichkeit alleine zum Termin zu kommen, außer bei besonderen Absprachen.

F: Bietet ihr auch Behandlungen für Männer an?
A: Ja, alle unsere Behandlungen stehen allen Geschlechtern offen.`,

    laser: `F: Wie funktioniert die Laser-Haarentfernung?
A: Wir arbeiten mit moderner Diodenlaser-Technologie, die Haarwurzeln gezielt und nachhaltig deaktiviert — schonend und für die meisten Hauttypen geeignet.

F: Tut die Laser-Behandlung weh?
A: Die meisten Kundinnen empfinden nur ein leichtes, warmes Kribbeln. Sensible Zonen können etwas empfindlicher sein, die Behandlung ist aber gut tolerierbar.

F: Wie viele Sitzungen brauche ich?
A: Je nach Hauttyp und Haarstruktur sind meist 6–8 Sitzungen im Abstand von 4–6 Wochen nötig, für dauerhaft glatte Haut.

F: Welche Körperzonen kann ich lasern lassen?
A: Alle gängigen Zonen — u. a. Oberlippe, Gesicht, Achseln, Bikinizone, Beine und Rücken.

F: Was kostet die Laser-Haarentfernung?
A: Die Preise variieren je nach Zone und Umfang. Eine aktuelle Übersicht finden Sie auf unserer Preise-Seite.

F: Muss ich mich vor dem Termin rasieren?
A: Ja, die zu behandelnde Zone sollte am Vortag rasiert (nicht gewaxt oder gezupft) werden, damit der Laser optimal wirken kann.

F: Kann ich nach der Behandlung in die Sonne?
A: Direkte Sonneneinstrahlung sollte für einige Tage vor und nach der Behandlung vermieden werden, um die Haut nicht zu reizen.

F: Für wen ist die Laser-Haarentfernung nicht geeignet?
A: Bei Schwangerschaft, bestimmten Hauterkrankungen oder frischer Bräunung sprechen wir vorab gemeinsam ab, ob und wann eine Behandlung sinnvoll ist.

F: Wie schnell sehe ich Ergebnisse?
A: Erste sichtbare Effekte zeigen sich meist schon nach 2–3 Sitzungen, das volle Ergebnis nach der kompletten Serie.

F: Ist die Behandlung dauerhaft?
A: Nach der vollständigen Sitzungsserie ist das Ergebnis sehr langanhaltend, gelegentliche Auffrischungstermine können sinnvoll sein.

F: Wie lange dauert eine Laser-Sitzung?
A: Je nach Zone zwischen 15 und 90 Minuten, z. B. Oberlippe ca. 15 Minuten, Beine komplett ca. 90 Minuten.

F: Kann ich während meiner Periode lasern lassen?
A: Ja, das ist kein Problem, mit Ausnahme des Bikinibereichs — hier empfehlen wir, den Termin gegebenenfalls zu verschieben.

F: Was sollte ich vor der ersten Behandlung beachten?
A: Vermeiden Sie Sonnenbäder und Solarium für ca. 2 Wochen vorher und rasieren Sie die Zone am Vortag.

F: Wirkt Laser auch bei hellen oder roten Haaren?
A: Der Diodenlaser wirkt am besten bei dunklen Haaren mit ausreichend Melanin. Bei sehr hellen oder roten Haaren ist die Wirkung eingeschränkt — wir beraten Sie gerne individuell.

F: Wie oft kann ich zwischen den Sitzungen einen Termin machen?
A: Ein Abstand von 4–6 Wochen zwischen den Sitzungen ist optimal, damit der Haarwachstumszyklus richtig erfasst wird.

F: Ist Laser-Haarentfernung auch für Männer geeignet?
A: Ja, wir behandeln alle Geschlechter — beliebte Zonen bei Männern sind Rücken, Brust und Bartkontur.

F: Kann ich direkt nach der Behandlung duschen?
A: Ja, leichtes Duschen mit lauwarmem Wasser ist unbedenklich. Auf heiße Bäder, Sauna und Peeling verzichten Sie besser für 24–48 Stunden.`,

    gesicht: `F: Was ist ein HydraFacial?
A: HydraFacial ist eine nicht-invasive Gesichtsbehandlung mit patentierter Vortex-Technologie, die Poren tiefenreinigt und die Haut sofort sichtbar strahlen lässt.

F: Welche Gesichtsbehandlung passt zu meinem Hauttyp?
A: Das besprechen wir gerne persönlich bei der Beratung vor Ort — je nach Hautbedürfnis empfehlen wir HydraFacial, Microneedling oder ein Chemical Peeling.

F: Gibt es nach der Behandlung eine Ausfallzeit?
A: Beim HydraFacial nicht — Sie können direkt danach wieder Make-up auftragen und Ihrem Alltag nachgehen. Bei Microneedling kann die Haut kurz gerötet sein.

F: Wie oft sollte ich eine Gesichtsbehandlung machen lassen?
A: Für sichtbare, anhaltende Ergebnisse empfehlen wir eine Behandlung alle 4–6 Wochen.

F: Was kostet eine Gesichtsbehandlung?
A: Die Preise unterscheiden sich je nach Behandlung (Basic, Premium, Microneedling, Peeling). Details finden Sie auf unserer Preise-Seite.

F: Ist Microneedling schmerzhaft?
A: Es wird meist als leichtes Kratzen empfunden, eine Betäubungscreme kann bei Bedarf verwendet werden.

F: Was bewirkt ein Chemical Peeling?
A: Es entfernt abgestorbene Hautzellen, verfeinert das Hautbild und reduziert Pigmentflecken und feine Linien.

F: Wie lange dauert eine Gesichtsbehandlung?
A: Je nach gewählter Behandlung zwischen 30 und 90 Minuten.

F: Was ist der Unterschied zwischen HydraFacial Basic und Premium?
A: Premium beinhaltet zusätzliche Wirkstoffkomplexe und eine intensivere Behandlungsstufe für tiefere Ergebnisse — ideal bei stark beanspruchter Haut.

F: Hilft eine Gesichtsbehandlung gegen Akne?
A: Ja, HydraFacial und bestimmte Peelings können unreine Haut spürbar verbessern. Wir stimmen die Behandlung individuell auf Ihre Haut ab.

F: Kann ich eine Gesichtsbehandlung während der Schwangerschaft machen lassen?
A: Viele Behandlungen sind grundsätzlich möglich, manche Wirkstoffe und Peelings jedoch nicht. Bitte informieren Sie uns vorab, damit wir das passende Protokoll wählen.

F: Muss ich mich nach der Behandlung besonders pflegen?
A: Wir geben Ihnen nach jeder Behandlung individuelle Pflegehinweise mit, meist reicht ausreichend Feuchtigkeit und Sonnenschutz.

F: Für welchen Hauttyp ist Microneedling geeignet?
A: Microneedling eignet sich für die meisten Hauttypen, besonders bei Narben, groben Poren und feinen Linien.

F: Wie schnell zeigt sich das Ergebnis eines Peelings?
A: Meist ist die Haut schon nach 1–2 Tagen sichtbar frischer, das volle Ergebnis zeigt sich nach ca. einer Woche.`,

    mani: `F: Was ist der Unterschied zwischen klassischer und Gel-Maniküre?
A: Die klassische Maniküre wird mit normalem Nagellack lackiert, die Gel-Maniküre hält deutlich länger (bis zu 4 Wochen) und wird mit UV-Licht ausgehärtet.

F: Wie lange hält eine Gel-Maniküre?
A: In der Regel bis zu 3–4 Wochen, ohne abzusplittern.

F: Bietet ihr auch Pediküre an?
A: Ja, klassische und Spa-Pediküre sowie Kombi-Pakete mit Maniküre.

F: Was ist in einer Spa-Pediküre enthalten?
A: Ein entspannendes Fußbad, Hornhautentfernung, Nagelpflege und eine Fußmassage.

F: Verwendet ihr bestimmte Marken?
A: Ja, wir arbeiten mit Premium-Marken wie OPI und CND Shellac.

F: Wie hygienisch sind eure Instrumente?
A: Alle Instrumente werden nach höchsten Hygienestandards sterilisiert, Einweg-Feilen und sterile Abdeckungen sind bei uns selbstverständlich.

F: Bietet ihr Nageldesign an?
A: Ja, individuelles Nageldesign sowie Nagelverstärkung sind Teil unseres Angebots.

F: Wie lange dauert eine Maniküre?
A: Je nach gewählter Behandlung zwischen 35 und 90 Minuten.

F: Kann ich Gel-Lack selbst entfernen?
A: Wir empfehlen, Gel-Lack immer professionell im Studio entfernen zu lassen, um die Nagelplatte nicht zu beschädigen.

F: Bietet ihr auch Nagelverstärkung an?
A: Ja, für brüchige oder dünne Nägel bieten wir eine spezielle Verstärkung an, die die Nägel stabiler macht.

F: Was kostet die Entfernung von altem Nageldesign?
A: Die Entfernung ist meist separat berechnet, gerne kombinieren wir sie direkt mit einer neuen Maniküre. Details finden Sie auf der Preise-Seite.

F: Kann ich mit Gel-Maniküre schwimmen gehen?
A: Ja, Gel-Lack ist wasserfest und übersteht Schwimmen problemlos.

F: Bietet ihr French Maniküre an?
A: Ja, French Maniküre gehört zu unserem klassischen Angebot.

F: Was tun bei einem eingerissenen Nagel zwischen zwei Terminen?
A: Kommen Sie gerne kurzfristig vorbei, wir reparieren kleine Schäden schnell und unkompliziert.

F: Ist Paraffin-Behandlung für empfindliche Haut geeignet?
A: Ja, die Paraffin-Behandlung ist besonders pflegend und für die meisten Hauttypen gut geeignet.`,

    aktionen: `F: Was sind eure aktuellen Aktionen?
A: Unsere laufenden Angebote finden Sie immer aktuell auf der Aktionen-Seite — dort sehen Sie alle gültigen Kombi-Pakete und Preisvorteile.

F: Wie lange sind Aktionen gültig?
A: Jede Aktion ist zeitlich begrenzt, die genaue Gültigkeit steht direkt beim jeweiligen Angebot.

F: Kann ich eine Aktion mit anderen Rabatten kombinieren?
A: Aktionen gelten als eigenständige Angebote und sind in der Regel nicht mit weiteren Rabatten kombinierbar. Bei Fragen sprechen Sie uns gerne an.

F: Wie buche ich eine Aktion?
A: Genau wie jede andere Behandlung — über unser Online-Buchungssystem, das gewünschte Kombi-Paket einfach auswählen.

F: Muss ich für eine Aktion vorab bezahlen?
A: Nein, die Buchung erfolgt ohne Vorkasse, bezahlt wird wie gewohnt im Studio.

F: Werden Aktionen regelmäßig erneuert?
A: Ja, wir aktualisieren unsere Angebote regelmäßig — es lohnt sich, immer mal wieder auf der Aktionen-Seite vorbeizuschauen.

F: Gilt eine Aktion für Neu- und Bestandskundinnen?
A: In der Regel ja, sofern beim jeweiligen Angebot nichts anderes angegeben ist.

F: Kann ich eine Aktion verschenken?
A: Ja, sprechen Sie uns gerne an — wir erstellen Ihnen dafür einen passenden Gutschein.

F: Was passiert, wenn eine Aktion während meines gebuchten Termins abläuft?
A: Der zum Zeitpunkt der Buchung gültige Preis bleibt für Ihren bereits gebuchten Termin bestehen.

F: Wo sehe ich, wie viele Tage eine Aktion noch läuft?
A: Bei Angeboten mit Enddatum zeigen wir in den letzten 10 Tagen einen Countdown direkt auf der Aktionen-Seite an.`,
  },

  en: {
    general: `F: Where is the studio located?
A: We are located at Berlepschstraße 2, 81373 Munich-Sendling.

F: What are your opening hours?
A: Monday to Friday 9:00 AM–7:00/8:00 PM, Saturday 10:00 AM–5:00 PM, closed Sundays. Exact times are on our Contact page.

F: How do I book an appointment?
A: The easiest way is directly through our online booking system on the website — click "Book appointment" and choose treatment, date and time.

F: Can I reschedule or cancel my appointment?
A: Yes, free of charge up to 24 hours before your appointment. Please contact us by phone or e-mail.

F: What payment methods do you accept?
A: We accept cash as well as standard card payments in the studio.

F: Do I need to bring anything to my first appointment?
A: No, just bring yourself. For certain treatments (e.g. laser) we do a short consultation beforehand.

F: Will I get a reminder for my appointment?
A: Yes, you automatically receive a reminder e-mail before your appointment.

F: Do you offer gift vouchers?
A: Yes, just ask us in the studio or via the contact form and we'll be happy to create one for you.

F: How can I reach you by phone or e-mail?
A: All contact details are on our Contact page, where you can also send us a message directly.

F: Is the studio easy to reach by public transport?
A: Yes, the studio is centrally located in Munich-Sendling and well connected. See the Contact page for directions.

F: Is there parking nearby?
A: There are public parking options near the studio. Feel free to ask when we confirm your appointment.

F: What happens if I'm late for my appointment?
A: Please give us a quick call — depending on how late, treatment time may be shortened or we may need to reschedule.

F: Can I bring someone with me?
A: Due to limited space we ask that you come alone unless otherwise arranged in advance.

F: Do you also offer treatments for men?
A: Yes, all our treatments are open to everyone.`,

    laser: `F: How does laser hair removal work?
A: We use modern diode laser technology that targets and deactivates hair follicles gently and effectively — suitable for most skin types.

F: Does the laser treatment hurt?
A: Most clients feel only a mild, warm tingling. Sensitive areas can feel a bit more, but the treatment is generally well tolerated.

F: How many sessions do I need?
A: Depending on skin and hair type, usually 6–8 sessions spaced 4–6 weeks apart for lasting smooth skin.

F: Which body areas can be treated?
A: All common areas — including upper lip, face, underarms, bikini area, legs and back.

F: How much does laser hair removal cost?
A: Prices vary by area and scope. See our Pricing page for a current overview.

F: Do I need to shave before my appointment?
A: Yes, the area should be shaved (not waxed or plucked) the day before, so the laser can work optimally.

F: Can I go in the sun after treatment?
A: Direct sun exposure should be avoided for a few days before and after treatment to prevent skin irritation.

F: Who shouldn't get laser hair removal?
A: In case of pregnancy, certain skin conditions, or recent tanning, we'll discuss together beforehand whether and when treatment makes sense.

F: How quickly will I see results?
A: Visible effects usually appear after 2–3 sessions, with full results after the complete series.

F: Is the result permanent?
A: After the full session series the result is very long-lasting; occasional touch-up sessions can be useful.

F: How long does one laser session take?
A: Between 15 and 90 minutes depending on the area, e.g. ~15 minutes for the upper lip, ~90 minutes for full legs.

F: Can I get laser treatment during my period?
A: Yes, that's not a problem, except for the bikini area — we recommend rescheduling that appointment if needed.

F: What should I do before my first treatment?
A: Avoid sunbathing and tanning beds for about 2 weeks beforehand and shave the area the day before.

F: Does laser work on light or red hair?
A: The diode laser works best on dark hair with enough melanin. For very light or red hair the effect is limited — we're happy to advise individually.

F: How often can I book sessions apart from each other?
A: A 4–6 week gap between sessions is optimal so the hair growth cycle is properly targeted.

F: Is laser hair removal suitable for men too?
A: Yes, we treat all genders — popular areas for men include back, chest, and beard contouring.

F: Can I shower right after treatment?
A: Yes, a light shower with lukewarm water is fine. It's best to avoid hot baths, sauna, and exfoliation for 24–48 hours.`,

    gesicht: `F: What is a HydraFacial?
A: HydraFacial is a non-invasive facial treatment using patented Vortex technology that deeply cleanses pores and gives skin an immediate visible glow.

F: Which facial treatment suits my skin type?
A: We're happy to discuss this in person during a consultation — depending on your skin's needs we recommend HydraFacial, microneedling, or a chemical peel.

F: Is there downtime after treatment?
A: Not with HydraFacial — you can apply makeup and go about your day right after. With microneedling, skin may be briefly red.

F: How often should I get a facial treatment?
A: For visible, lasting results we recommend a treatment every 4–6 weeks.

F: How much does a facial treatment cost?
A: Prices vary by treatment (Basic, Premium, microneedling, peeling). See our Pricing page for details.

F: Is microneedling painful?
A: It's usually felt as a light scratching sensation; numbing cream can be used if needed.

F: What does a chemical peel do?
A: It removes dead skin cells, refines skin texture, and reduces pigmentation spots and fine lines.

F: How long does a facial treatment take?
A: Between 30 and 90 minutes depending on the treatment chosen.

F: What's the difference between HydraFacial Basic and Premium?
A: Premium includes additional active ingredient boosters and a more intensive treatment level for deeper results — ideal for stressed skin.

F: Does a facial treatment help with acne?
A: Yes, HydraFacial and certain peels can noticeably improve blemish-prone skin. We tailor the treatment to your skin individually.

F: Can I get a facial treatment while pregnant?
A: Many treatments are generally possible, but some active ingredients and peels are not. Please let us know in advance so we can choose the right protocol.

F: Do I need special aftercare following treatment?
A: We give individual aftercare tips after every treatment — usually enough hydration and sun protection is all you need.

F: What skin type is microneedling suitable for?
A: Microneedling suits most skin types, especially for scars, enlarged pores, and fine lines.

F: How quickly do I see results from a peel?
A: Skin usually looks noticeably fresher within 1–2 days, with full results after about a week.`,

    mani: `F: What's the difference between classic and gel manicure?
A: A classic manicure uses regular nail polish, while gel manicure lasts much longer (up to 4 weeks) and is cured under UV light.

F: How long does a gel manicure last?
A: Typically up to 3–4 weeks without chipping.

F: Do you also offer pedicures?
A: Yes, classic and spa pedicures, as well as combo packages with manicure.

F: What's included in a spa pedicure?
A: A relaxing foot bath, callus removal, nail care, and a foot massage.

F: Do you use particular brands?
A: Yes, we work with premium brands like OPI and CND Shellac.

F: How hygienic are your instruments?
A: All instruments are sterilized to the highest hygiene standards; disposable files and sterile covers are standard for us.

F: Do you offer nail art?
A: Yes, custom nail art and nail reinforcement are part of our offering.

F: How long does a manicure take?
A: Between 35 and 90 minutes depending on the treatment chosen.

F: Can I remove gel polish myself?
A: We recommend always having gel polish removed professionally in the studio to avoid damaging the nail plate.

F: Do you offer nail reinforcement?
A: Yes, for brittle or thin nails we offer special reinforcement that makes nails more stable.

F: What does removing old nail art cost?
A: Removal is usually charged separately; we're happy to combine it directly with a new manicure. See the Pricing page for details.

F: Can I go swimming with a gel manicure?
A: Yes, gel polish is waterproof and holds up fine in the pool.

F: Do you offer French manicure?
A: Yes, French manicure is part of our classic offering.

F: What if a nail breaks between appointments?
A: Feel free to drop by on short notice — we can repair small damage quickly and easily.

F: Is a paraffin treatment suitable for sensitive skin?
A: Yes, paraffin treatment is very nourishing and suitable for most skin types.`,

    aktionen: `F: What are your current offers?
A: Our current offers are always up to date on the Offers page, showing all valid combo packages and price benefits.

F: How long are offers valid?
A: Each offer is time-limited; the exact validity is shown directly with each offer.

F: Can I combine an offer with other discounts?
A: Offers are standalone deals and generally can't be combined with other discounts. Feel free to ask us if you have questions.

F: How do I book an offer?
A: Just like any other treatment — through our online booking system, simply select the combo package you want.

F: Do I need to pay in advance for an offer?
A: No, booking requires no upfront payment; you pay as usual in the studio.

F: Are offers refreshed regularly?
A: Yes, we update our offers regularly — it's worth checking the Offers page from time to time.

F: Does an offer apply to both new and existing clients?
A: Usually yes, unless stated otherwise for a specific offer.

F: Can I give an offer as a gift?
A: Yes, just ask us — we'll create a matching gift voucher for you.

F: What happens if an offer expires during my booked appointment?
A: The price valid at the time of booking stays valid for your already-booked appointment.

F: How do I see how many days an offer has left?
A: For offers with an end date, we show a countdown directly on the Offers page during the last 10 days.`,
  },

  tr: {
    general: `F: Stüdyo nerede?
A: Berlepschstraße 2, 81373 München-Sendling adresindeyiz.

F: Çalışma saatleriniz nedir?
A: Pazartesi-Cuma 09:00–19:00/20:00, Cumartesi 10:00–17:00, Pazar kapalı. Kesin saatler İletişim sayfamızda.

F: Nasıl randevu alabilirim?
A: En kolay yolu web sitemizdeki online randevu sistemi üzerinden — "Randevu al" butonuna tıklayıp hizmet, tarih ve saat seçmeniz yeterli.

F: Randevumu erteleyebilir veya iptal edebilir miyim?
A: Evet, randevudan 24 saat öncesine kadar ücretsiz olarak mümkün. Telefon veya e-posta ile bize ulaşmanız yeterli.

F: Hangi ödeme yöntemlerini kabul ediyorsunuz?
A: Stüdyoda nakit ve standart kart ödemelerini kabul ediyoruz.

F: İlk randevuma bir şey getirmem gerekiyor mu?
A: Hayır, sadece kendiniz gelmeniz yeterli. Bazı hizmetlerde (örn. lazer) önce kısa bir ön görüşme yapıyoruz.

F: Randevu hatırlatması alıyor muyum?
A: Evet, randevunuzdan önce otomatik olarak bir hatırlatma e-postası alırsınız.

F: Hediye çeki var mı?
A: Evet, stüdyoda veya iletişim formu üzerinden bize ulaşmanız yeterli, sizin için hediye çeki oluşturalım.

F: Size nasıl ulaşabilirim?
A: Tüm iletişim bilgileri İletişim sayfamızda — oradan bize doğrudan mesaj da gönderebilirsiniz.

F: Stüdyoya toplu taşımayla ulaşım kolay mı?
A: Evet, stüdyo München-Sendling'de merkezi bir konumda ve ulaşımı kolay. Detaylar İletişim sayfamızda.

F: Yakında otopark var mı?
A: Stüdyo çevresinde genel otopark imkanları mevcut. Detayları randevu onayında bizden öğrenebilirsiniz.

F: Randevuma geç kalırsam ne olur?
A: Lütfen bize kısaca telefonla haber verin — gecikmeye göre işlem süresi kısalabilir veya randevu ertelenebilir.

F: Yanımda birini getirebilir miyim?
A: Yer kısıtı nedeniyle mümkünse randevunuza yalnız gelmenizi rica ediyoruz, özel bir anlaşma yoksa.

F: Erkeklere de hizmet veriyor musunuz?
A: Evet, tüm hizmetlerimiz herkese açıktır.`,

    laser: `F: Lazer epilasyon nasıl çalışır?
A: Kıl köklerini hedef alıp etkisiz hale getiren modern diyot lazer teknolojisi kullanıyoruz — çoğu cilt tipi için uygun ve nazik bir yöntem.

F: Lazer epilasyon acıtır mı?
A: Çoğu müşterimiz hafif, ılık bir karıncalanma hissediyor. Hassas bölgeler biraz daha duyarlı olabilir ama işlem genel olarak rahat tolere edilir.

F: Kaç seans gerekir?
A: Cilt ve kıl yapısına göre genellikle 4-6 hafta arayla 6-8 seans, kalıcı pürüzsüzlük için yeterli oluyor.

F: Hangi bölgeler lazerlenebilir?
A: Üst dudak, yüz, koltuk altı, bikini bölgesi, bacaklar ve sırt dahil tüm yaygın bölgeler.

F: Lazer epilasyon ne kadar tutuyor?
A: Fiyatlar bölgeye ve kapsamına göre değişir. Güncel liste için Fiyatlar sayfamıza bakabilirsiniz.

F: Randevudan önce tıraş olmalı mıyım?
A: Evet, işlem yapılacak bölge bir gün önceden tıraş edilmeli (ağda veya cımbız değil), böylece lazer en iyi şekilde etki eder.

F: İşlemden sonra güneşe çıkabilir miyim?
A: Cildin tahriş olmaması için işlem öncesi ve sonrası birkaç gün doğrudan güneşten kaçınmak gerekir.

F: Lazer epilasyon kimlere uygun değildir?
A: Hamilelik, bazı cilt rahatsızlıkları veya yeni bronzlaşma durumunda, işlemin ne zaman ve nasıl yapılacağını birlikte değerlendiriyoruz.

F: Sonuçları ne zaman görürüm?
A: İlk görünür etkiler genellikle 2-3 seans sonra başlar, tam sonuç ise serinin tamamlanmasıyla ortaya çıkar.

F: Sonuç kalıcı mı?
A: Tam seans serisinden sonra sonuç oldukça kalıcıdır, ara sıra tekrar seansları faydalı olabilir.

F: Bir lazer seansı ne kadar sürer?
A: Bölgeye göre 15-90 dakika arasında, örneğin üst dudak ~15 dakika, tam bacak ~90 dakika.

F: Adet döneminde lazer yaptırabilir miyim?
A: Evet, bikini bölgesi hariç sorun değil — bu bölge için randevunuzu ertelemenizi öneririz.

F: İlk işlem öncesi nelere dikkat etmeliyim?
A: Yaklaşık 2 hafta öncesinden güneşlenme ve solaryumdan kaçının, bölgeyi bir gün önceden tıraş edin.

F: Lazer açık renkli veya kızıl kıllarda işe yarar mı?
A: Diyot lazer, yeterli melanin içeren koyu kıllarda en iyi sonucu verir. Çok açık veya kızıl kıllarda etki sınırlıdır — size özel olarak değerlendiririz.

F: Seanslar arasında ne sıklıkla randevu alabilirim?
A: Kıl büyüme döngüsünün doğru yakalanması için seanslar arası 4-6 hafta idealdir.

F: Lazer epilasyon erkeklere de uygulanıyor mu?
A: Evet, tüm cinsiyetlere hizmet veriyoruz — erkeklerde popüler bölgeler sırt, göğüs ve sakal kontürüdür.

F: İşlemden hemen sonra duş alabilir miyim?
A: Evet, ılık suyla hafif duş sorun değil. 24-48 saat sıcak banyo, sauna ve peelingden kaçınmanızı öneririz.`,

    gesicht: `F: HydraFacial nedir?
A: HydraFacial, patentli Vortex teknolojisiyle gözenekleri derinlemesine temizleyen ve cilde anında görünür bir parlaklık kazandıran invaziv olmayan bir yüz bakımıdır.

F: Cilt tipime hangi yüz bakımı uygun?
A: Bunu stüdyoda kişisel bir danışmanlıkla birlikte belirliyoruz — cildinizin ihtiyacına göre HydraFacial, microneedling veya kimyasal peeling önerebiliriz.

F: İşlem sonrası iyileşme süresi var mı?
A: HydraFacial'da yok — hemen sonrasında makyaj yapabilir, günlük hayatınıza devam edebilirsiniz. Microneedling'de cilt kısa süreli kızarabilir.

F: Yüz bakımını ne sıklıkla yaptırmalıyım?
A: Kalıcı ve görünür sonuçlar için 4-6 haftada bir işlem öneriyoruz.

F: Yüz bakımı fiyatları nedir?
A: Fiyatlar seçilen işleme göre değişir (Basic, Premium, microneedling, peeling). Detaylar Fiyatlar sayfamızda.

F: Microneedling acı verir mi?
A: Genellikle hafif bir çizilme hissi olarak algılanır, gerekirse uyuşturucu krem kullanılabilir.

F: Kimyasal peeling ne işe yarar?
A: Ölü cilt hücrelerini uzaklaştırır, cilt dokusunu inceltir, leke ve ince çizgileri azaltır.

F: Yüz bakımı ne kadar sürer?
A: Seçilen işleme göre 30 ile 90 dakika arasında değişir.

F: HydraFacial Basic ve Premium arasındaki fark nedir?
A: Premium, daha derin sonuçlar için ek aktif içerik takviyeleri ve daha yoğun bir işlem seviyesi içerir — yorgun ciltler için idealdir.

F: Yüz bakımı sivilceye yardımcı olur mu?
A: Evet, HydraFacial ve bazı peelingler sivilceye eğilimli ciltte belirgin iyileşme sağlayabilir. İşlemi cildinize özel olarak uyarlıyoruz.

F: Hamileyken yüz bakımı yaptırabilir miyim?
A: Birçok işlem genel olarak mümkündür, ancak bazı aktif içerikler ve peelingler değildir. Doğru protokolü seçebilmemiz için lütfen önceden bilgi verin.

F: İşlem sonrası özel bir bakım gerekiyor mu?
A: Her işlem sonrası kişiye özel bakım önerileri veriyoruz, genellikle yeterli nem ve güneş koruması yeterlidir.

F: Microneedling hangi cilt tipine uygun?
A: Microneedling çoğu cilt tipine uygundur, özellikle iz, gözenek genişliği ve ince çizgilerde etkilidir.

F: Peelingin sonucunu ne kadar sürede görürüm?
A: Cilt genellikle 1-2 gün içinde belirgin şekilde tazelenir, tam sonuç yaklaşık bir hafta içinde görülür.`,

    mani: `F: Klasik ve jel manikür arasındaki fark nedir?
A: Klasik manikürde normal oje kullanılır, jel manikür ise çok daha uzun süre kalır (4 haftaya kadar) ve UV ışıkla sertleştirilir.

F: Jel manikür ne kadar dayanır?
A: Genellikle dökülmeden 3-4 hafta kadar dayanır.

F: Pedikür de yapıyor musunuz?
A: Evet, klasik ve spa pedikür ile manikürle kombine paketler sunuyoruz.

F: Spa pedikürde neler var?
A: Rahatlatıcı ayak banyosu, nasır temizliği, tırnak bakımı ve ayak masajı.

F: Belirli markalar mı kullanıyorsunuz?
A: Evet, OPI ve CND Shellac gibi premium markalarla çalışıyoruz.

F: Aletleriniz ne kadar hijyenik?
A: Tüm aletler en yüksek hijyen standartlarında sterilize edilir, tek kullanımlık eğe ve steril örtüler bizde standarttır.

F: Nail art yapıyor musunuz?
A: Evet, özel tırnak tasarımı ve tırnak güçlendirme hizmetlerimiz arasında.

F: Manikür ne kadar sürer?
A: Seçilen işleme göre 35 ile 90 dakika arasında değişir.

F: Jel ojeyi kendim çıkarabilir miyim?
A: Tırnak plakasına zarar vermemek için jel ojenin her zaman stüdyoda profesyonel olarak çıkarılmasını öneririz.

F: Tırnak güçlendirme yapıyor musunuz?
A: Evet, kırılgan veya ince tırnaklar için tırnakları daha dayanıklı hale getiren özel bir güçlendirme sunuyoruz.

F: Eski nail art'ı çıkarmanın ücreti nedir?
A: Çıkarma genellikle ayrı ücretlendirilir, isterseniz yeni bir manikürle birleştirebiliriz. Detaylar Fiyatlar sayfamızda.

F: Jel manikürle yüzebilir miyim?
A: Evet, jel oje suya dayanıklıdır ve yüzmeden etkilenmez.

F: French manikür yapıyor musunuz?
A: Evet, French manikür klasik hizmetlerimiz arasında.

F: Randevular arasında tırnağım kırılırsa ne yapmalıyım?
A: Kısa süreli önceden haber vererek uğrayabilirsiniz, küçük hasarları hızlıca onarıyoruz.

F: Parafin bakımı hassas ciltler için uygun mu?
A: Evet, parafin bakımı oldukça besleyicidir ve çoğu cilt tipine uygundur.`,

    aktionen: `F: Güncel kampanyalarınız neler?
A: Güncel kampanyalarımızı her zaman Kampanyalar sayfamızda bulabilirsiniz — tüm geçerli kombi paketleri ve fiyat avantajları orada.

F: Kampanyalar ne kadar geçerli?
A: Her kampanyanın kendine ait bir geçerlilik süresi vardır, bu bilgi ilgili kampanyanın yanında belirtilir.

F: Bir kampanyayı başka bir indirimle birleştirebilir miyim?
A: Kampanyalar bağımsız tekliflerdir ve genellikle başka indirimlerle birleştirilemez. Sorularınız için bize ulaşabilirsiniz.

F: Bir kampanyayı nasıl rezerve ederim?
A: Diğer tüm hizmetler gibi — online randevu sistemimizden istediğiniz kombi paketi seçmeniz yeterli.

F: Kampanya için önceden ödeme yapmam gerekiyor mu?
A: Hayır, rezervasyon ön ödemesiz yapılır, ödeme her zamanki gibi stüdyoda alınır.

F: Kampanyalar düzenli olarak yenileniyor mu?
A: Evet, tekliflerimizi düzenli olarak güncelliyoruz — Kampanyalar sayfamıza ara sıra göz atmanızı öneririz.

F: Kampanya hem yeni hem mevcut müşteriler için geçerli mi?
A: Genellikle evet, ilgili kampanyada aksi belirtilmediği sürece.

F: Bir kampanyayı hediye edebilir miyim?
A: Evet, bize ulaşmanız yeterli — sizin için uygun bir hediye çeki oluşturalım.

F: Randevum sırasında kampanya süresi dolarsa ne olur?
A: Rezervasyon anında geçerli olan fiyat, önceden aldığınız randevu için geçerliliğini korur.

F: Bir kampanyanın kaç gün daha geçerli olduğunu nereden görürüm?
A: Bitiş tarihi olan kampanyalarda, son 10 gün içinde Kampanyalar sayfasında geri sayım gösteriyoruz.`,
  },
};
