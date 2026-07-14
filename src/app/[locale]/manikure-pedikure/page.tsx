'use client';
import ServicePageTemplate from "@/components/ServicePageTemplate";
import { useAdminServices } from "@/hooks/useAdminServices";
import { useAdminPageContent } from "@/hooks/useAdminPageContent";
import { useAdminCampaigns, resolveCampaigns } from "@/hooks/useAdminCampaigns";
import { useAdminCategories } from "@/hooks/useAdminCategories";
import { useParams } from "next/navigation";

const FALLBACK_PRICING = [
  { name: "Klassische Maniküre", duration: "45 Min.", price: "€ 45,00" },
  { name: "EPILISSE Signature Shellac", duration: "75 Min.", price: "€ 65,00" },
  { name: "Luxus Spa Maniküre", duration: "90 Min.", price: "€ 85,00" },
  { name: "French Design / Nail Art", duration: "je nach Design", price: "ab € 15,00" },
  { name: "Medizinische Fußpflege", duration: "50 Min.", price: "€ 55,00" },
  { name: "Pediküre mit Shellac", duration: "75 Min.", price: "€ 75,00" },
  { name: "Royal Pediküre Spa", duration: "90 Min.", price: "€ 95,00" },
  { name: "Lackieren (klassisch)", duration: "", price: "€ 20,00" },
];

export default function ManiPediPage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'de';
  const pageContent  = useAdminPageContent('mani');
  const adminCamps   = useAdminCampaigns('mani');
  const categories   = useAdminCategories();
  const pricingItems = useAdminServices('mani', FALLBACK_PRICING);
  return (
    <ServicePageTemplate
      locale={locale}
      categoryId="mani"
      categoryImage={categories.find(c => c.id === 'mani')?.image}
      {...pageContent}
      campaigns={resolveCampaigns(pageContent, adminCamps)}
      pricingLabel="Preise & Services"
      pricingTitle="Investition in Ihre Perfektion"
      pricingItems={pricingItems}
    />
  );
}
