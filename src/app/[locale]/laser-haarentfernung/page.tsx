'use client';
import ServicePageTemplate from "@/components/ServicePageTemplate";
import { useAdminServices } from "@/hooks/useAdminServices";
import { useAdminPageContent } from "@/hooks/useAdminPageContent";
import { useAdminCampaigns } from "@/hooks/useAdminCampaigns";
import { useParams } from "next/navigation";

const FALLBACK_PRICING = [
  { name: "Oberlippe oder Kinn", duration: "15 Min.", price: "€ 39,00" },
  { name: "Achselhöhlen", duration: "20 Min.", price: "€ 55,00" },
  { name: "Unterarme", duration: "30 Min.", price: "€ 89,00" },
  { name: "Beine komplett", duration: "60 Min.", price: "€ 189,00" },
  { name: "Rücken (komplett)", duration: "45 Min.", price: "€ 149,00" },
  { name: "Ganzkörper Luxury Pack", duration: "120 Min.", price: "€ 349,00" },
];

export default function LaserPage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'de';
  const pageContent  = useAdminPageContent('laser');
  const adminCamps   = useAdminCampaigns('laser');
  const pricingItems = useAdminServices('laser', FALLBACK_PRICING);
  return (
    <ServicePageTemplate
      locale={locale}
      categoryId="laser"
      {...pageContent}
      {...(adminCamps.campaign1 ? { campaign1: adminCamps.campaign1 } : {})}
      {...(adminCamps.campaign2 ? { campaign2: adminCamps.campaign2 } : {})}
      pricingLabel="Preise & Services"
      pricingTitle="Investition in Ihre Schönheit"
      pricingItems={pricingItems}
    />
  );
}
