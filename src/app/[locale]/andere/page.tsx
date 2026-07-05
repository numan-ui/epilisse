'use client';
import ServicePageTemplate from "@/components/ServicePageTemplate";
import { useAdminServices } from "@/hooks/useAdminServices";
import { useAdminPageContent } from "@/hooks/useAdminPageContent";
import { useAdminCampaigns } from "@/hooks/useAdminCampaigns";
import { useParams } from "next/navigation";

const FALLBACK_PRICING = [
  { name: "Aromatherapie-Massage", duration: "60 Min.", price: "€ 79,00"  },
  { name: "Hot Stone Massage",     duration: "75 Min.", price: "€ 95,00"  },
  { name: "Deep Tissue Massage",   duration: "90 Min.", price: "€ 110,00" },
  { name: "Wimpernverlängerung",   duration: "90 Min.", price: "€ 120,00" },
  { name: "Lash Lifting",          duration: "60 Min.", price: "€ 75,00"  },
  { name: "Brow Lamination",       duration: "45 Min.", price: "€ 55,00"  },
  { name: "Augenbrauen-Styling",   duration: "30 Min.", price: "€ 35,00"  },
];

export default function AnderePage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'de';
  const pageContent  = useAdminPageContent('andere');
  const adminCamps   = useAdminCampaigns('andere');
  const pricingItems = useAdminServices('andere', FALLBACK_PRICING);
  return (
    <ServicePageTemplate
      locale={locale}
      categoryId="andere"
      {...pageContent}
      {...(adminCamps.campaign1 ? { campaign1: adminCamps.campaign1 } : {})}
      {...(adminCamps.campaign2 ? { campaign2: adminCamps.campaign2 } : {})}
      pricingLabel="Preise & Services"
      pricingTitle="Ihr persönliches Wohlfühlprogramm"
      pricingItems={pricingItems}
    />
  );
}
