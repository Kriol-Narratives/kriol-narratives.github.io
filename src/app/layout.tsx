import type { Metadata } from "next";
import { headers } from "next/headers";
import { Fira_Sans, Permanent_Marker, Work_Sans } from "next/font/google";
import "./globals.css";
import { getMenu } from "@/lib/cms";
import { LocaleProvider, MenuProvider } from "@/lib/i18n/client";
import { LOCALE_HTML_LANG } from "@/lib/i18n/config";
import { getLocale, getText } from "@/lib/i18n/server";
import { THEME_INIT_SCRIPT } from "@/lib/theme-script";

const firaSans = Fira_Sans({
  variable: "--font-fira-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const permanentMarker = Permanent_Marker({
  variable: "--font-permanent-marker",
  subsets: ["latin"],
  weight: "400",
});

const workSans = Work_Sans({
  variable: "--font-work-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export async function generateMetadata(): Promise<Metadata> {
  const TEXT = await getText();
  const t = TEXT.Metadata;
  // Dominio del request (workers.dev hoy, el definitivo después): las redes necesitan og:image con URL absoluta.
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "https";
  return {
    metadataBase: host ? new URL(`${proto}://${host}`) : undefined,
    title: t.title,
    description: t.description,
  };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const [locale, menuItems] = await Promise.all([getLocale(), getMenu()]);
  return (
    <html
      lang={LOCALE_HTML_LANG[locale]}
      suppressHydrationWarning
      className={`${firaSans.variable} ${permanentMarker.variable} ${workSans.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col bg-white text-black">
        <LocaleProvider locale={locale}>
          <MenuProvider items={menuItems}>{children}</MenuProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
