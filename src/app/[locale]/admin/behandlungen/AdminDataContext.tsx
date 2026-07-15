'use client';
import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import {
  INIT_SERVICES, INIT_CAMPAIGNS, INIT_PAGE_CONTENT, CATEGORIES, INIT_SETTINGS, INIT_LANDING_CONTENT,
  INIT_HERO_SLIDES, HERO_SLIDE_LIMIT, INIT_PROMO_BANNERS, PROMO_BANNER_LIMIT, INIT_ABOUT_VALUES, ABOUT_VALUE_LIMIT,
  INIT_REVIEWS, REVIEW_LIMIT,
  type Service, type Campaign, type Category, type PageContent, type PageContentMap,
  type PageBanner, type SiteSettings, type LandingContent, type HeroSlide, type PromoBanner, type AboutValue, type Review,
} from './data';

type ServicesMap  = Record<string, Service[]>;
type CampaignsMap = Record<string, Campaign[]>;

const LS_SVC = 'epilisse_admin_services';
const LS_CMP = 'epilisse_admin_campaigns';
const LS_PC  = 'epilisse_admin_page_content';
const LS_CAT = 'epilisse_admin_categories';
const LS_SET = 'epilisse_admin_settings';
const LS_LC  = 'epilisse_admin_landing_content';
const LS_HERO  = 'epilisse_admin_hero_slides';
const LS_PROMO = 'epilisse_admin_promo_banners';
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
const defaultCampaigns   = (): CampaignsMap    =>
  Object.fromEntries(Object.entries(INIT_CAMPAIGNS).map(([k, v]) => [k, v.map(c => ({ ...c }))]));
const defaultPageContent = (): PageContentMap  =>
  Object.fromEntries(Object.entries(INIT_PAGE_CONTENT).map(([k, v]) => [k, { ...v, infoParagraphs: [...v.infoParagraphs] as [string, string], benefits: [...v.benefits], campaign1: { ...v.campaign1 }, campaign2: { ...v.campaign2 } }]));

interface AdminDataCtx {
  services:  ServicesMap;
  campaigns: CampaignsMap;
  pageContent: PageContentMap;
  categories: Category[];
  settings: SiteSettings;
  landingContent: LandingContent;
  heroSlides: HeroSlide[];
  promoBanners: PromoBanner[];
  aboutValues: AboutValue[];
  reviews: Review[];
  updateService:        (catId: string, id: string, field: keyof Service,  value: string | boolean) => void;
  deleteService:        (catId: string, id: string) => void;
  addService:           (catId: string, svc: Omit<Service, 'id'>) => void;
  updateCampaign:       (catId: string, id: string, field: keyof Campaign, value: string | boolean) => void;
  deleteCampaign:       (catId: string, id: string) => void;
  addCampaign:          (catId: string, cmp: Omit<Campaign, 'id'>) => void;
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
  updatePromoBanner: (id: string, field: keyof PromoBanner, value: string) => void;
  addPromoBanner: () => void;
  removePromoBanner: (id: string) => void;
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
  const [campaigns,   setCampaigns]   = useState<CampaignsMap>(defaultCampaigns);
  const [pageContent, setPageContent] = useState<PageContentMap>(defaultPageContent);
  const [categories,  setCategories]  = useState<Category[]>(CATEGORIES.map(c => ({ ...c })));
  const [settings,    setSettings]    = useState<SiteSettings>({ ...INIT_SETTINGS, hours: INIT_SETTINGS.hours.map(h => ({ ...h })) });
  const [landingContent, setLandingContent] = useState<LandingContent>({ ...INIT_LANDING_CONTENT });
  const [heroSlides, setHeroSlides]   = useState<HeroSlide[]>(INIT_HERO_SLIDES.map(s => ({ ...s })));
  const [promoBanners, setPromoBanners] = useState<PromoBanner[]>(INIT_PROMO_BANNERS.map(p => ({ ...p })));
  const [aboutValues, setAboutValues] = useState<AboutValue[]>(INIT_ABOUT_VALUES.map(v => ({ ...v })));
  const [reviews, setReviews] = useState<Review[]>(INIT_REVIEWS.map(r => ({ ...r })));

  useEffect(() => {
    const svcs = ls.read<ServicesMap>(LS_SVC);
    const cmps = ls.read<CampaignsMap>(LS_CMP);
    const pc   = ls.read<PageContentMap>(LS_PC);
    const cats = ls.read<Category[]>(LS_CAT);
    const set  = ls.read<SiteSettings>(LS_SET);
    const lc   = ls.read<LandingContent>(LS_LC);
    const hero = ls.read<HeroSlide[]>(LS_HERO);
    const promo = ls.read<PromoBanner[]>(LS_PROMO);
    const about = ls.read<AboutValue[]>(LS_ABOUT);
    const revs  = ls.read<Review[]>(LS_REVIEWS);
    if (svcs) setServices(svcs);
    if (cmps) setCampaigns(cmps);
    if (pc)   setPageContent(pc);
    if (cats && cats.length > 0) {
      // Drop stale localStorage entries for built-in categories removed from code (e.g. a deleted default category).
      const validCats = cats.filter(c => CATEGORIES.some(d => d.id === c.id) || c.id.startsWith('cat-'));
      if (validCats.length > 0) {
        setCategories(validCats);
        if (validCats.length !== cats.length) ls.write(LS_CAT, validCats);
      }
    }
    if (set)  setSettings(prev => ({ ...prev, ...set, hours: set.hours ?? prev.hours }));
    if (lc)   setLandingContent(prev => ({ ...prev, ...lc }));
    if (hero && hero.length > 0) setHeroSlides(hero);
    if (promo && promo.length > 0) setPromoBanners(promo);
    if (about && about.length > 0) setAboutValues(about);
    if (revs  && revs.length > 0)  setReviews(revs);
  }, []);

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

  /* ── Campaigns ───────────────────────────────────── */
  const updateCampaign = useCallback((catId: string, id: string, field: keyof Campaign, value: string | boolean) =>
    setCampaigns(prev => {
      const next = { ...prev, [catId]: prev[catId].map(c => c.id === id ? { ...c, [field]: value } : c) };
      ls.write(LS_CMP, next); return next;
    }), []);

  const deleteCampaign = useCallback((catId: string, id: string) =>
    setCampaigns(prev => {
      const next = { ...prev, [catId]: prev[catId].filter(c => c.id !== id) };
      ls.write(LS_CMP, next); return next;
    }), []);

  const addCampaign = useCallback((catId: string, cmp: Omit<Campaign, 'id'>) =>
    setCampaigns(prev => {
      const next = { ...prev, [catId]: [...(prev[catId] ?? []), { ...cmp, id: `c-${Date.now()}` }] };
      ls.write(LS_CMP, next); return next;
    }), []);

  /* ── Page content ────────────────────────────────── */
  const _pcUpdate = useCallback((catId: string, updater: (pc: PageContent) => PageContent) =>
    setPageContent(prev => {
      const current = prev[catId] ?? INIT_PAGE_CONTENT[catId];
      const next = { ...prev, [catId]: updater(current) };
      ls.write(LS_PC, next); return next;
    }), []);

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
    const templateCmps = templateCatId ? (campaigns[templateCatId] ?? []) : [];

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

    // Seed the template's campaign cards too, so the Kampagnen list isn't left empty.
    if (templateCmps.length > 0) {
      setCampaigns(prev => {
        const cloned = templateCmps.map((c, i) => ({ ...c, id: `c-${Date.now()}-${i}` }));
        const next = { ...prev, [id]: cloned };
        ls.write(LS_CMP, next); return next;
      });
    }
  }, [categories, pageContent, services, campaigns]);

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
    setCampaigns(prev => {
      if (!(id in prev)) return prev;
      const { [id]: _drop, ...next } = prev;
      ls.write(LS_CMP, next); return next;
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

  /* ── Promo banners (Kombi-Angebot) ────────────────── */
  const updatePromoBanner = useCallback((id: string, field: keyof PromoBanner, value: string) =>
    setPromoBanners(prev => {
      const next = prev.map(p => p.id === id ? { ...p, [field]: value } : p);
      ls.write(LS_PROMO, next); return next;
    }), []);

  const addPromoBanner = useCallback(() =>
    setPromoBanners(prev => {
      if (prev.length >= PROMO_BANNER_LIMIT) return prev;
      const next = [...prev, { id: `promo-${Date.now()}`, label: '', title: '', desc: '', ctaPrimary: 'JETZT BUCHEN', ctaSecondary: '', image: '' }];
      ls.write(LS_PROMO, next); return next;
    }), []);

  const removePromoBanner = useCallback((id: string) =>
    setPromoBanners(prev => {
      if (prev.length <= 1) return prev;
      const next = prev.filter(p => p.id !== id);
      ls.write(LS_PROMO, next); return next;
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
      services, campaigns, pageContent, categories, settings, landingContent, heroSlides, promoBanners, aboutValues, reviews,
      updateService, deleteService, addService,
      updateCampaign, deleteCampaign, addCampaign,
      updatePageField, updatePageParagraph, updatePageBenefit, addPageBenefit, removePageBenefit, updatePageBanner,
      addCategory, updateCategory, deleteCategory,
      updateSetting, updateSettingHours, updateLandingField,
      updateHeroSlide, addHeroSlide, removeHeroSlide, reorderHeroSlide,
      updatePromoBanner, addPromoBanner, removePromoBanner,
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
