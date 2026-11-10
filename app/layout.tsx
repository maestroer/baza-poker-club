import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Manrope, Playfair_Display } from "next/font/google";
import { SITE } from "@/lib/site";
import "./globals.css";

const display = Playfair_Display({ variable: "--font-display", subsets: ["latin", "cyrillic"], weight: ["500", "700", "900"] });
const body = Manrope({ variable: "--font-body", subsets: ["latin", "cyrillic"] });
const mono = JetBrains_Mono({ variable: "--font-mono", subsets: ["latin", "cyrillic"], weight: ["400", "500"] });

export const metadata: Metadata = {
  title: `${SITE.name} — ${SITE.tagline.toLowerCase()}`,
  description: "Турнирный покер как спорт: без денежных ставок, с рейтингом сезона, баром и кухней. Запишитесь на ближайшую игру.",
};

export const viewport: Viewport = { themeColor: "#040605" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ru" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
