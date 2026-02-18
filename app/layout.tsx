import "./globals.css";
import "react-toastify/dist/ReactToastify.css";

import type { Metadata } from "next";
import { Barlow_Condensed, Lato } from "next/font/google";
import localFont from "next/font/local";
// import Script from "next/script";
import { ToastContainer } from "react-toastify";

import { EvmProvider } from "@/providers/EvmProvider";
import { ThemeProvider } from "@/providers/theme-provider";

const lato = Lato({
  subsets: ["latin"],
  weight: ["300", "400", "700", "900"],
  variable: "--font-lato",
});

const barlow = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-barlow-condensed",
});

const formula = localFont({
  src: [
    {
      path: "../public/fonts/FormulaCondensed-Light.woff2",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-formula-condensed",
});

export const metadata: Metadata = {
  title: "HELLO Labs Trade | Next-Gen DEX for Seamless Crypto Trading",
  description:
    "Trade crypto with speed, security, and zero limits on HELLO Labs Trade. Our decentralized exchange (DEX) offers low fees, cross-chain swaps, and access to the HELLO ecosystem—all in one powerful platform.",
  manifest: "/favicon/site.webmanifest",
  icons: {
    icon: [{ url: "/favicon/favicon.ico" }],
    shortcut: ["/favicon/apple-touch-icon.png"],
    apple: [{ url: "/favicon/apple-touch-icon.png", sizes: "180x180" }],
    other: [
      {
        rel: "icon",
        sizes: "32x32",
        url: "/favicon/favicon-32x32.png",
      },
      {
        rel: "icon",
        sizes: "16x16",
        url: "/favicon/favicon-16x16.png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "HELLO Labs Trade | Next-Gen DEX for Seamless Crypto Trading",
    description:
      "Trade crypto with speed, security, and zero limits on HELLO Labs Trade. Our decentralized exchange (DEX) offers low fees, cross-chain swaps, and access to the HELLO ecosystem—all in one powerful platform.",
    siteId: "1467726470533754880",
    creator: "@thehellolabs",
    creatorId: "1467726470533754880",
    images: ["/images/og-image.png"],
  },
  openGraph: {
    title: "HELLO Labs Trade | Next-Gen DEX for Seamless Crypto Trading",
    description:
      "Trade crypto with speed, security, and zero limits on HELLO Labs Trade. Our decentralized exchange (DEX) offers low fees, cross-chain swaps, and access to the HELLO ecosystem—all in one powerful platform.",
    images: [
      {
        url: "/images/og-image.png",
        width: 800,
        height: 600,
      },
      {
        url: "/images/og-image.png",
        width: 1800,
        height: 1600,
      },
    ],
    locale: "en-US",
    type: "website",
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
      className={`${lato.variable} ${barlow.variable} ${formula.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Cookie3 temporarily disabled per request */}
        {/* <Script
          src="https://cdn.markfi.xyz/scripts/analytics/0.11.24/cookie3.analytics.min.js"
          integrity="sha384-ihnQ09PGDbDPthGB3QoQ2Heg2RwQIDyWkHkqxMzq91RPeP8OmydAZbQLgAakAOfI"
          crossOrigin="anonymous"
          async
          strategy="lazyOnload"
          site-id="df90cab4-7031-4366-abcb-8a8aa2fbc6f4"
        /> */}
      </head>
      <body suppressHydrationWarning={true}>
        {/* ThemeProvider MUST be outside EvmProvider */}
        <div translate="no">
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <EvmProvider>
              {children}

              <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                closeOnClick={true}
                pauseOnHover={true}
                draggable={true}
                theme="dark"
              />
            </EvmProvider>
          </ThemeProvider>
        </div>
      </body>
    </html>
  );
}
