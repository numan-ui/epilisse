'use client';
import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import {
  INIT_SERVICES, INIT_AKTIONEN, AKTION_CATEGORY_LIMIT, INIT_PAGE_CONTENT, CATEGORIES, INIT_SETTINGS, INIT_LANDING_CONTENT,
  INIT_HERO_SLIDES, HERO_SLIDE_LIMIT, INIT_ABOUT_VALUES, ABOUT_VALUE_LIMIT,
  INIT_REVIEWS, REVIEW_LIMIT,
  type Service, type Aktion, type Category, type PageContent, type PageContentMap,
  type PageBanner, type SiteSettings, type LandingContent, type HeroSlide, type AboutValue, type Review,
  type SiteContent,
} from './data';
import { deriveAktionen } from '@/lib/aktion';

type ServicesMap  = Record<string, Service[]>;

const LS_SVC = 'epilisse_admin_services';
const LS_AKT = 'epilisse_admin_aktionen';
const LS_PC  = 'epilisse_admin_page_content';
const LS_CAT = 'epilisse_admin_categories';
const LS_SET = 'epilisse_admin_settings';
const LS_LC  = 'epilisse_admin_landing_content';
const LS_HERO  = 'epilisse_admin_hero_slides';
const LS_ABOUT = 'epilisse_admin_about_values';
const LS_REVIEWS = 'epilisse_admin_reviews';

const ls = {
  read: <T,>(key: string): T | null => {
    if (typeof window === 'undefined') return null;
    try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : null; } catch { return null; }
  },
  write: (key: string, v: unknown) => {
    if (typeof window === 'undefined') return;
    try { localStorage.setItem(key, JSON.stringify(v)); } catch {}
  },
};

const defaultServices    = (): ServicesMap     =>
  Object.fromEntries(Object.entries(INIT_SERVICES).map(([k, v]) => [k, v.map(s => ({ ...s }))]));
const defaultPageContent = (): PageContentMap  =>
  Object.fromEntries(Object.entries(INIT_PAGE_CONTENT).map(([k, v]) => [k, { ...v, infoParagraphs: [...v.infoParagraphs] as [string, string], benefits: [...v.benefits], campaign1: { ...v.campaign1 }, campaign2: { ...v.campaign2 } }]));

const emptyPageBanner = (): PageBanner => ({ label: '', title: '', body: '', cta: 'JETZT BUCHEN', icon: 'auto_fix_high', image: '' });

/** A blank page for a category that has no stored/seeded page content (e.g. a cat-* category pulled from the shared draft on a browser that never created it locally). */
const blankPageContent = (cat: Pick<Category, 'name' | 'desc'>): PageContent => ({
  label: cat.desc || cat.name,
  h1: cat.name,
  heroDesc: cat.desc || '',
  heroImage: '',
  infoTitle: cat.name,
  infoParagraphs: ['', ''],
  benefitsTitle: 'Ihre Vorteile',
  benefits: [],
  campaign1: emptyPageBanner(),
  campaign2: emptyPageBanner(),
});

interface AdminDataCtx {
  services:  ServicesMap;
  aktionen: Aktion[];
  pageContent: PageContentMap;
  categories: Category[];
  categoriesLoaded: boolean;
  settings: SiteSettings;
  landingContent: LandingContent;
  heroSlides: HeroSlide[];
  aboutValues: AboutValue[];
  reviews: Review[];
  updateService:        (catId: string, id: string, field: keyof Service,  value: string | boolean) => void;
  deleteService:        (catId: string, id: string) => void;
  addService:           (catId: string, svc: Omit<Service, 'id'>) => void;
  updateAktion:         (id: string, field: keyof Aktion, value: string | boolean) => void;
  addAktion:            (category: string) => void;
  removeAktion:         (id: string) => void;
  updatePageField:      (catId: string, field: keyof Omit<PageContent, 'infoParagraphs' | 'benefits' | 'campaign1' | 'campaign2'>, value: string) => void;
  updatePageParagraph:  (catId: string, index: 0 | 1, value: string) => void;
  updatePageBenefit:    (catId: string, index: number, value: string) => void;
  addPageBenefit:       (catId: string) => void;
  removePageBenefit:    (catId: string, index: number) => void;
  updatePageBanner:     (catId: string, which: 1 | 2, field: keyof PageBanner, value: string) => void;
  addCategory:    (cat: Omit<Category, 'id'>, templateCatId?: string) => void;
  updateCategory: (id: string, field: keyof Category, value: string | boolean) => void;
  deleteCategory: (id: string) => void;
  updateSetting:  <K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) => void;
  updateSettingHours: (index: number, field: 'open' | 'close' | 'closed', value: string | boolean) => void;
  updateLandingField: <K extends keyof LandingContent>(key: K, value: LandingContent[K]) => void;
  updateHeroSlide: (id: string, field: keyof HeroSlide, value: string | number) => void;
  addHeroSlide: () => void;
  removeHeroSlide: (id: string) => void;
  reorderHeroSlide: (id: string, position: number) => void;
  updateAboutValue: (id: string, field: keyof AboutValue, value: string) => void;
  addAboutValue: () => void;
  removeAboutValue: (id: string) => void;
  updateReview: (id: string, field: keyof Review, value: string | boolean) => void;
  addReview: (r: Omit<Review, 'id'>) => void;
  removeReview: (id: string) => void;
}

const Ctx = createContext<AdminDataCtx | null>(null);

export function AdminDataProvider({ children }: { children: ReactNode }) {
  const [services,    setServices]    = useState<ServicesMap>(defaultServices);
  const [aktionen,    setAktionen]    = useState<Aktion[]>(() => INIT_AKTIONEN.map(a => ({ ...a })));
  const [pageContent, setPageContent] = useState<PageContentMap>(defaultPageContent);
  const [categories,  setCategories]  = useState<Category[]>(CATEGORIES.map(c => ({ ...c })));
  // Flips true once the localStorage-load effect below has run, together with (batched
  // in the same commit as) whatever categories it loaded — see the draft write-through
  // effect further down for why this can't be a plain ref (timing: a ref flips before
  // the loaded categories value has actually committed, which would PUT fresh-mount
  // defaults into `draft` and clobber a real admin's saved list).
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);
  // Same role as categoriesLoaded, for the page-content draft write-through below.
  const [pageContentLoaded, setPageContentLoaded] = useState(false);
  // Same role, for the rest of the CMS bundle (services/campaigns/settings/… → /api/content).
  const [siteContentLoaded, setSiteContentLoaded] = useState(false);
  const [settings,    setSettings]    = useState<SiteSettings>({ ...INIT_SETTINGS, hours: INIT_SETTINGS.hours.map(h => ({ ...h })) });
  const [landingContent, setLandingContent] = useState<LandingContent>({ ...INIT_LANDING_CONTENT });
  const [heroSlides, setHeroSlides]   = useState<HeroSlide[]>(INIT_HERO_SLIDES.map(s => ({ ...s })));
  const [aboutValues, setAboutValues] = useState<AboutValue[]>(INIT_ABOUT_VALUES.map(v => ({ ...v })));
  const [reviews, setReviews] = useState<Review[]>(INIT_REVIEWS.map(r => ({ ...r })));

  useEffect(() => {
    const svcs = ls.read<ServicesMap>(LS_SVC);
    const akt  = ls.read<Aktion[]>(LS_AKT);
    const pc   = ls.read<PageContentMap>(LS_PC);
    const cats = ls.read<Category[]>(LS_CAT);
    const set  = ls.read<SiteSettings>(LS_SET);
    const lc   = ls.read<LandingContent>(LS_LC);
    const hero = ls.read<HeroSlide[]>(LS_HERO);
    const about = ls.read<AboutValue[]>(LS_ABOUT);
    const revs  = ls.read<Review[]>(LS_REVIEWS);
    if (svcs) setServices(svcs);
    if (akt && akt.length > 0) setAktionen(akt);
    if (set)  setSettings(prev => ({ ...prev, ...set, hours: set.hours ?? prev.hours }));
    if (lc)   setLandingContent(prev => ({ ...prev, ...lc }));
    if (hero && hero.length > 0) setHeroSlides(hero);
    if (about && about.length > 0) setAboutValues(about);
    if (revs  && revs.length > 0)  setReviews(revs);

    // The rest of the CMS bundle → site_content.draft. Same fresh-browser
    // seeding logic as categories/page-content: a browser with a local copy
    // uses it; one without seeds from `draft` (the shared source of truth)
    // rather than the hardcoded INIT_* defaults, so the write-through below
    // can't overwrite the shared draft with those.
    const hasLocalSite = !!(svcs || akt || set || lc || hero || about || revs);
    if (hasLocalSite) {
      setSiteContentLoaded(true);
    } else {
      (async () => {
        try {
          const r = await fetch('/api/content?content=draft');
          if (!r.ok) return; // auth/network failure — leave siteContentLoaded false
          const res = (await r.json()) as { draft: SiteContent | null };
          const d = res.draft;
          if (d && Object.keys(d).length > 0) {
            if (d.services) setServices(d.services);
            const derivedAkt = deriveAktionen(d);
            if (derivedAkt.length > 0) setAktionen(derivedAkt);
            if (d.settings) setSettings(prev => ({ ...prev, ...d.settings, hours: d.settings!.hours ?? prev.hours }));
            if (d.landingContent) setLandingContent(prev => ({ ...prev, ...d.landingContent }));
            if (d.heroSlides && d.heroSlides.length > 0) setHeroSlides(d.heroSlides);
            if (d.aboutValues && d.aboutValues.length > 0) setAboutValues(d.aboutValues);
            if (d.reviews && d.reviews.length > 0) setReviews(d.reviews);
          }
          setSiteContentLoaded(true);
        } catch {
          // Network failure — leave siteContentLoaded false, disabling the
          // write-through for this session rather than risking a clobber.
        }
      })();
    }

    // Drop stale localStorage entries for built-in categories removed from code (e.g. a deleted default category).
    const validCats = cats ? cats.filter(c => CATEGORIES.some(d => d.id === c.id) || c.id.startsWith('cat-')) : [];
    if (validCats.length > 0) {
      setCategories(validCats);
      if (validCats.length !== cats!.length) ls.write(LS_CAT, validCats);
      setCategoriesLoaded(true);
    } else {
      // This browser has no (valid) local copy — could be a genuinely fresh
      // admin, or just a device/profile/incognito tab that never saved one.
      // The category list in `draft` is the real shared source of truth, so
      // seed from there instead of the hardcoded CATEGORIES defaults: writing
      // those 3 defaults into `draft` via the write-through below would wipe
      // out every admin-created category for every visitor and every other
      // browser (this was happening — reported as "database keeps resetting
      // to 3 categories").
      (async () => {
        try {
          const r = await fetch('/api/categories?content=draft');
          if (!r.ok) return; // auth/network failure — leave categoriesLoaded false, see below
          const res = (await r.json()) as { draft: Category[] | null };
          if (res.draft && res.draft.length > 0) {
            setCategories(res.draft);
            ls.write(LS_CAT, res.draft);
          }
          // res.draft empty/null is a real signal (nothing published yet) — safe to proceed.
          setCategoriesLoaded(true);
        } catch {
          // Network failure: we genuinely don't know what's in `draft`. Leave
          // categoriesLoaded false rather than risk it — this disables the
          // write-through for the rest of this session (no autosave of the
          // category list) instead of risking overwriting the shared draft
          // with the fresh-mount CATEGORIES defaults.
        }
      })();
    }

    // Page content — same draft-seeding logic as categories above. A browser
    // with a local copy uses it; one without seeds from `draft` (the shared
    // source of truth) rather than the 3 hardcoded INIT_PAGE_CONTENT defaults,
    // so the write-through below can't overwrite the shared draft — and every
    // admin-created category's Seiteninhalt — with those.
    if (pc && Object.keys(pc).length > 0) {
      setPageContent(pc);
      setPageContentLoaded(true);
    } else {
      (async () => {
        try {
          const r = await fetch('/api/page-content?content=draft');
          if (!r.ok) return; // auth/network failure — leave pageContentLoaded false
          const res = (await r.json()) as { draft: PageContentMap | null };
          if (res.draft && Object.keys(res.draft).length > 0) {
            setPageContent(res.draft);
            ls.write(LS_PC, res.draft);
          }
          setPageContentLoaded(true);
        } catch {
          // Network failure — leave pageContentLoaded false, disabling the
          // write-through for this session rather than risking a clobber.
        }
      })();
    }
  }, []);

  /* ── Categories draft write-through ───────────────────
     The admin's category list stays localStorage-backed above for the
     editing UX itself, but is also mirrored to Supabase `draft` (debounced)
     so the public site — SSR-fed via getServerCategories — can reflect it
     (locally with CONTENT_PREVIEW=1, and everywhere once "Veröffentlichen"
     publishes). Guarded on categoriesLoaded so this never fires with the
     fresh-mount CATEGORIES default before the localStorage value above has
     actually loaded. */
  useEffect(() => {
    if (!categoriesLoaded) return;
    const timer = setTimeout(() => {
      fetch('/api/categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categories),
      }).catch(() => { /* best-effort — admin's localStorage copy remains the source of truth for the editing UI regardless */ });
    }, 700);
    return () => clearTimeout(timer);
  }, [categories, categoriesLoaded]);

  /* ── Page-content self-heal ───────────────────────────
     On a browser that received a cat-* category from the shared `draft` — or
     one whose LS_PC write was lost to a quota error — the matching pageContent
     entry can be missing, which used to hide the entire "Seiteninhalt" editor
     for that category. Backfill a blank page for any category without one so
     the editor always renders. Runs once page content has loaded. */
  useEffect(() => {
    if (!categoriesLoaded) return;
    setPageContent(prev => {
      const missing = categories.filter(c => !prev[c.id]);
      if (missing.length === 0) return prev;
      const next = { ...prev };
      for (const c of missing) next[c.id] = blankPageContent(c);
      ls.write(LS_PC, next);
      return next;
    });
  }, [categories, categoriesLoaded, pageContentLoaded]);

  /* ── Page-content draft write-through ─────────────────
     Mirrors the category list one above: the admin's Seiteninhalt stays
     localStorage-backed for the editing UX, but is also debounced-mirrored to
     Supabase `site_page_content.draft` so the public service pages — SSR-fed
     via getServerPageContent — can reflect it (locally with CONTENT_PREVIEW=1,
     everywhere once "Veröffentlichen" publishes). Guarded on pageContentLoaded
     so it never fires with the fresh-mount INIT_PAGE_CONTENT default before
     the real value has loaded. */
  useEffect(() => {
    if (!pageContentLoaded) return;
    const timer = setTimeout(() => {
      fetch('/api/page-content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pageContent),
      }).catch(() => { /* best-effort — admin's localStorage copy stays the source of truth for the editing UI */ });
    }, 700);
    return () => clearTimeout(timer);
  }, [pageContent, pageContentLoaded]);

  /* ── CMS bundle draft write-through ───────────────────
     services / campaigns / settings / landing copy / hero slides / promo
     banners / about values / reviews → site_content.draft (debounced). Same
     guard rationale as the two above. */
  useEffect(() => {
    if (!siteContentLoaded) return;
    const bundle: SiteContent = {
      services, aktionen, settings, landingContent,
      heroSlides, aboutValues, reviews,
    };
    const timer = setTimeout(() => {
      fetch('/api/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bundle),
      }).catch(() => { /* best-effort */ });
    }, 700);
    return () => clearTimeout(timer);
  }, [services, aktionen, settings, landingContent, heroSlides, aboutValues, reviews, siteContentLoaded]);

  /* ── Services ────────────────────────────────────── */
  const updateService = useCallback((catId: string, id: string, field: keyof Service, value: string | boolean) =>
    setServices(prev => {
      const next = { ...prev, [catId]: prev[catId].map(s => s.id === id ? { ...s, [field]: value } : s) };
      ls.write(LS_SVC, next); return next;
    }), []);

  const deleteService = useCallback((catId: string, id: string) =>
    setServices(prev => {
      const next = { ...prev, [catId]: prev[catId].filter(s => s.id !== id) };
      ls.write(LS_SVC, next); return next;
    }), []);

  const addService = useCallback((catId: string, svc: Omit<Service, 'id'>) =>
    setServices(prev => {
      const next = { ...prev, [catId]: [...(prev[catId] ?? []), { ...svc, id: `s-${Date.now()}` }] };
      ls.write(LS_SVC, next); return next;
    }), []);

  /* ── Aktionen ─────────────────────────────────────── */
  const updateAktion = useCallback((id: string, field: keyof Aktion, value: string | boolean) =>
    setAktionen(prev => {
      const next = prev.map(a => a.id === id ? { ...a, [field]: value } : a);
      ls.write(LS_AKT, next); return next;
    }), []);

  const addAktion = useCallback((category: string) =>
    setAktionen(prev => {
      if (prev.filter(a => a.category === category).length >= AKTION_CATEGORY_LIMIT) return prev;
      const next: Aktion[] = [...prev, {
        id: `akt-${Date.now()}`, category,
        label: '', title: '', desc: '', price: '', oldPrice: undefined,
        cta: 'JETZT BUCHEN', icon: 'auto_fix_high', image: '', imagePosition: 'top',
        startDate: undefined, endDate: undefined,
        activeInCategory: true, activeOnHome: false,
      }];
      ls.write(LS_AKT, next); return next;
    }), []);

  const removeAktion = useCallback((id: string) =>
    setAktionen(prev => {
      const next = prev.filter(a => a.id !== id);
      ls.write(LS_AKT, next); return next;
    }), []);

  /* ── Page content ────────────────────────────────── */
  const _pcUpdate = useCallback((catId: string, updater: (pc: PageContent) => PageContent) =>
    setPageContent(prev => {
      const current = prev[catId] ?? INIT_PAGE_CONTENT[catId]
        ?? blankPageContent(categories.find(c => c.id === catId) ?? { name: '', desc: '' });
      const next = { ...prev, [catId]: updater(current) };
      ls.write(LS_PC, next); return next;
    }), [categories]);

  const updatePageField = useCallback((catId: string, field: keyof Omit<PageContent, 'infoParagraphs' | 'benefits' | 'campaign1' | 'campaign2'>, value: string) =>
    _pcUpdate(catId, pc => ({ ...pc, [field]: value })), [_pcUpdate]);

  const updatePageParagraph = useCallback((catId: string, index: 0 | 1, value: string) =>
    _pcUpdate(catId, pc => {
      const next: [string, string] = [pc.infoParagraphs[0], pc.infoParagraphs[1]];
      next[index] = value;
      return { ...pc, infoParagraphs: next };
    }), [_pcUpdate]);

  const updatePageBenefit = useCallback((catId: string, index: number, value: string) =>
    _pcUpdate(catId, pc => {
      const next = [...pc.benefits]; next[index] = value;
      return { ...pc, benefits: next };
    }), [_pcUpdate]);

  const addPageBenefit = useCallback((catId: string) =>
    _pcUpdate(catId, pc => ({ ...pc, benefits: [...pc.benefits, ''] })), [_pcUpdate]);

  const removePageBenefit = useCallback((catId: string, index: number) =>
    _pcUpdate(catId, pc => ({ ...pc, benefits: pc.benefits.filter((_, i) => i !== index) })), [_pcUpdate]);

  const updatePageBanner = useCallback((catId: string, which: 1 | 2, field: keyof PageBanner, value: string) =>
    _pcUpdate(catId, pc => {
      const key = which === 1 ? 'campaign1' : 'campaign2';
      return { ...pc, [key]: { ...pc[key], [field]: value } };
    }), [_pcUpdate]);

  /* ── Categories ──────────────────────────────────── */
  /** templateCatId: clone an existing category's page content, sample services and images as a starting point. */
  const addCategory = useCallback((cat: Omit<Category, 'id'>, templateCatId?: string) => {
    const id = `cat-${Date.now()}`;
    const template = templateCatId ? pageContent[templateCatId] : undefined;
    const templateCat = templateCatId ? categories.find(c => c.id === templateCatId) : undefined;
    const templateSvcs = templateCatId ? (services[templateCatId] ?? []) : [];
    const templateAkt  = templateCatId ? aktionen.filter(a => a.category === templateCatId) : [];

    setCategories(prev => {
      const image = cat.image || templateCat?.image || template?.heroImage || '';
      const next = [...prev, { ...cat, image, id }];
      ls.write(LS_CAT, next); return next;
    });

    // Seed a full page (hero/info/vorteile/banners) so the new category gets a detail page like the built-in ones —
    // cloned from the chosen template category when given, otherwise a blank starting point.
    setPageContent(prev => {
      const emptyBanner: PageBanner = { label: '', title: '', body: '', cta: 'JETZT BUCHEN', icon: 'auto_fix_high', image: '' };
      const seeded: PageContent = template
        ? {
            ...template,
            label: cat.desc || cat.name,
            h1: cat.name,
            heroDesc: cat.desc || template.heroDesc,
            infoTitle: cat.name,
            campaign1: { ...template.campaign1 },
            campaign2: { ...template.campaign2 },
          }
        : {
            label: cat.desc || cat.name,
            h1: cat.name,
            heroDesc: cat.desc || '',
            heroImage: '',
            infoTitle: cat.name,
            infoParagraphs: ['', ''],
            benefitsTitle: 'Ihre Vorteile',
            benefits: [],
            campaign1: { ...emptyBanner },
            campaign2: { ...emptyBanner },
          };
      const next: PageContentMap = { ...prev, [id]: seeded };
      ls.write(LS_PC, next); return next;
    });

    // Seed a handful of sample services (copied from the template) so the admin edits instead of starting from zero.
    if (templateSvcs.length > 0) {
      setServices(prev => {
        const cloned = templateSvcs.slice(0, 4).map((s, i) => ({ ...s, id: `s-${Date.now()}-${i}` }));
        const next = { ...prev, [id]: cloned };
        ls.write(LS_SVC, next); return next;
      });
    }

    // Seed the template's Aktionen too, so the Aktionen list isn't left empty.
    if (templateAkt.length > 0) {
      setAktionen(prev => {
        const cloned = templateAkt.map((a, i) => ({ ...a, id: `akt-${Date.now()}-${i}`, category: id }));
        const next = [...prev, ...cloned];
        ls.write(LS_AKT, next); return next;
      });
    }
  }, [categories, pageContent, services, aktionen]);

  const updateCategory = useCallback((id: string, field: keyof Category, value: string | boolean) =>
    setCategories(prev => {
      const next = prev.map(c => c.id === id ? { ...c, [field]: value } : c);
      ls.write(LS_CAT, next); return next;
    }), []);

  const deleteCategory = useCallback((id: string) => {
    if (!id.startsWith('cat-')) return; // core categories are fixed, only admin-created ones can be deleted
    setCategories(prev => {
      const next = prev.filter(c => c.id !== id);
      ls.write(LS_CAT, next); return next;
    });
    setPageContent(prev => {
      if (!(id in prev)) return prev;
      const { [id]: _drop, ...next } = prev;
      ls.write(LS_PC, next); return next;
    });
    setServices(prev => {
      if (!(id in prev)) return prev;
      const { [id]: _drop, ...next } = prev;
      ls.write(LS_SVC, next); return next;
    });
    setAktionen(prev => {
      const next = prev.filter(a => a.category !== id);
      if (next.length === prev.length) return prev;
      ls.write(LS_AKT, next); return next;
    });
  }, []);

  /* ── Settings ────────────────────────────────────── */
  const updateSetting = useCallback(<K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) =>
    setSettings(prev => {
      const next = { ...prev, [key]: value };
      ls.write(LS_SET, next); return next;
    }), []);

  const updateSettingHours = useCallback((index: number, field: 'open' | 'close' | 'closed', value: string | boolean) =>
    setSettings(prev => {
      const hours = prev.hours.map((h, i) => i === index ? { ...h, [field]: value } : h);
      const next = { ...prev, hours };
      ls.write(LS_SET, next); return next;
    }), []);

  /* ── Landing page content ────────────────────────── */
  const updateLandingField = useCallback(<K extends keyof LandingContent>(key: K, value: LandingContent[K]) =>
    setLandingContent(prev => {
      const next = { ...prev, [key]: value };
      ls.write(LS_LC, next); return next;
    }), []);

  /* ── Hero slides ─────────────────────────────────── */
  const updateHeroSlide = useCallback((id: string, field: keyof HeroSlide, value: string | number) =>
    setHeroSlides(prev => {
      const next = prev.map(s => s.id === id ? { ...s, [field]: value } : s);
      ls.write(LS_HERO, next); return next;
    }), []);

  const addHeroSlide = useCallback(() =>
    setHeroSlides(prev => {
      if (prev.length >= HERO_SLIDE_LIMIT) return prev;
      const next = [...prev, { id: `hero-${Date.now()}`, headline: '', sub: '', cta: 'TERMIN BUCHEN', ctaLink: '', image: '', duration: 8 }];
      ls.write(LS_HERO, next); return next;
    }), []);

  const removeHeroSlide = useCallback((id: string) =>
    setHeroSlides(prev => {
      if (prev.length <= 1) return prev;
      const next = prev.filter(s => s.id !== id);
      ls.write(LS_HERO, next); return next;
    }), []);

  /** Moves a slide to 1-indexed `position`, shifting the others — everyone else keeps their relative order. */
  const reorderHeroSlide = useCallback((id: string, position: number) =>
    setHeroSlides(prev => {
      const from = prev.findIndex(s => s.id === id);
      if (from === -1) return prev;
      const to = Math.max(0, Math.min(prev.length - 1, position - 1));
      if (to === from) return prev;
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      ls.write(LS_HERO, next); return next;
    }), []);

  /* ── Über Uns "Werte" ─────────────────────────────── */
  const updateAboutValue = useCallback((id: string, field: keyof AboutValue, value: string) =>
    setAboutValues(prev => {
      const next = prev.map(v => v.id === id ? { ...v, [field]: value } : v);
      ls.write(LS_ABOUT, next); return next;
    }), []);

  const addAboutValue = useCallback(() =>
    setAboutValues(prev => {
      if (prev.length >= ABOUT_VALUE_LIMIT) return prev;
      const next = [...prev, { id: `av-${Date.now()}`, icon: 'star', title: '', desc: '' }];
      ls.write(LS_ABOUT, next); return next;
    }), []);

  const removeAboutValue = useCallback((id: string) =>
    setAboutValues(prev => {
      if (prev.length <= 1) return prev;
      const next = prev.filter(v => v.id !== id);
      ls.write(LS_ABOUT, next); return next;
    }), []);

  /* ── Bewertungen (Treatwell reviews) ────────────────── */
  const updateReview = useCallback((id: string, field: keyof Review, value: string | boolean) =>
    setReviews(prev => {
      const next = prev.map(r => r.id === id ? { ...r, [field]: value } : r);
      ls.write(LS_REVIEWS, next); return next;
    }), []);

  const addReview = useCallback((r: Omit<Review, 'id'>) =>
    setReviews(prev => {
      if (prev.length >= REVIEW_LIMIT) return prev;
      const next = [...prev, { ...r, id: `rv-${Date.now()}` }];
      ls.write(LS_REVIEWS, next); return next;
    }), []);

  const removeReview = useCallback((id: string) =>
    setReviews(prev => {
      const next = prev.filter(r => r.id !== id);
      ls.write(LS_REVIEWS, next); return next;
    }), []);

  return (
    <Ctx.Provider value={{
      services, aktionen, pageContent, categories, categoriesLoaded, settings, landingContent, heroSlides, aboutValues, reviews,
      updateService, deleteService, addService,
      updateAktion, addAktion, removeAktion,
      updatePageField, updatePageParagraph, updatePageBenefit, addPageBenefit, removePageBenefit, updatePageBanner,
      addCategory, updateCategory, deleteCategory,
      updateSetting, updateSettingHours, updateLandingField,
      updateHeroSlide, addHeroSlide, removeHeroSlide, reorderHeroSlide,
      updateAboutValue, addAboutValue, removeAboutValue,
      updateReview, addReview, removeReview,
    }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAdminData() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAdminData must be used inside AdminDataProvider');
  return ctx;
}
