/** Where the focal point of a banner image sits, so cropping (bg-cover) doesn't cut off the subject. */
export type ImagePosition = 'top' | 'center' | 'bottom';

export type Service  = { id: string; name: string; price: string; duration: string; active: boolean };
export type Campaign = { id: string; label: string; title: string; desc: string; price: string; oldPrice?: string; cta: string; icon: string; image: string; imagePosition?: ImagePosition; active: boolean };
export type Category = { id: string; icon: string; name: string; desc: string; visible: boolean; image: string };

export const CATEGORIES: Category[] = [
  { id: 'laser',   icon: 'auto_awesome',    name: 'Laser-Haarentfernung', desc: 'Premium Diodenlaser-Technologie für seidig glatte Haut.',        visible: true,  image: '' },
  { id: 'gesicht', icon: 'face',             name: 'Gesichtsästhetik',     desc: 'Exklusive Behandlungen für strahlende Hautgesundheit.',          visible: true,  image: '' },
  { id: 'body',    icon: 'self_improvement', name: 'Body Contouring',      desc: 'Nicht-invasive Formung Ihrer Silhouette.',                      visible: true,  image: '' },
  { id: 'inject',  icon: 'vaccines',         name: 'Injectables',          desc: 'Präzise Hyaluron- und Botox-Behandlungen.',                     visible: true,  image: '' },
  { id: 'mani',    icon: 'spa',              name: 'Maniküre',             desc: 'Luxuriöse Nagelpflege und Handmassage.',                        visible: true,  image: '' },
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
  body: [
    s('b1', 'Kryolipolysis Bauch', '299.00', '120 min', false),
    s('b2', 'RF-Lifting Beine',    '199.00', '90 min',  false),
    s('b3', 'Kavitation Hüfte',    '149.00', '60 min',  false),
    s('b4', 'Ultraschall-Lifting', '249.00', '90 min'),
  ],
  inject: [
    s('i1', 'Botox Stirn',         '199.00', '30 min'),
    s('i2', 'Hyaluron Lippen',     '249.00', '45 min'),
    s('i3', 'Profhilo Gesicht',    '349.00', '60 min'),
    s('i4', 'Botulin Krähenfüße',  '149.00', '20 min'),
    s('i5', 'Hyaluron Nasolabial', '299.00', '45 min', false),
    s('i6', 'Baby Botox',          '179.00', '30 min'),
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

const c = (
  id: string, label: string, title: string, desc: string,
  price: string, oldPrice?: string,
  cta = 'JETZT BUCHEN', icon = 'auto_fix_high', image = '',
): Campaign =>
  ({ id, label, title, desc, price, oldPrice, cta, icon, image, active: true });

export const INIT_CAMPAIGNS: Record<string, Campaign[]> = {
  laser: [
    c('cl1', 'AKTIVE AKTION', 'Winter Glow Kombi-Paket',   'Ganzes Gesicht + Dekolleté inkl. Maske.',         '120,00€', '149,00€', 'JETZT BUCHEN', 'auto_awesome'),
  ],
  gesicht: [
    c('cg1', 'BESTSELLER',    'HydraFacial Duo-Paket',      '2× HydraFacial Premium zum Sonderpreis.',         '249,00€', '298,00€', 'JETZT BUCHEN', 'spa'),
  ],
  body: [],
  inject: [
    c('ci1', 'NEUKUNDEN',     'Beauty-Starter-Set',         'Botox + Hyaluron Lippen-Kombi für Erstkundinnen.','299,00€', '448,00€', 'JETZT BUCHEN', 'diamond'),
  ],
  mani: [
    c('cm1', 'DUO DEAL',      'Mani & Pedi Paket',          'Gel-Maniküre + Spa-Pediküre zusammen.',           '99,00€',  '130,00€', 'JETZT BUCHEN', 'favorite'),
  ],
};

export type OpeningDay = { day: string; open: string; close: string; closed: boolean };

export type SiteSettings = {
  name: string; tagline: string; address: string; phone: string; email: string; whatsapp: string;
  calendarUrl: string; whatsappMsg: string; bookingActive: boolean; whatsappActive: boolean;
  instagram: string; facebook: string; tiktok: string; google: string;
  treatwellUrl: string;
  aboutImage: string;
  hours: OpeningDay[];
};

export const INIT_SETTINGS: SiteSettings = {
  name: 'EPILISSE Beauty Studio',
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
  navBehandlungen: string; navPreise: string; navUeberUns: string; navKontakt: string; navCta: string;
  servicesSectionLabel: string; servicesSectionTitle: string;
  aboutSectionLabel: string; aboutTitle: string; aboutDesc: string;
  contactSectionLabel: string; contactTitle: string;
  contactAddressTitle: string; contactHoursTitle: string; contactPhoneTitle: string;
  footerTagline: string; footerBehandlungenTitle: string; footerStudioTitle: string; footerLegalTitle: string;
  footerCopyright: string; footerBadge1: string; footerBadge2: string;
};

export const INIT_LANDING_CONTENT: LandingContent = {
  navBehandlungen: 'Behandlungen', navPreise: 'Preise', navUeberUns: 'Über Uns', navKontakt: 'Kontakt', navCta: 'TERMIN BUCHEN',
  servicesSectionLabel: 'UNSER ANGEBOT', servicesSectionTitle: 'Exklusive Behandlungen',
  aboutSectionLabel: 'ÜBER EPILISSE', aboutTitle: 'Münchens Adresse für Premium-Ästhetik',
  aboutDesc: 'Willkommen im EPILISSE Studio – Ihrem exklusiven Kosmetikstudio im Herzen von München. Wir vereinen modernste Behandlungsmethoden mit einem tiefen Verständnis für individuelle Schönheit.',
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

export type PromoBanner = { id: string; label: string; title: string; desc: string; ctaPrimary: string; ctaSecondary: string; image: string };

export const PROMO_BANNER_LIMIT = 4;

export const INIT_PROMO_BANNERS: PromoBanner[] = [
  {
    id: 'promo1',
    label: 'EXKLUSIVES ANGEBOT', title: 'Winter Glow\nKombi-Paket',
    desc: 'Erhalten Sie 20 % Rabatt auf unsere exklusive Kombination aus Gesichtshydrierung und Maniküre. Gültig bis Ende der Saison.',
    ctaPrimary: 'ANGEBOT SICHERN', ctaSecondary: 'DETAILS ANSEHEN',
    image: '/images/promo-winter-glow.png',
  },
];

export type AboutValue = { id: string; icon: string; title: string; desc: string };

export const ABOUT_VALUE_LIMIT = 10;

export const INIT_ABOUT_VALUES: AboutValue[] = [
  { id: 'av1', icon: 'verified', title: 'Qualität', desc: 'Ausschließlich zertifizierte Technologien und medizinische Wirkstoffe auf klinischem Niveau.' },
  { id: 'av2', icon: 'lock', title: 'Diskretion', desc: 'Ein geschützter Raum für Ihre persönliche Schönheitsreise – absolut vertraulich.' },
  { id: 'av3', icon: 'star', title: 'Perfektion', desc: 'Jede Behandlung wird individuell auf Ihren Hauttyp und Ihre Wünsche abgestimmt.' },
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

export const FRONTEND_SLUG: Record<string, string> = {
  laser:   'laser-haarentfernung',
  gesicht: 'gesichtsaesthetik',
  body:    'body-contouring',
  inject:  'injectables',
  mani:    'manikure-pedikure',
};

export const PREVIEW_GRADIENT: Record<string, string> = {
  laser:   'linear-gradient(135deg,#fff8e7 0%,#f5e5a0 100%)',
  gesicht: 'linear-gradient(135deg,#fff0f5 0%,#fdd5e8 100%)',
  body:    'linear-gradient(135deg,#f0f9ff 0%,#bae6fd 100%)',
  inject:  'linear-gradient(135deg,#faf5ff 0%,#d8b4fe 100%)',
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
  body: {
    label: 'Body Sculpting',
    h1: 'Body Contouring',
    heroDesc: 'Modernste non-invasive Körperformung für definierte Konturen und straffere Haut. Kryolipolyse, RF-Lifting und Ultraschall-Kavitation auf premium Niveau.',
    heroImage: '/images/body-contouring.png',
    infoTitle: 'Körperformung ohne Skalpell',
    infoParagraphs: [
      'Unser Body Contouring-Angebot setzt auf die effektivsten nicht-chirurgischen Verfahren der modernen Körperästhetik. Die Kryolipolyse – auch bekannt als Fettgefrieren – reduziert hartnäckige Fettdepots durch kontrollierte Kühlung präzise und dauerhaft, ohne die umgebenden Gewebe zu beeinflussen.',
      'Ergänzt durch hochfrequentes RF-Lifting, das Kollagenfasern tief in der Dermis stimuliert und sichtbar strafft, sowie Ultraschall-Kavitation zur gezielten Fettzellenauflösung – entwickeln wir für Sie ein individuelles Körperformungs-Protokoll, das messbare Ergebnisse liefert.',
    ],
    benefitsTitle: 'Wirkung & Vorteile',
    benefits: [
      'Dauerhafte Reduktion hartnäckiger Fettdepots ohne Operation',
      'Spürbare Haustraffung und Verbesserung der Hautelastizität',
      'Sichtbare Reduktion von Cellulite und Orangenhaut',
      'Keine Ausfallzeit – direkt wieder aktiv nach der Behandlung',
    ],
    campaign1: { label: 'Summer Edition', title: 'Summer Ready Body', body: 'Bereiten Sie Ihren Körper auf die Strandsaison vor: Buchen Sie 2 Kryolipolyse-Zonen und erhalten Sie eine Ultraschall-Kavitation-Sitzung kostenfrei dazu. Limitiertes Angebot bis Mai.', cta: 'JETZT SICHERN', icon: 'self_improvement', image: '/images/campaign-generic-1.png' },
    campaign2: { label: 'Kombinationstherapie', title: 'Shape & Glow Kombi-Set', body: 'Maximale Ergebnisse durch intelligente Kombination: Body Contouring mit anschließender Hautstrafftung via RF-Lifting. Zwei Technologien, ein harmonisches Ergebnis.', cta: 'MEHR ERFAHREN', icon: 'fitness_center', image: '/images/body-contouring.png' },
  },
  inject: {
    label: 'Aesthetic Medicine',
    h1: 'Injectables',
    heroDesc: 'Präzise ästhetische Medizin für natürliche Verjüngung. Botulinum Toxin, Hyaluronsäure und Profhilo – individuell dosiert für ein authentisches, ausgeruhtes Erscheinungsbild.',
    heroImage: '/images/injectables.png',
    infoTitle: 'Die Kunst der natürlichen Verjüngung',
    infoParagraphs: [
      'Injectables in Expertenhand bedeuten: kein starres, unnatürliches Ergebnis, sondern präzise Dosierung, die Ihre natürliche Ausstrahlung unterstreicht. Unser Behandlungskonzept beginnt mit einem ausführlichen Beratungsgespräch und einer detaillierten Gesichtsanalyse – um Ihre individuellen Wünsche und die anatomischen Gegebenheiten perfekt zu harmonisieren.',
      'Botulinum Toxin entspannt gezielt überaktive Mimik-Muskeln und mildert Falten auf sanfte, reversible Weise. Hyaluronsäure-Filler restaurieren verlorenes Volumen und definieren Konturen. Profhilo – das innovative Bioremodeling-Präparat – verbessert die Hautqualität von innen heraus und setzt neue Maßstäbe in der Anti-Aging-Medizin.',
    ],
    benefitsTitle: 'Wirkung & Vorteile',
    benefits: [
      'Sofort sichtbare Faltenreduktion bei natürlichem, ausgeruhtem Ergebnis',
      'Volumenaufbau und Konturierung für ein harmonisches Gesichtsbild',
      'Verbesserung der Hautqualität, Festigkeit und Feuchtigkeit von innen',
      'Diskrete, schnelle Behandlung mit minimaler Ausfallzeit',
    ],
    campaign1: { label: 'Signature Package', title: 'Natural Beauty First', body: 'Entdecken Sie unsere beliebteste Kombination: Botulinum Toxin für 3 Zonen kombiniert mit Hyaluronsäure Lippen-Augmentation. Inklusive kostenlosem Folgetermin nach 2 Wochen.', cta: 'JETZT SICHERN', icon: 'face_retouching_natural', image: '/images/campaign-generic-1.png' },
    campaign2: { label: 'Erstkunden-Angebot', title: 'Beratungs-Special', body: 'Ihr Weg zu mehr Ausstrahlung beginnt mit einem Gespräch: Kostenlose Erstberatung und 15% Rabatt auf Ihre erste Injectable-Behandlung. Diskret, professionell, natürlich.', cta: 'TERMIN VEREINBAREN', icon: 'health_and_beauty', image: '/images/injectables.png' },
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
