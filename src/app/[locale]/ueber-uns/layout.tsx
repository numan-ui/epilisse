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
    path: "/ueber-uns",
    title: "Über Uns | EPILISSE Beauty Studio München",
    description:
      "Lernen Sie EPILISSE kennen — Ihr Experte für exklusive Schönheitsbehandlungen im Herzen von München. Qualität, Diskretion und Perfektion.",
    keywords: [
      "Kosmetikstudio München über uns",
      "Beauty Studio München Team",
      "EPILISSE München",
    ],
  });
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
