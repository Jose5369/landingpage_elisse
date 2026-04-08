import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ELISE SYSTEM - Sistema POS Inteligente",
  description:
    "ELISE SYSTEM es el sistema POS e inteligente de gestión empresarial que impulsa tu negocio. Control de inventario, ventas, facturación y más.",
  keywords: [
    "sistema POS",
    "punto de venta",
    "gestión empresarial",
    "inventario",
    "facturación",
    "ELISE SYSTEM",
    "software POS",
    "control de ventas",
  ],
  authors: [{ name: "ELISE SYSTEM" }],
  creator: "ELISE SYSTEM",
  publisher: "ELISE SYSTEM",
  metadataBase: new URL("https://elisesystem.com"),
  openGraph: {
    type: "website",
    locale: "es_DO",
    url: "https://elisesystem.com",
    siteName: "ELISE SYSTEM",
    title: "ELISE SYSTEM - Sistema POS Inteligente",
    description:
      "El sistema POS inteligente que transforma la gestión de tu negocio. Control total de ventas, inventario y más.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ELISE SYSTEM - Sistema POS Inteligente",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ELISE SYSTEM - Sistema POS Inteligente",
    description:
      "El sistema POS inteligente que transforma la gestión de tu negocio.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#007fff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} scroll-smooth`}>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
      </head>
      <body className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
