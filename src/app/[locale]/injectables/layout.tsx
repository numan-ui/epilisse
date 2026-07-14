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
    path: "/injectables",
    title: "Botox & Hyaluron München | Injectables | EPILISSE",
    description:
      "Botulinum Toxin, Hyaluronsäure und Profhilo in München — natürliche Verjüngung mit präziser Dosierung. Kostenlose Erstberatung möglich.",
    keywords: [
      "Botox München",
      "Hyaluron München",
      "Faltenunterspritzung München",
      "Lippenunterspritzung München",
      "Profhilo München",
    ],
  });
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
