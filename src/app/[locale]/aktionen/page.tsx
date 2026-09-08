'use client';
import ServicePageTemplate from "@/components/ServicePageTemplate";
import { useAdminPageContent } from "@/hooks/useAdminPageContent";
import { useAdminCategories } from "@/hooks/useAdminCategories";
import { useAktionen, visibleAktionen, aktionToCampaign } from "@/hooks/useAktionen";
import { useParams } from "next/navigation";

/**
 * /aktionen is a standard service page (same ServicePageTemplate + service-page
 * CMS as /laser-haarentfernung etc.), for the "aktionen" built-in category. Its
 * price list and campaign banners are generated from the active Aktionen
 * themselves; the hero / info / benefits copy is admin-editable like any other
 * category. Booking runs through the normal modal on the "aktionen" category.
 */
export default function AktionenPage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'de';

  const pageContent = useAdminPageContent('aktionen');
  const categories = useAdminCategories();
  const list = visibleAktionen(useAktionen());

  const pricingItems =
    list.length > 0
      ? list.map((a) => ({
          name: a.title,
          duration: '',
          price: a.price || 'Auf Anfrage',
          ...(a.oldPrice ? { oldPrice: a.oldPrice } : {}),
        }))
      : [{ name: 'Zurzeit keine aktiven Aktionen', duration: '', price: '' }];

  return (
    <ServicePageTemplate
      locale={locale}
      categoryId="aktionen"
      categoryImage={categories.find((c) => c.id === 'aktionen')?.image}
      {...pageContent}
      campaigns={list.map(aktionToCampaign)}
      pricingLabel="Aktuelle Aktionen"
      pricingTitle="Alle laufenden Angebote"
      pricingItems={pricingItems}
    />
  );
}
