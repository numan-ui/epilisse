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
    path: "/behandlungen",
    title: "Behandlungen im Überblick München | EPILISSE",
    description:
      "Alle Behandlungen bei EPILISSE München: Laser-Haarentfernung, Gesichtsästhetik, Body Contouring, Injectables und Maniküre & Pediküre.",
    keywords: [
      "Behandlungen München",
      "Kosmetikstudio Leistungen München",
      "Beauty Studio München",
    ],
  });
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
