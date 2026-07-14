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
    path: "/preise",
    title: "Preise & Leistungen München | EPILISSE Kosmetikstudio",
    description:
      "Transparente Preise für Laser-Haarentfernung, Gesichtsästhetik, Body Contouring, Injectables und Maniküre in München. Alle Leistungen im Überblick.",
    keywords: [
      "Kosmetikstudio Preise München",
      "Laser-Haarentfernung Preise München",
      "Beauty Studio Preisliste München",
    ],
  });
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
