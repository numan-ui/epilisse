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
    path: "/body-contouring",
    title: "Body Contouring München | Kryolipolyse & RF-Lifting | EPILISSE",
    description:
      "Nicht-invasive Körperformung in München: Kryolipolyse, RF-Lifting und Ultraschall-Kavitation für definierte Konturen. Jetzt Beratungstermin sichern.",
    keywords: [
      "Body Contouring München",
      "Kryolipolyse München",
      "Fettabsaugen Alternative München",
      "RF-Lifting München",
      "Körperformung München",
    ],
  });
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
