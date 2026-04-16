import type { Metadata } from "next";
import { Bricolage_Grotesque, DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "700", "800"],
});

const dmSans = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "700", "800"],
});

export const metadata: Metadata = {
  title: "FlockFare — deals, drops, departures.",
  description:
    "Cheap flight and hotel alerts for the flock. Hand-picked mistake fares, flash sales, and price drops.",
  metadataBase: new URL("https://flockfare.com"),
  openGraph: {
    siteName: "FlockFare",
    title: "FlockFare — deals, drops, departures.",
    description:
      "Cheap flight and hotel alerts for the flock. Hand-picked mistake fares, flash sales, and price drops.",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "FlockFare — deals, drops, departures.",
    description: "Cheap flight and hotel alerts for the flock.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  other: {
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "apple-mobile-web-app-title": "FlockFare",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${bricolage.variable} ${dmSans.variable} ${jetbrains.variable} h-full antialiased`}
    >
      <head>
        <meta
          name="theme-color"
          content="#D8FF3C"
          media="(prefers-color-scheme: light)"
        />
        <meta
          name="theme-color"
          content="#0B0B0F"
          media="(prefers-color-scheme: dark)"
        />
      </head>
      <body className="min-h-full flex flex-col bg-cream text-ink">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:bg-violet focus:text-cream focus:px-4 focus:py-2 focus:rounded-full focus:font-display focus:font-bold focus:text-sm"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
