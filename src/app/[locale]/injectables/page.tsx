'use client';
import ServicePageTemplate from "@/components/ServicePageTemplate";
import { useAdminServices } from "@/hooks/useAdminServices";
import { useAdminPageContent } from "@/hooks/useAdminPageContent";
import { useAdminCampaigns, resolveCampaigns } from "@/hooks/useAdminCampaigns";
import { useAdminCategories } from "@/hooks/useAdminCategories";
import { useParams } from "next/navigation";

const FALLBACK_PRICING = [
  { name: "Botulinum Toxin (1 Zone)", duration: "30 Min.", price: "€ 199,00" },
  { name: "Botulinum Toxin (3 Zonen)", duration: "30 Min.", price: "€ 349,00" },
  { name: "Hyaluronsäure Lippen", duration: "45 Min.", price: "€ 299,00" },
  { name: "Hyaluronsäure Wangen & Kinn", duration: "45 Min.", price: "€ 399,00" },
  { name: "Profhilo (2 Sitzungen)", duration: "je 30 Min.", price: "€ 699,00" },
  { name: "Anti-Aging Full-Face Konzept", duration: "60 Min.", price: "€ 899,00" },
];

export default function InjectablesPage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'de';
  const pageContent  = useAdminPageContent('inject');
  const adminCamps   = useAdminCampaigns('inject');
  const categories   = useAdminCategories();
  const pricingItems = useAdminServices('inject', FALLBACK_PRICING);
  return (
    <ServicePageTemplate
      locale={locale}
      categoryId="inject"
      categoryImage={categories.find(c => c.id === 'inject')?.image}
      {...pageContent}
      campaigns={resolveCampaigns(pageContent, adminCamps)}
      pricingLabel="Preise & Services"
      pricingTitle="Investition in Ihr Erscheinungsbild"
      pricingItems={pricingItems}
    />
  );
}
