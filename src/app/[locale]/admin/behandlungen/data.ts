export type Service  = { id: string; name: string; price: string; duration: string; active: boolean };
export type Campaign = { id: string; label: string; title: string; desc: string; price: string; oldPrice?: string; cta: string; icon: string; image: string; active: boolean };
export type Category = { id: string; icon: string; name: string; desc: string; visible: boolean };

export const CATEGORIES: Category[] = [
  { id: 'laser',   icon: 'auto_awesome',    name: 'Laser-Haarentfernung', desc: 'Premium Diodenlaser-Technologie für seidig glatte Haut.',        visible: true  },
  { id: 'gesicht', icon: 'face',             name: 'Gesichtsästhetik',     desc: 'Exklusive Behandlungen für strahlende Hautgesundheit.',          visible: true  },
  { id: 'body',    icon: 'self_improvement', name: 'Body Contouring',      desc: 'Nicht-invasive Formung Ihrer Silhouette.',                      visible: false },
  { id: 'inject',  icon: 'vaccines',         name: 'Injectables',          desc: 'Präzise Hyaluron- und Botox-Behandlungen.',                     visible: true  },
  { id: 'mani',    icon: 'spa',              name: 'Maniküre',             desc: 'Luxuriöse Nagelpflege und Handmassage.',                        visible: true  },
  { id: 'andere',  icon: 'favorite',         name: 'Andere',               desc: 'Weitere Wellness- und Beauty-Services für Ihr Wohlbefinden.',   visible: true  },
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
  andere: [
    s('a1', 'Aromatherapie-Massage', '79.00',  '60 min'),
    s('a2', 'Hot Stone Massage',     '95.00',  '75 min'),
    s('a3', 'Wimpernverlängerung',   '120.00', '90 min'),
    s('a4', 'Augenbrauen-Styling',   '35.00',  '30 min'),
    s('a5', 'Brow Lamination',       '55.00',  '45 min'),
    s('a6', 'Lash Lifting',          '75.00',  '60 min', false),
    s('a7', 'Deep Tissue Massage',   '110.00', '90 min'),
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
  andere: [
    c('ca1', 'SOMMER DEAL',   'Wellness Paket Deluxe',      'Aromamassage + Hot Stone — 2 Stunden Entspannung.','89,00€', '120,00€', 'JETZT BUCHEN', 'self_improvement'),
    c('ca2', 'NEU',           'Lash & Brow Kombi-Set',      'Wimpernverlängerung + Brow Lamination im Kombi-Angebot.','155,00€','195,00€', 'JETZT BUCHEN', 'face_retouching_natural'),
  ],
};

export type OpeningDay = { day: string; open: string; close: string; closed: boolean };

export type SiteSettings = {
  name: string; tagline: string; address: string; phone: string; email: string; whatsapp: string;
  calendarUrl: string; whatsappMsg: string; bookingActive: boolean; whatsappActive: boolean;
  instagram: string; facebook: string; tiktok: string; google: string;
  heroImages: [string, string, string, string];
  promoImage: string; aboutImage: string;
  hours: OpeningDay[];
};

export const INIT_SETTINGS: SiteSettings = {
  name: 'EPILISSE Beauty Studio',
  tagline: 'Luxury Beauty Care Munich',
  address: 'Musterstraße 1, 80331 München',
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
  heroImages: ['', '', '', ''],
  promoImage: '',
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

export const FRONTEND_SLUG: Record<string, string> = {
  laser:   'laser-haarentfernung',
  gesicht: 'gesichtsaesthetik',
  body:    'body-contouring',
  inject:  'injectables',
  mani:    'manikure-pedikure',
  andere:  'andere',
};

export const PREVIEW_GRADIENT: Record<string, string> = {
  laser:   'linear-gradient(135deg,#fff8e7 0%,#f5e5a0 100%)',
  gesicht: 'linear-gradient(135deg,#fff0f5 0%,#fdd5e8 100%)',
  body:    'linear-gradient(135deg,#f0f9ff 0%,#bae6fd 100%)',
  inject:  'linear-gradient(135deg,#faf5ff 0%,#d8b4fe 100%)',
  mani:    'linear-gradient(135deg,#fff1f2 0%,#fecdd3 100%)',
  andere:  'linear-gradient(135deg,#ecfdf5 0%,#6ee7b7 100%)',
};

export type PageBanner = {
  label: string; title: string; body: string; cta: string; icon: string; image: string;
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
    heroImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA3IvtG-coL1R-rxRRkCnvRhXTeCycUg1nJq-MJ9OwNUG_hyq5EKihhgBnZ6-I8FAXVro5Kaa5XCJjLSIsa6Xb7xroT8mf9NdJM89YISQMXd0yIQ_HlT9Ex29xuoiRwoTc0hr0Yn3r8_n9K0e5RlFX-CeRmNZdVeFcpCDBQ0OB8n0Y6aBnvXrJX1wH1cWYO97zGEQPOmnnZE13-I2ZEY81xSze4Uv-GEDoHwfTQnB2_t-NNQGEPkoA5XgHE4w9KWM4CAJG-EdG8Cy_z',
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
    campaign1: { label: 'Limited Edition Offer', title: 'Kombi-Paket Kampagne', body: 'Buchen Sie ein Paket aus 3 Behandlungszonen und erhalten Sie die günstigste Zone komplett kostenfrei. Gültig für alle Laser-Treatments in diesem Monat.', cta: 'JETZT SICHERN', icon: 'auto_awesome', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDpZoen6Z8-BkUl8prQYXf0Xd1Phn1Xdcuk_VZ-IofB9pCsDecKCUdvXaAoDYxIvL3Pd7MzIsqk1Qsa1ZfN8QNOHMUhZWC4pSKfwKd1kxuc1UmJnIvzSkftdtB_72BxCD3RsoYfSP9DCDgl7Hu2Txw7HLS7n783Lh-uDnPYuVXqfLwu3QW9RvZwYy-yu30PukyuMKxMBOWOlrxhxQXQMiIRW8nVG7y5oMjkK0lvir7cCDbsFPR1OXu3dQoZxS2tCiISP8GlPzFjtSct' },
    campaign2: { label: 'Exklusives Treue-Special', title: 'Freunde-Werben-Programm', body: 'Empfehlen Sie uns weiter und erhalten Sie beide 20% Rabatt auf Ihre nächste Laser-Sitzung. Geteilte Schönheit ist doppelte Freude.', cta: 'MEHR ERFAHREN', icon: 'loyalty', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDYjBxY_5jgd1zV3S6f54auMKfGGrnf_nUDyMDjmdGw6dVJQPTKNZXlcxViHrvhn3b9sU8vdRuY0Xo9vEk7B573gKj1u-y7pJ2RLNt8eovCEdgIfX73mrjoHjaA3SDuEEJ1n6fW9cjPUQRG1MBg6BmBXeVpB0vp9OV9zMxedArRK3iI3ABfEbRu1rAjMaDK3q03AYuDoduRWP6uzj-vI2lXCRNfACkm5S1slmgz-wR_-8LhNNfmFX8spaZGMk9NBX6GBPzQ7BmFrvnB' },
  },
  gesicht: {
    label: 'Premium Skin Care',
    h1: 'Gesichtsästhetik',
    heroDesc: 'Individuelle Gesichtsbehandlungen auf höchstem Niveau. Von HydraFacial über Microneedling bis zu chemischen Peelings – für strahlendes, jugendliches Hautbild.',
    heroImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDrgLWhl7EjgUAhqHCfTK1D52PmXPF9J-BJYYc_ojdoV_gy4UGXEjkgANF3wWYjHqy53LTIplM-oEpi7cxFjRPMtQ1bDsidV5LBX3bL8Sfb-RDP7uopJFXAFj30wN3qxWCSR6iuYoaAF86bhNElVdByUZ2wKcEt_5GPybU5jCI8h0_dZa6oLHxRSXbODo0jVVObxQw5TcoKOL-Xy3V_7f0RZxvB2a9aoXyvX-0QNPChRJ8wJT_7b5ipFi3L6aybwqTrlQZMuPLtmWRQ',
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
    campaign1: { label: 'Seasonal Special', title: 'Frühlingsfrische Haut', body: 'Starten Sie mit strahlender Haut in den Frühling: Buchen Sie HydraFacial Deluxe und erhalten Sie ein Chemical Peeling Ihrer Wahl zum Sonderpreis. Gültig bis Ende März.', cta: 'JETZT SICHERN', icon: 'spa', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDpZoen6Z8-BkUl8prQYXf0Xd1Phn1Xdcuk_VZ-IofB9pCsDecKCUdvXaAoDYxIvL3Pd7MzIsqk1Qsa1ZfN8QNOHMUhZWC4pSKfwKd1kxuc1UmJnIvzSkftdtB_72BxCD3RsoYfSP9DCDgl7Hu2Txw7HLS7n783Lh-uDnPYuVXqfLwu3QW9RvZwYy-yu30PukyuMKxMBOWOlrxhxQXQMiIRW8nVG7y5oMjkK0lvir7cCDbsFPR1OXu3dQoZxS2tCiISP8GlPzFjtSct' },
    campaign2: { label: 'Exklusives Membership', title: 'HydraFacial Membership', body: 'Werden Sie Teil unserer exklusiven Mitgliedergemeinschaft und genießen Sie monatliche HydraFacial-Behandlungen zu Vorzugspreisen. Dauerhaft strahlende Haut als Lifestyle.', cta: 'MEHR ERFAHREN', icon: 'diamond', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDrgLWhl7EjgUAhqHCfTK1D52PmXPF9J-BJYYc_ojdoV_gy4UGXEjkgANF3wWYjHqy53LTIplM-oEpi7cxFjRPMtQ1bDsidV5LBX3bL8Sfb-RDP7uopJFXAFj30wN3qxWCSR6iuYoaAF86bhNElVdByUZ2wKcEt_5GPybU5jCI8h0_dZa6oLHxRSXbODo0jVVObxQw5TcoKOL-Xy3V_7f0RZxvB2a9aoXyvX-0QNPChRJ8wJT_7b5ipFi3L6aybwqTrlQZMuPLtmWRQ' },
  },
  body: {
    label: 'Body Sculpting',
    h1: 'Body Contouring',
    heroDesc: 'Modernste non-invasive Körperformung für definierte Konturen und straffere Haut. Kryolipolyse, RF-Lifting und Ultraschall-Kavitation auf premium Niveau.',
    heroImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAS7VEqn3YLIpzxeNRbM1gcyi8MJr1qDdhCbgVl3FgIek9EyqNPv0_RSpzK4D8Fj_sjWdLM3pAfQAOR3aelWP54bwPTkASLYexbRvDWiWqoOKudhs8auDngKhBI3OapBF6Q5nwLH0MoCdYY77ZDOyrZ4Utsa0vpTToujP6rCNRlUYOJkmc6h4lIkPVLpiYi_z5U9a40yt2bqbxzsI4U_adkDSi5HdYRzHkCtDQUSdtlUs2B7TFDMBv6Br8-tRgx1sCaravafH3RZyOU',
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
    campaign1: { label: 'Summer Edition', title: 'Summer Ready Body', body: 'Bereiten Sie Ihren Körper auf die Strandsaison vor: Buchen Sie 2 Kryolipolyse-Zonen und erhalten Sie eine Ultraschall-Kavitation-Sitzung kostenfrei dazu. Limitiertes Angebot bis Mai.', cta: 'JETZT SICHERN', icon: 'self_improvement', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDpZoen6Z8-BkUl8prQYXf0Xd1Phn1Xdcuk_VZ-IofB9pCsDecKCUdvXaAoDYxIvL3Pd7MzIsqk1Qsa1ZfN8QNOHMUhZWC4pSKfwKd1kxuc1UmJnIvzSkftdtB_72BxCD3RsoYfSP9DCDgl7Hu2Txw7HLS7n783Lh-uDnPYuVXqfLwu3QW9RvZwYy-yu30PukyuMKxMBOWOlrxhxQXQMiIRW8nVG7y5oMjkK0lvir7cCDbsFPR1OXu3dQoZxS2tCiISP8GlPzFjtSct' },
    campaign2: { label: 'Kombinationstherapie', title: 'Shape & Glow Kombi-Set', body: 'Maximale Ergebnisse durch intelligente Kombination: Body Contouring mit anschließender Hautstrafftung via RF-Lifting. Zwei Technologien, ein harmonisches Ergebnis.', cta: 'MEHR ERFAHREN', icon: 'fitness_center', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAS7VEqn3YLIpzxeNRbM1gcyi8MJr1qDdhCbgVl3FgIek9EyqNPv0_RSpzK4D8Fj_sjWdLM3pAfQAOR3aelWP54bwPTkASLYexbRvDWiWqoOKudhs8auDngKhBI3OapBF6Q5nwLH0MoCdYY77ZDOyrZ4Utsa0vpTToujP6rCNRlUYOJkmc6h4lIkPVLpiYi_z5U9a40yt2bqbxzsI4U_adkDSi5HdYRzHkCtDQUSdtlUs2B7TFDMBv6Br8-tRgx1sCaravafH3RZyOU' },
  },
  inject: {
    label: 'Aesthetic Medicine',
    h1: 'Injectables',
    heroDesc: 'Präzise ästhetische Medizin für natürliche Verjüngung. Botulinum Toxin, Hyaluronsäure und Profhilo – individuell dosiert für ein authentisches, ausgeruhtes Erscheinungsbild.',
    heroImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB2R1r5IBHzprIEBLdeHT1f02OFMOX85Ol0fXFMTE8Mn9Nlc1lMes1BoOgj1lwKVSGR-dIFS-r-gyxMLZZESLXUcH_zS9UBq5T3z81zaxMXyfkXaTN50ZQOxmiM9kMWb4FbuKoODmgwAvE3ta_i60Ekgbw0pVcC1SjtZtC__ZxTNJSwkcNaB_h8XguwNKKEQmQHrBovNuCFUoWvqMpN2bzbrTH7ZN2a66uUpCi_65MRDuC8j05691WrlUa-ULD7rQ27qkKsnnnR_7Q7',
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
    campaign1: { label: 'Signature Package', title: 'Natural Beauty First', body: 'Entdecken Sie unsere beliebteste Kombination: Botulinum Toxin für 3 Zonen kombiniert mit Hyaluronsäure Lippen-Augmentation. Inklusive kostenlosem Folgetermin nach 2 Wochen.', cta: 'JETZT SICHERN', icon: 'face_retouching_natural', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDpZoen6Z8-BkUl8prQYXf0Xd1Phn1Xdcuk_VZ-IofB9pCsDecKCUdvXaAoDYxIvL3Pd7MzIsqk1Qsa1ZfN8QNOHMUhZWC4pSKfwKd1kxuc1UmJnIvzSkftdtB_72BxCD3RsoYfSP9DCDgl7Hu2Txw7HLS7n783Lh-uDnPYuVXqfLwu3QW9RvZwYy-yu30PukyuMKxMBOWOlrxhxQXQMiIRW8nVG7y5oMjkK0lvir7cCDbsFPR1OXu3dQoZxS2tCiISP8GlPzFjtSct' },
    campaign2: { label: 'Erstkunden-Angebot', title: 'Beratungs-Special', body: 'Ihr Weg zu mehr Ausstrahlung beginnt mit einem Gespräch: Kostenlose Erstberatung und 15% Rabatt auf Ihre erste Injectable-Behandlung. Diskret, professionell, natürlich.', cta: 'TERMIN VEREINBAREN', icon: 'health_and_beauty', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB2R1r5IBHzprIEBLdeHT1f02OFMOX85Ol0fXFMTE8Mn9Nlc1lMes1BoOgj1lwKVSGR-dIFS-r-gyxMLZZESLXUcH_zS9UBq5T3z81zaxMXyfkXaTN50ZQOxmiM9kMWb4FbuKoODmgwAvE3ta_i60Ekgbw0pVcC1SjtZtC__ZxTNJSwkcNaB_h8XguwNKKEQmQHrBovNuCFUoWvqMpN2bzbrTH7ZN2a66uUpCi_65MRDuC8j05691WrlUa-ULD7rQ27qkKsnnnR_7Q7' },
  },
  mani: {
    label: 'Esthetic Care',
    h1: 'Maniküre & Pediküre',
    heroDesc: 'Höchste Perfektion und luxuriöse Entspannung für Hände und Füße. Medizinische Sorgfalt trifft ästhetische Meisterschaft – für ein Erscheinungsbild, das überzeugt.',
    heroImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAtJndxncsaGViuLmDZDBacgojv8siWTA93LPFPxNKQpEt2zcmQOehCknTGGJyu6i6UnkaiofOhED7An8f2QpALTSIozuiak5h3D6E_eJGWt9ZvHmvNcykq9-o53KhIoV6PlcBlXDxkJoMv-p60rCfkvezFpByYXAE-Nf2Yqu6Ce3WZ-puxUEYanR11hTB_J-X_htoKYgGVsUvScVZLae2VUaXdaKyQuFNuH1TxcUFPuaVWjKQRAg8BbvmnFqGiwILaxXwCVD4uJQFs',
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
    campaign1: { label: 'Limited Edition', title: 'Velvet Touch Combo', body: 'Das ultimative Duo: Spa-Maniküre & Spa-Pediküre inkl. Shellac und einem Glas Champagner während der Behandlung. Normaler Einzelpreis: 180 € – jetzt 145 €.', cta: 'ANGEBOT SICHERN', icon: 'favorite', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD9Jgcgz1lnxvUeFEc6mJMhe2fEQ_S7p7HqKt66Xz-k9ENiAAqtl5TMcgoL8KLRf78R0-wppwEv-4FLWZqaQ-5eJphTdHeXT8VwSjV2KqVi_XldRkOSaQSereWSQNPe2HOnDACmji6f22QeEcZUQSqoZHT7oiyLRNYYPsb69N6HuRaI0SUP0BrdNcAW08nJmomDxLZadSl9ZKoER-eetlH2O2cNrFikoJfTnvg0pKM_AvPxwDxBPA6NpLhfP0TI-YyWHtuvNutTlkHk' },
    campaign2: { label: 'Exklusives Membership', title: 'Nail Membership', body: 'Monatliche Shellac-Maniküre zum exklusiven Vorzugspreis. Als Mitglied profitieren Sie von Premium-Service, Prioritätsbuchung und 10% Rabatt auf alle Zusatzleistungen.', cta: 'MEHR ERFAHREN', icon: 'card_membership', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAtJndxncsaGViuLmDZDBacgojv8siWTA93LPFPxNKQpEt2zcmQOehCknTGGJyu6i6UnkaiofOhED7An8f2QpALTSIozuiak5h3D6E_eJGWt9ZvHmvNcykq9-o53KhIoV6PlcBlXDxkJoMv-p60rCfkvezFpByYXAE-Nf2Yqu6Ce3WZ-puxUEYanR11hTB_J-X_htoKYgGVsUvScVZLae2VUaXdaKyQuFNuH1TxcUFPuaVWjKQRAg8BbvmnFqGiwILaxXwCVD4uJQFs' },
  },
  andere: {
    label: 'Wellness & Beauty',
    h1: 'Andere',
    heroDesc: 'Gönnen Sie sich eine Auszeit vom Alltag — von entspannenden Massagen bis zu professionellem Lash & Brow Styling. Ihr Wohlbefinden ist unsere Passion.',
    heroImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCDCTVBkANRMCY5r7E2JLvTph0kXEA4T7GxktWv_bKMsgdG-AzO4MqdgFWvxeMIo4R4mlT3yzjHXFTmz2RMdSYBujyVKX-cIPUOMYrFBB2ecuVjcgYnes1xN_ami77RkyJfoZ850mfG5EwXU8-B_9qIIv66-_hQmWFSIruc6mQD8FuAZoQ9poHrEZJ1OhiQ92g2-Wr5bKJd6ZeyHf3zmq1k6SioVRtxAlftGRh3_AXEo5W9nWYw4m18vMFt9BX55pIVBkjVLW8zw2To',
    infoTitle: 'Körper, Geist & Seele',
    infoParagraphs: [
      'Unser Wellness-Bereich bietet Ihnen eine einzigartige Kombination aus ganzheitlichen Körperbehandlungen und präzisem Beauty-Styling. Von der tiefen Muskelentspannung durch Hot Stone-Massage bis zur eleganten Wimpernverlängerung — wir verbinden Wohlbefinden mit Ästhetik.',
      'Jede Behandlung wird individuell auf Ihre Bedürfnisse abgestimmt. Unsere zertifizierten Therapeutinnen setzen hochwertige Produkte und modernste Techniken ein, damit Sie das Studio nicht nur schöner, sondern auch entspannter und ausgeglichener verlassen.',
    ],
    benefitsTitle: 'Ihre Vorteile',
    benefits: [
      'Tiefe Muskelentspannung und nachhaltige Stressreduktion',
      'Professionelles Lash & Brow Styling für einen perfekten Auftritt',
      'Natürliche Inhaltsstoffe für maximale Hautverträglichkeit',
      'Flexible Kombination mehrerer Treatments in einer Sitzung',
    ],
    campaign1: { label: 'Sommer Deal', title: 'Wellness Paket Deluxe', body: 'Aromamassage + Hot Stone Massage — 2 Stunden pure Entspannung zum Sonderpreis. Perfekt für Körper und Geist.', cta: 'JETZT BUCHEN', icon: 'spa', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB19c_exWt7H0n9vAsZz2kxGDGG-6ta5oPx7QUek7amnLk9lSKwX1U_2_UteAPk9YQWV_scOgE7XPR5xRwTS7UypBg55Iu2kTWSkUW7OqfwIwzNXIySxYdJxoUlzxitWwOn7KgNTrchQ3eQQbo5DN4XztJEAbo0D3vbPu97mCC59GSXoe7oe1x7mq3RC3iapMSvwggpNh8aqy0oMDqRZSfEq4tlt61cSnUlFuSXgKZjLrmBnJxSZ6geu2ibj9T1rqUv8BoIVmoSYDke' },
    campaign2: { label: 'Neu im Sortiment', title: 'Lash & Brow Kombi-Set', body: 'Wimpernverlängerung + Brow Lamination im attraktiven Kombi-Angebot. Perfekter Look — komplett in einer Sitzung.', cta: 'MEHR ERFAHREN', icon: 'auto_fix_high', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDIuAiDdbAK4CrXw6oHsfzE6njj8oU_GLTVmeN887IeJ9LSEhN3wMEyrsaniFNs6hCqZqiBWwa6T3DLyBT1xiUX-ltBxIZz1qmQ225pSUE2_r-F6xiecsWuxSwFSuALS27sTeLB-zBdRQH8wHKf238lSfEkgf6PS5Ui-fa1WSDmHkJrtrkSPfoxQ2avWCM-quoxjreGE1a1JTpQsscngWwDnXqKUEY6HX5K4eolmXmjl6n8XLFOAOvahUS_bUyEjdBhoQA5--HmLmCN' },
  },
};
