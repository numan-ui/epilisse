'use client';
import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import {
  INIT_SERVICES, INIT_CAMPAIGNS, INIT_PAGE_CONTENT, CATEGORIES, INIT_SETTINGS,
  type Service, type Campaign, type Category, type PageContent, type PageContentMap,
  type PageBanner, type SiteSettings,
} from './data';

type ServicesMap  = Record<string, Service[]>;
type CampaignsMap = Record<string, Campaign[]>;

const LS_SVC = 'epilisse_admin_services';
const LS_CMP = 'epilisse_admin_campaigns';
const LS_PC  = 'epilisse_admin_page_content';
const LS_CAT = 'epilisse_admin_categories';
const LS_SET = 'epilisse_admin_settings';

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
  addCategory:    (cat: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, field: keyof Category, value: string | boolean) => void;
  deleteCategory: (id: string) => void;
  updateSetting:  <K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) => void;
  updateSettingHours: (index: number, field: 'open' | 'close' | 'closed', value: string | boolean) => void;
}

const Ctx = createContext<AdminDataCtx | null>(null);

export function AdminDataProvider({ children }: { children: ReactNode }) {
  const [services,    setServices]    = useState<ServicesMap>(defaultServices);
  const [campaigns,   setCampaigns]   = useState<CampaignsMap>(defaultCampaigns);
  const [pageContent, setPageContent] = useState<PageContentMap>(defaultPageContent);
  const [categories,  setCategories]  = useState<Category[]>(CATEGORIES.map(c => ({ ...c })));
  const [settings,    setSettings]    = useState<SiteSettings>({ ...INIT_SETTINGS, heroImages: [...INIT_SETTINGS.heroImages] as [string,string,string,string], hours: INIT_SETTINGS.hours.map(h => ({ ...h })) });

  useEffect(() => {
    const svcs = ls.read<ServicesMap>(LS_SVC);
    const cmps = ls.read<CampaignsMap>(LS_CMP);
    const pc   = ls.read<PageContentMap>(LS_PC);
    const cats = ls.read<Category[]>(LS_CAT);
    const set  = ls.read<SiteSettings>(LS_SET);
    if (svcs) setServices(svcs);
    if (cmps) setCampaigns(cmps);
    if (pc)   setPageContent(pc);
    if (cats && cats.length > 0) setCategories(cats);
    if (set)  setSettings(prev => ({ ...prev, ...set, heroImages: (set.heroImages ?? prev.heroImages) as [string,string,string,string], hours: set.hours ?? prev.hours }));
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
  const addCategory = useCallback((cat: Omit<Category, 'id'>) =>
    setCategories(prev => {
      const next = [...prev, { ...cat, id: `cat-${Date.now()}` }];
      ls.write(LS_CAT, next); return next;
    }), []);

  const updateCategory = useCallback((id: string, field: keyof Category, value: string | boolean) =>
    setCategories(prev => {
      const next = prev.map(c => c.id === id ? { ...c, [field]: value } : c);
      ls.write(LS_CAT, next); return next;
    }), []);

  const deleteCategory = useCallback((id: string) =>
    setCategories(prev => {
      const next = prev.filter(c => c.id !== id);
      ls.write(LS_CAT, next); return next;
    }), []);

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

  return (
    <Ctx.Provider value={{
      services, campaigns, pageContent, categories, settings,
      updateService, deleteService, addService,
      updateCampaign, deleteCampaign, addCampaign,
      updatePageField, updatePageParagraph, updatePageBenefit, addPageBenefit, removePageBenefit, updatePageBanner,
      addCategory, updateCategory, deleteCategory,
      updateSetting, updateSettingHours,
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
