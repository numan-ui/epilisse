import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildMetadata({
    locale,
    path: "/gesichtsaesthetik",
    title: "Gesichtsästhetik & HydraFacial München | EPILISSE",
    description:
      "HydraFacial, Microneedling & Chemical Peeling in München. Professionelle Gesichtsbehandlungen für strahlende, jugendliche Haut. Termin online buchen.",
    keywords: [
      "Gesichtsästhetik München",
      "HydraFacial München",
      "Microneedling München",
      "Gesichtsbehandlung München",
      "Anti-Aging München",
    ],
  });
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
