'use client';
import ServicePageTemplate from "@/components/ServicePageTemplate";
import { useAdminServices } from "@/hooks/useAdminServices";
import { useAdminPageContent } from "@/hooks/useAdminPageContent";
import { useAdminCampaigns } from "@/hooks/useAdminCampaigns";
import { useParams } from "next/navigation";

const FALLBACK_PRICING = [
  { name: "Kryolipolyse (1 Zone)", duration: "60 Min.", price: "€ 199,00" },
  { name: "Kryolipolyse (2 Zonen)", duration: "90 Min.", price: "€ 349,00" },
  { name: "RF-Lifting (Gesicht & Hals)", duration: "45 Min.", price: "€ 149,00" },
  { name: "Ultraschall-Kavitation", duration: "45 Min.", price: "€ 129,00" },
  { name: "Vakuumtherapie Beine", duration: "60 Min.", price: "€ 119,00" },
  { name: "Body Sculpting Premium Paket", duration: "150 Min.", price: "€ 599,00" },
];

export default function BodyContouringPage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'de';
  const pageContent  = useAdminPageContent('body');
  const adminCamps   = useAdminCampaigns('body');
  const pricingItems = useAdminServices('body', FALLBACK_PRICING);
  return (
    <ServicePageTemplate
      locale={locale}
      categoryId="body"
      {...pageContent}
      {...(adminCamps.campaign1 ? { campaign1: adminCamps.campaign1 } : {})}
      {...(adminCamps.campaign2 ? { campaign2: adminCamps.campaign2 } : {})}
      pricingLabel="Preise & Services"
      pricingTitle="Investition in Ihre Silhouette"
      pricingItems={pricingItems}
    />
  );
}
