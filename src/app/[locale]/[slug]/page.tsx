'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import ServicePageTemplate from '@/components/ServicePageTemplate';
import { useAdminServices } from '@/hooks/useAdminServices';
import { useAdminPageContent } from '@/hooks/useAdminPageContent';
import { useAdminCampaigns, resolveCampaigns } from '@/hooks/useAdminCampaigns';
import { useAdminCategories } from '@/hooks/useAdminCategories';
import { INIT_PAGE_CONTENT } from '@/app/[locale]/admin/behandlungen/data';
import { Link } from '@/i18n/navigation';

const EMPTY_CAMPAIGN = { label: '', title: '', body: '', cta: '', icon: 'auto_awesome', image: '' };

export default function DynamicCategoryPage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'de';
  const slug   = params?.slug as string;
  const [hydrated, setHydrated] = useState(false);

  const categories   = useAdminCategories();
  const pageContent  = useAdminPageContent(slug);
  const adminCamps   = useAdminCampaigns(slug);
  const pricingItems = useAdminServices(slug, []);

  useEffect(() => { setHydrated(true); }, []);

  const category = categories.find(c => c.id === slug);

  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <span className="material-symbols-outlined text-4xl text-outline animate-pulse">autorenew</span>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-surface">
        <span className="material-symbols-outlined text-6xl text-outline">search_off</span>
        <h1 className="font-headline-lg text-headline-lg text-on-surface">Seite nicht gefunden</h1>
        <p className="font-body-md text-secondary">Diese Kategorie existiert nicht.</p>
        <Link href="/" className="font-label-caps text-primary underline">Zurück zur Startseite</Link>
      </div>
    );
  }

  const defaultContent = INIT_PAGE_CONTENT[slug] ?? {
    label: category.desc || 'Beauty Service',
    h1: category.name,
    heroDesc: category.desc || '',
    heroImage: '',
    infoTitle: category.name,
    infoParagraphs: ['', ''] as [string, string],
    benefitsTitle: 'Ihre Vorteile',
    benefits: [],
    campaign1: EMPTY_CAMPAIGN,
    campaign2: EMPTY_CAMPAIGN,
  };

  const pc = pageContent ?? defaultContent;

  return (
    <ServicePageTemplate
      locale={locale}
      categoryId={slug}
      categoryImage={category.image}
      {...pc}
      campaigns={resolveCampaigns(pc, adminCamps)}
      pricingLabel="Preise & Services"
      pricingTitle={`${category.name} Behandlungen`}
      pricingItems={pricingItems}
    />
  );
}
