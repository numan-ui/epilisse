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
    path: "/manikure-pedikure",
    title: "Maniküre & Pediküre München | Nagelstudio | EPILISSE",
    description:
      "Luxuriöse Maniküre und Pediküre in München mit Premium-Produkten wie OPI und CND Shellac. Höchste Hygienestandards. Termin online buchen.",
    keywords: [
      "Maniküre München",
      "Pediküre München",
      "Nagelstudio München",
      "Shellac München",
      "Nageldesign München",
    ],
  });
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
