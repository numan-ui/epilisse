'use client';
import ServicePageTemplate from "@/components/ServicePageTemplate";
import { useAdminServices } from "@/hooks/useAdminServices";
import { useAdminPageContent } from "@/hooks/useAdminPageContent";
import { useAdminCampaigns } from "@/hooks/useAdminCampaigns";
import { useParams } from "next/navigation";

const FALLBACK_PRICING = [
  { name: "Basis-Gesichtsbehandlung", duration: "60 Min.", price: "€ 89,00" },
  { name: "HydraFacial Classic", duration: "60 Min.", price: "€ 149,00" },
  { name: "HydraFacial Deluxe", duration: "90 Min.", price: "€ 199,00" },
  { name: "Chemical Peeling (leicht bis mittel)", duration: "45 Min.", price: "€ 119,00" },
  { name: "Microneedling (Gesicht)", duration: "60 Min.", price: "€ 189,00" },
  { name: "Premium Glow Signature", duration: "90 Min.", price: "€ 299,00" },
];

export default function GesichtsaesthetikPage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'de';
  const pageContent  = useAdminPageContent('gesicht');
  const adminCamps   = useAdminCampaigns('gesicht');
  const pricingItems = useAdminServices('gesicht', FALLBACK_PRICING);
  return (
    <ServicePageTemplate
      locale={locale}
      {...pageContent}
      {...(adminCamps.campaign1 ? { campaign1: adminCamps.campaign1 } : {})}
      {...(adminCamps.campaign2 ? { campaign2: adminCamps.campaign2 } : {})}
      pricingLabel="Preise & Services"
      pricingTitle="Investition in Ihre Ausstrahlung"
      pricingItems={pricingItems}
    />
  );
}
