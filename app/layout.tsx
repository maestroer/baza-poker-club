import type { Metadata, Viewport } from "next";
import { Montserrat, Russo_One } from "next/font/google";
import { SITE } from "@/lib/site";
import "./globals.css";

// Шрифты под логотип клуба: Russo One — тяжёлый спортивный гротеск для заголовков,
// Montserrat — основной текст и разряженные подписи («КЛУБ СПОРТИВНОГО ПОКЕРА»).
const display = Russo_One({ variable: "--font-display", subsets: ["latin", "cyrillic"], weight: "400" });
const body = Montserrat({ variable: "--font-body", subsets: ["latin", "cyrillic"] });
const mono = Montserrat({ variable: "--font-mono", subsets: ["latin", "cyrillic"], weight: ["600", "700"] });

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
