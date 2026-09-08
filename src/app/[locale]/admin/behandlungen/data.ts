/** Where the focal point of a banner image sits, so cropping (bg-cover) doesn't cut off the subject. */
export type ImagePosition = 'top' | 'center' | 'bottom';

/** oldPrice: optional pre-discount price. When set and non-empty, `price` is the discounted price and the public list shows an "AKTION" treatment (old price struck through, new price highlighted). */
export type Service  = { id: string; name: string; price: string; duration: string; active: boolean; oldPrice?: string };
/** @deprecated superseded by `Aktion` — retained only to type the legacy `SiteContent.campaigns` blob during the 0023 migration window. */
export type Campaign = { id: string; label: string; title: string; desc: string; price: string; oldPrice?: string; cta: string; icon: string; image: string; imagePosition?: ImagePosition; active: boolean };
export type Category = { id: string; icon: string; name: string; desc: string; visible: boolean; image: string; kicker: string };

/**
 * Unified offer model — replaces the homepage `PromoBanner` and the per-category
 * `Campaign`. `category` is mandatory. `activeInCategory` gates the category page
 * + /aktionen; the homepage additionally needs `activeOnHome`. startDate/endDate
 * are display-only ('YYYY-MM-DD'); endDate also drives the last-10-days
 * countdown. No auto-hide after endDate.
 */
export type Aktion = {
  id: string;
  category: string;            // CATEGORIES[].id — 'laser' | 'gesicht' | 'mani' | 'cat-*'
  label: string; title: string; desc: string;
  price: string; oldPrice?: string;
  cta: string; icon: string; image: string; imagePosition?: ImagePosition;
  startDate?: string; endDate?: string;
  activeInCategory: boolean;
  activeOnHome: boolean;
};

export const AKTION_HOME_LIMIT = 10;     // sum across all categories, on the homepage
export const AKTION_CATEGORY_LIMIT = 10; // per category

export const CATEGORIES: Category[] = [
  { id: 'laser',   icon: 'auto_awesome',    name: 'Laser-Haarentfernung', desc: 'Premium Diodenlaser-Technologie für seidig glatte Haut.',        visible: true,  image: '', kicker: 'TECHNOLOGIE' },
  { id: 'gesicht', icon: 'face',             name: 'Gesichtsästhetik',     desc: 'Exklusive Behandlungen für strahlende Hautgesundheit.',          visible: true,  image: '', kicker: 'GESICHTSPFLEGE' },
  { id: 'mani',    icon: 'spa',              name: 'Maniküre',             desc: 'Luxuriöse Nagelpflege und Handmassage.',                        visible: true,  image: '', kicker: 'NAGELPFLEGE' },
];

const s = (id: string, name: string, price: string, duration: string, active = true): Service =>
  ({ id, name, price, duration, active });

export const INIT_SERVICES: Record<string, Service[]> = {
  laser: [
    s('l1', 'Oberlippe',        '29.00',  '15 min'),
    s('l2', 'Ganzes Gesicht',   '89.00',  '45 min'),
    s('l3', 'Beine (Komplett)', '159.00', '90 min'),
    s('l4', 'Achseln',          '49.00',  '20 min', false),
    s('l5', 'Bikinizone',       '79.00',  '30 min'),
    s('l6', 'Rücken',           '139.00', '60 min'),
  ],
  gesicht: [
    s('g1', 'HydraFacial Basic',   '99.00',  '60 min'),
    s('g2', 'HydraFacial Premium', '149.00', '90 min'),
    s('g3', 'Microneedling',       '129.00', '75 min'),
    s('g4', 'Chemical Peeling',    '79.00',  '45 min', false),
    s('g5', 'Anti-Aging Maske',    '59.00',  '30 min'),
  ],
  mani: [
    s('m1', 'Klassische Maniküre', '35.00', '45 min'),
    s('m2', 'Gel-Maniküre',        '55.00', '60 min'),
    s('m3', 'Klassische Pediküre', '45.00', '60 min'),
    s('m4', 'Spa-Pediküre',        '75.00', '90 min'),
    s('m5', 'French Maniküre',     '65.00', '75 min', false),
    s('m6', 'Nageldesign',         '80.00', '90 min'),
    s('m7', 'Paraffin-Behandlung', '30.00', '30 min'),
    s('m8', 'Nagelverstärkung',    '50.00', '60 min', false),
  ],
};

const a = (
  id: string, category: string, label: string, title: string, desc: string,
  price: string, oldPrice: string,
  activeInCategory: boolean, activeOnHome: boolean,
  cta = 'JETZT BUCHEN', icon = 'auto_fix_high', image = '',
): Aktion => ({
  id, category, label, title, desc, price,
  oldPrice: oldPrice || undefined,
  cta, icon, image, activeInCategory, activeOnHome,
});

/** Seed for the unified Aktion model — the 3 seed campaigns + the 1 seed promo banner. */
export const INIT_AKTIONEN: Aktion[] = [
  a('cl1', 'laser',   'AKTIVE AKTION', 'Winter Glow Kombi-Paket', 'Ganzes Gesicht + Dekolleté inkl. Maske.', '120,00€', '149,00€', true, false, 'JETZT BUCHEN', 'auto_awesome'),
  a('cg1', 'gesicht', 'BESTSELLER',    'HydraFacial Duo-Paket',   '2× HydraFacial Premium zum Sonderpreis.', '249,00€', '298,00€', true, false, 'JETZT BUCHEN', 'spa'),
  a('cm1', 'mani',    'DUO DEAL',      'Mani & Pedi Paket',       'Gel-Maniküre + Spa-Pediküre zusammen.',   '99,00€',  '130,00€', true, false, 'JETZT BUCHEN', 'favorite'),
  // former homepage promo banner (promo1) — home-active, category best-guess 'gesicht'
  a('promo1', 'gesicht', 'EXKLUSIVES ANGEBOT', 'Winter Glow\nKombi-Paket',
    'Erhalten Sie 20 % Rabatt auf unsere exklusive Kombination aus Gesichtshydrierung und Maniküre. Gültig bis Ende der Saison.',
    '', '', true, true, 'ANGEBOT SICHERN', 'auto_awesome', '/images/promo-winter-glow.png'),
];

export type OpeningDay = { day: string; open: string; close: string; closed: boolean };

export type SiteSettings = {
  name: string; tagline: string; address: string; phone: string; email: string; whatsapp: string;
  calendarUrl: string; whatsappMsg: string; bookingActive: boolean; whatsappActive: boolean;
  instagram: string; facebook: string; tiktok: string; google: string;
  treatwellUrl: string;
  aboutImage: string;
  /** Owner portrait for the manifesto block (homepage + /ueber-uns). Empty → monogram fallback. */
  ownerImage: string;
  /** Real ratings shown in the hero trust badge + LocalBusiness aggregateRating. German comma format ("5,0"). */
  googleRating: string; googleReviewCount: string;
  treatwellRating: string; treatwellReviewCount: string;
  hours: OpeningDay[];
};

export const INIT_SETTINGS: SiteSettings = {
  name: 'EPILISSE',
  tagline: 'Luxury Beauty Care Munich',
  address: 'Berlepschstraße 2, 81373 München-Sendling',
  phone: '+49 89 000000',
  email: 'info@epilisse.de',
  whatsapp: '+49 89 000000',
  calendarUrl: 'https://calendar.google.com',
  whatsappMsg: 'Hallo, ich möchte gerne einen Termin vereinbaren.',
  bookingActive: true,
  whatsappActive: true,
  instagram: '@epilisse_munich',
  facebook: 'epilisse.munich',
  tiktok: '@epilisse',
  google: '',
  treatwellUrl: 'https://www.treatwell.de/ort/studio-adisa-the-beauty-experience/',
  aboutImage: '',
  ownerImage: '',
  googleRating: '4,9', googleReviewCount: '180+',
  treatwellRating: '4,8', treatwellReviewCount: '51+',
  hours: [
    { day: 'Montag',     open: '09:00', close: '19:00', closed: false },
    { day: 'Dienstag',   open: '09:00', close: '19:00', closed: false },
    { day: 'Mittwoch',   open: '09:00', close: '19:00', closed: false },
    { day: 'Donnerstag', open: '09:00', close: '20:00', closed: false },
    { day: 'Freitag',    open: '09:00', close: '20:00', closed: false },
    { day: 'Samstag',    open: '10:00', close: '17:00', closed: false },
    { day: 'Sonntag',    open: '10:00', close: '16:00', closed: true  },
  ],
};

export type LandingContent = {
  navBehandlungen: string; navPreise: string; navUeberUns: string; navKontakt: string; navCta: string; navAktionen: string;
  servicesSectionLabel: string; servicesSectionTitle: string;
  aboutSectionLabel: string; aboutTitle: string; aboutDesc: string;
  /** First-person owner manifesto block (homepage Über-Uns section + top of /ueber-uns). */
  ownerKicker: string; ownerTitle: string; ownerBody: string; ownerName: string; ownerRole: string;
  contactSectionLabel: string; contactTitle: string;
  contactAddressTitle: string; contactHoursTitle: string; contactPhoneTitle: string;
  footerTagline: string; footerBehandlungenTitle: string; footerStudioTitle: string; footerLegalTitle: string;
  footerCopyright: string; footerBadge1: string; footerBadge2: string;
};

export const INIT_LANDING_CONTENT: LandingContent = {
  navBehandlungen: 'Behandlungen', navPreise: 'Preise', navUeberUns: 'Über Uns', navKontakt: 'Kontakt', navCta: 'TERMIN BUCHEN', navAktionen: 'Aktionen',
  servicesSectionLabel: 'UNSER ANGEBOT', servicesSectionTitle: 'Exklusive Behandlungen',
  aboutSectionLabel: 'ÜBER EPILISSE', aboutTitle: 'Münchens Adresse für Premium-Ästhetik',
  aboutDesc: 'Willkommen im EPILISSE Studio – Ihrem exklusiven Kosmetikstudio im Herzen von München. Wir vereinen modernste Behandlungsmethoden mit einem tiefen Verständnis für individuelle Schönheit.',
  ownerKicker: 'PERSÖNLICHE VERANTWORTUNG',
  ownerTitle: 'Ihre Haut in den Händen einer zertifizierten Expertin',
  ownerBody: 'Ich bin Senem – Inhaberin und Lasertherapeutin von EPILISSE. Seit über 15 Jahren behandle ich Haut in München, mit offiziellem NiSV-Fachkundenachweis für Laserstrahlung und laufenden Fortbildungen in ästhetischer Kosmetik. Qualität hört für mich nicht bei der Technologie auf: Jede Kundin berate ich persönlich, jede Behandlung stimme ich auf Ihren Hauttyp ab. Bei mir sind Sie keine Nummer.',
  ownerName: 'Senem',
  ownerRole: 'Inhaberin & Lasertherapeutin',
  contactSectionLabel: 'KONTAKT & STANDORT', contactTitle: 'Besuchen Sie uns in München',
  contactAddressTitle: 'Studio Adresse', contactHoursTitle: 'Öffnungszeiten', contactPhoneTitle: 'Telefon',
  footerTagline: 'Ihr Experte für exklusive Schönheit und dauerhafte Haarentfernung im Herzen von München. Qualität, Diskretion und Perfektion.',
  footerBehandlungenTitle: 'Behandlungen', footerStudioTitle: 'Studio', footerLegalTitle: 'Rechtliches',
  footerCopyright: '© 2026 EPILISSE – Luxury Beauty Care Munich.',
  footerBadge1: 'MADE IN MUNICH', footerBadge2: 'SECURE PAYMENT',
};

/** ctaLink: '' → opens the booking modal. Otherwise an internal path (e.g. '/laser-haarentfernung', '/behandlungen') the CTA navigates to. */
export type HeroSlide = { id: string; headline: string; sub: string; cta: string; ctaLink: string; image: string; duration: number };

export const HERO_SLIDE_LIMIT = 10;

export const INIT_HERO_SLIDES: HeroSlide[] = [
  {
    id: 'hero1', duration: 10,
    headline: 'Zeitlose Schönheit.',
    sub: 'Entdecken Sie die Kunst der ästhetischen Perfektion in unserem Exklusiv-Studio in München.',
    cta: 'TERMIN BUCHEN',
    ctaLink: '',
    image: '/images/hero-1.png',
  },
  {
    id: 'hero2', duration: 10,
    headline: 'Sanfte Glätte.',
    sub: 'Präzise Laser-Haarentfernung für ein seidiges Hautgefühl, das bleibt. Schmerzfrei und effektiv.',
    cta: 'ERFAHREN SIE MEHR',
    ctaLink: '/laser-haarentfernung',
    image: '/images/hero-2.png',
  },
  {
    id: 'hero3', duration: 10,
    headline: 'Gesichtsästhetik.',
    sub: 'Individuelle Behandlungen für eine strahlende Haut und natürliche Verjüngung.',
    cta: 'ZUM ANGEBOT',
    ctaLink: '/gesichtsaesthetik',
    image: '/images/about-studio.png',
  },
  {
    id: 'hero4', duration: 10,
    headline: 'Perfekte Pflege.',
    sub: 'Maniküre & Pediküre auf höchstem Niveau für Ihre Hände und Füße.',
    cta: 'JETZT BUCHEN',
    ctaLink: '',
    image: '/images/hero-4.png',
  },
];

/** @deprecated superseded by `Aktion` — retained only to type the legacy `SiteContent.promoBanners` blob during the 0023 migration window. */
export type PromoBanner = { id: string; label: string; title: string; desc: string; ctaPrimary: string; ctaSecondary: string; image: string };

export type AboutValue = { id: string; icon: string; title: string; desc: string };

export const ABOUT_VALUE_LIMIT = 10;

export const INIT_ABOUT_VALUES: AboutValue[] = [
  { id: 'av1', icon: 'workspace_premium', title: '15 Jahre Erfahrung', desc: 'Über 15 Jahre Praxis in der ästhetischen Kosmetik und Laser-Haarentfernung in München.' },
  { id: 'av2', icon: 'verified', title: 'NiSV-Fachkunde Laserstrahlung', desc: 'Offizieller Fachkundenachweis nach NiSV für den sicheren Betrieb von Lasergeräten.' },
  { id: 'av3', icon: 'health_and_beauty', title: 'Medizinischer Hygienestandard', desc: 'Behandlungen unter klinischen Hygienebedingungen – für Ihre Sicherheit bei jedem Termin.' },
];

export type Review = { id: string; name: string; text: string; treatment: string; active: boolean };

export const REVIEW_LIMIT = 24;

export const INIT_REVIEWS: Review[] = [
  { id: 'rv1', name: 'Liv', text: 'War wie immer sehr zufrieden, super Behandlung.', treatment: 'Laser-Haarentfernung', active: true },
  { id: 'rv2', name: 'Amélie', text: 'Ich buchte bei STUDIO ADISA um meine gelaserte Zonen „aufzufrischen“ und ich wurde nicht enttäuscht: Studio ist sauber und total schön, die Behandlung wird professionell durchgeführt und Senem war super nett! Ich komme in ein paar Monate wieder danke', treatment: 'Laser-Haarentfernung', active: true },
  { id: 'rv3', name: 'Sabrina', text: 'Jetzt kann der Sommer wieder kommen. Danke Senem!!!', treatment: 'Pediküre', active: true },
  { id: 'rv4', name: 'Vanessa', text: 'Super lieb und hat mir wirklich gut geholfen obwohl es ein sehr kurzfristiger Termin war, Dankeschön!', treatment: 'Entfernung des Nageldesigns', active: true },
  { id: 'rv5', name: 'Stef', text: 'Sehr nette Beratung für eine laser Behandlung. Senem war sehr sympathisch und ich habe mich wohl gefühlt.', treatment: 'Laser-Haarentfernung', active: true },
  { id: 'rv6', name: 'JP', text: 'Sehr nette und professionelle Behandlung :)', treatment: 'Laser-Haarentfernung', active: true },
  { id: 'rv7', name: 'Isabella', text: 'Es war eine richtig gute und gründliche Behandlung. Sehr einfühlsam, sympathisch und ich habe mich direkt wohlgefühlt. Es wurde mir ein gutes Gefühl vermittelt, ebenso wurde ich kompetent beraten für ggf. andere Behandlungen.', treatment: 'Damen Waxing – Bikini', active: true },
  { id: 'rv8', name: 'Katharina', text: 'Ich war inzwischen zweimal dort und bin super zufrieden. Waxing gründlich und die Behandlung sehr nett.', treatment: 'Damen Waxing – Bikini', active: true },
];

/**
 * The DB-backed CMS payload (everything except the category list and per-category
 * Seiteninhalt, which have their own tables). Keyed exactly like the old
 * localStorage keys. See supabase/migrations/0022_site_content.sql.
 */
export type SiteContent = {
  services?: Record<string, Service[]>;
  aktionen?: Aktion[];
  /** @deprecated migrated to `aktionen` — kept one release for the 0023 migration window */
  campaigns?: Record<string, Campaign[]>;
  settings?: SiteSettings;
  landingContent?: LandingContent;
  heroSlides?: HeroSlide[];
  /** @deprecated migrated to `aktionen` — kept one release for the 0023 migration window */
  promoBanners?: PromoBanner[];
  aboutValues?: AboutValue[];
  reviews?: Review[];
};

export const FRONTEND_SLUG: Record<string, string> = {
  laser:   'laser-haarentfernung',
  gesicht: 'gesichtsaesthetik',
  mani:    'manikure-pedikure',
};

export const PREVIEW_GRADIENT: Record<string, string> = {
  laser:   'linear-gradient(135deg,#fff8e7 0%,#f5e5a0 100%)',
  gesicht: 'linear-gradient(135deg,#fff0f5 0%,#fdd5e8 100%)',
  mani:    'linear-gradient(135deg,#fff1f2 0%,#fecdd3 100%)',
};

export type PageBanner = {
  label: string; title: string; body: string; cta: string; icon: string; image: string; imagePosition?: ImagePosition;
};

export type PageContent = {
  label: string;
  h1: string;
  heroDesc: string;
  heroImage: string;
  infoTitle: string;
  infoParagraphs: [string, string];
  benefitsTitle: string;
  benefits: string[];
  campaign1: PageBanner;
  campaign2: PageBanner;
};

export type PageContentMap = Record<string, PageContent>;

export const INIT_PAGE_CONTENT: PageContentMap = {
  laser: {
    label: 'Signature Treatment',
    h1: 'Laser-Haarentfernung',
    heroDesc: 'Erleben Sie modernste Technologie für dauerhaft glatte Haut. Schmerzarm, hocheffektiv und perfekt auf Ihren Hauttyp abgestimmt.',
    heroImage: '/images/laser-hair-removal.png',
    infoTitle: 'Die Zukunft der Hautpflege',
    infoParagraphs: [
      'Unsere Laser-Haarentfernung nutzt die innovative Diodenlaser-Technologie, um Haarwurzeln gezielt und nachhaltig zu deaktivieren. Im Gegensatz zu herkömmlichen Methoden ist unser Verfahren besonders hautschonend und auch für sensible Bereiche geeignet.',
      'Jede Behandlung beginnt mit einer ausführlichen Hautanalyse, um die Laser-Parameter exakt auf Ihren Melaningehalt und Ihre Haarstruktur zu kalibrieren. So garantieren wir maximale Sicherheit und exzellente Ergebnisse ab der ersten Sitzung.',
    ],
    benefitsTitle: 'Gesundheitliche Wirkung',
    benefits: [
      'Vermeidung von eingewachsenen Haaren und Rasurbrand-Prävention',
      'Schonung der Hautbarriere durch Wegfall täglicher Rasurbelastung',
      'Hautbildverfeinerung und Reduktion von Pigmentflecken',
      'Langfristige Zeitersparnis und reduzierter Wasserverbrauch',
    ],
    campaign1: { label: 'Limited Edition Offer', title: 'Kombi-Paket Kampagne', body: 'Buchen Sie ein Paket aus 3 Behandlungszonen und erhalten Sie die günstigste Zone komplett kostenfrei. Gültig für alle Laser-Treatments in diesem Monat.', cta: 'JETZT SICHERN', icon: 'auto_awesome', image: '/images/campaign-generic-1.png' },
    campaign2: { label: 'Exklusives Treue-Special', title: 'Freunde-Werben-Programm', body: 'Empfehlen Sie uns weiter und erhalten Sie beide 20% Rabatt auf Ihre nächste Laser-Sitzung. Geteilte Schönheit ist doppelte Freude.', cta: 'MEHR ERFAHREN', icon: 'loyalty', image: '/images/campaign-laser-2.png' },
  },
  gesicht: {
    label: 'Premium Skin Care',
    h1: 'Gesichtsästhetik',
    heroDesc: 'Individuelle Gesichtsbehandlungen auf höchstem Niveau. Von HydraFacial über Microneedling bis zu chemischen Peelings – für strahlendes, jugendliches Hautbild.',
    heroImage: '/images/gesichtsaesthetik.png',
    infoTitle: 'Wissenschaft trifft Schönheit',
    infoParagraphs: [
      'Unsere Gesichtsästhetik-Behandlungen vereinen medizinische Expertise mit ästhetischem Feingefühl. Jede Therapie beginnt mit einer präzisen Hautdiagnose – wir analysieren Feuchtigkeitsgehalt, Talgproduktion, Pigmentverteilung und Hautalterung, um das optimale Behandlungsprotokoll zu entwickeln.',
      'Das Herzstück unseres Angebots ist der HydraFacial – das weltweit erfolgreichste nicht-invasive Gesichtsbehandlungsverfahren. Durch die patentierte Vortex-Technologie werden Poren tiefengereinigt, Wirkstoffe präzise eingeschleust und die Haut sofort sichtbar gestrahlt. Keine Ausfallzeit, maximaler Effekt.',
    ],
    benefitsTitle: 'Wirkung & Vorteile',
    benefits: [
      'Intensive Tiefenreinigung und sofortige Poren-Verfeinerung',
      'Stimulation der körpereigenen Kollagen- und Elastinproduktion',
      'Reduktion von Hyperpigmentierungen, Falten und unebenmäßiger Textur',
      'Langanhaltende Hydratation durch tief eindringende Wirkstoffkomplexe',
    ],
    campaign1: { label: 'Seasonal Special', title: 'Frühlingsfrische Haut', body: 'Starten Sie mit strahlender Haut in den Frühling: Buchen Sie HydraFacial Deluxe und erhalten Sie ein Chemical Peeling Ihrer Wahl zum Sonderpreis. Gültig bis Ende März.', cta: 'JETZT SICHERN', icon: 'spa', image: '/images/campaign-generic-1.png' },
    campaign2: { label: 'Exklusives Membership', title: 'HydraFacial Membership', body: 'Werden Sie Teil unserer exklusiven Mitgliedergemeinschaft und genießen Sie monatliche HydraFacial-Behandlungen zu Vorzugspreisen. Dauerhaft strahlende Haut als Lifestyle.', cta: 'MEHR ERFAHREN', icon: 'diamond', image: '/images/gesichtsaesthetik.png' },
  },
  mani: {
    label: 'Esthetic Care',
    h1: 'Maniküre & Pediküre',
    heroDesc: 'Höchste Perfektion und luxuriöse Entspannung für Hände und Füße. Medizinische Sorgfalt trifft ästhetische Meisterschaft – für ein Erscheinungsbild, das überzeugt.',
    heroImage: '/images/manikure-pedikure.png',
    infoTitle: 'Nail Art trifft Wellness',
    infoParagraphs: [
      'Unsere Maniküre- und Pediküre-Behandlungen verbinden medizinische Sorgfalt mit ästhetischer Meisterschaft. Jede Behandlung beginnt mit einem warmen Einweichbad und einer sorgfältigen Analyse des Nagelzustands – für ein Ergebnis, das Ihre Persönlichkeit unterstreicht.',
      'Wir verwenden ausschließlich Premium-Marken wie OPI und CND Shellac. Alle Instrumente werden nach höchsten Hygienestandards sterilisiert – Einweg-Feilen und sterile Abdeckungen sind bei uns selbstverständlich.',
    ],
    benefitsTitle: 'Wirkung & Vorteile',
    benefits: [
      'Medizinische Sterilisation aller Instrumente für maximale Sicherheit',
      'Premium-Produkte wie OPI, CND Shellac und vegane Pflegeserien',
      'Langanhaltende Shellac-Ergebnisse bis zu 4 Wochen ohne Absplittern',
      'Spa-Atmosphäre mit aromatischen Bädern und Handmassage',
    ],
    campaign1: { label: 'Limited Edition', title: 'Velvet Touch Combo', body: 'Das ultimative Duo: Spa-Maniküre & Spa-Pediküre inkl. Shellac und einem Glas Champagner während der Behandlung. Normaler Einzelpreis: 180 € – jetzt 145 €.', cta: 'ANGEBOT SICHERN', icon: 'favorite', image: '/images/promo-winter-glow.png' },
    campaign2: { label: 'Exklusives Membership', title: 'Nail Membership', body: 'Monatliche Shellac-Maniküre zum exklusiven Vorzugspreis. Als Mitglied profitieren Sie von Premium-Service, Prioritätsbuchung und 10% Rabatt auf alle Zusatzleistungen.', cta: 'MEHR ERFAHREN', icon: 'card_membership', image: '/images/manikure-pedikure.png' },
  },
};
