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
    path: "/laser-haarentfernung",
    title: "Laser-Haarentfernung München | EPILISSE Kosmetikstudio",
    description:
      "Dauerhafte Laser-Haarentfernung in München mit moderner Diodenlaser-Technologie. Schmerzarm, hocheffektiv, für alle Hauttypen. Jetzt Termin buchen.",
    keywords: [
      "Laser-Haarentfernung München",
      "dauerhafte Haarentfernung München",
      "Diodenlaser München",
      "Haarentfernung Frauen München",
      "IPL Laser München",
    ],
  });
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
