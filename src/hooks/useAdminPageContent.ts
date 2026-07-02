'use client';
import { useState, useEffect } from 'react';
import { INIT_PAGE_CONTENT, type PageContent, type PageBanner } from '@/app/[locale]/admin/behandlungen/data';

const LS_PC = 'epilisse_admin_page_content';

/** Empty string in an admin field means "not set" — fall back to the default rather than rendering blank. */
const str = (v: string | undefined, fallback: string) => (v && v.trim() !== '') ? v : fallback;

function mergeBanner(stored: PageBanner | undefined, fallback: PageBanner): PageBanner {
  if (!stored) return fallback;
  return {
    label: str(stored.label, fallback.label),
    title: str(stored.title, fallback.title),
    body:  str(stored.body, fallback.body),
    cta:   str(stored.cta, fallback.cta),
    icon:  str(stored.icon, fallback.icon),
    image: str(stored.image, fallback.image),
  };
}

function mergeContent(stored: PageContent, fallback: PageContent): PageContent {
  if (!fallback) return stored;
  const benefits = (stored.benefits ?? []).filter(b => b.trim() !== '');
  return {
    label:         str(stored.label, fallback.label),
    h1:            str(stored.h1, fallback.h1),
    heroDesc:      str(stored.heroDesc, fallback.heroDesc),
    heroImage:     str(stored.heroImage, fallback.heroImage),
    infoTitle:     str(stored.infoTitle, fallback.infoTitle),
    infoParagraphs: [
      str(stored.infoParagraphs?.[0], fallback.infoParagraphs[0]),
      str(stored.infoParagraphs?.[1], fallback.infoParagraphs[1]),
    ],
    benefitsTitle: str(stored.benefitsTitle, fallback.benefitsTitle),
    benefits: benefits.length > 0 ? benefits : fallback.benefits,
    campaign1: mergeBanner(stored.campaign1, fallback.campaign1),
    campaign2: mergeBanner(stored.campaign2, fallback.campaign2),
  };
}

export function useAdminPageContent(catId: string): PageContent {
  const fallback = INIT_PAGE_CONTENT[catId];
  const [content, setContent] = useState<PageContent>(fallback);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_PC);
      if (!raw) return;
      const all: Record<string, PageContent> = JSON.parse(raw);
      if (all[catId]) setContent(mergeContent(all[catId], fallback));
    } catch { /* ignore */ }
  }, [catId, fallback]);

  return content;
}
