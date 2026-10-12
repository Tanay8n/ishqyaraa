import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import localFont from "next/font/local";
import { AppProviders } from "@/components/AppProviders";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans-fallback",
  weight: ["300", "400", "500", "600", "700", "800"],
});

const nandia = localFont({
  src: "./fonts/Nandia.ttf",
  variable: "--font-nandia",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://ishqyara.social"
  ),
  title: {
    default: "IshqYara — Beyond the Swipe, Where Dil Finds Its Vibe",
    template: "%s | IshqYara",
  },
  applicationName: "IshqYara",
  appleWebApp: {
    title: "IshqYara",
    capable: true,
    statusBarStyle: "default",
  },
  description:
    "IshqYara is Kolkata's modern dating and social discovery app. Connect with genuine singles, find romantic dates, make lasting friends, and discover real compatibility beyond the swipe.",
  keywords: [
    "Dating App",
    "IshqYara",
    "Kolkata Dating",
    "Find Love",
    "Match and Chat",
    "College Dating",
    "Singles in Kolkata",
    "Dating in Bengal",
    "Relationships",
    "Durga Puja Theme",
  ],
  authors: [{ name: "IshqYara Team" }],
  creator: "IshqYara",
  publisher: "IshqYara",
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined,
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-icon.png",
  },
  openGraph: {
    title: "IshqYara — Beyond the Swipe, Where Dil Finds Its Vibe",
    description:
      "Kolkata's modern dating and connection app. Match with genuine people, discover true compatibility, and spark real chemistry.",
    url: "https://ishqyara.social",
    siteName: "IshqYara",
    type: "website",
    images: [
      {
        url: "/logo.png",
        width: 1024,
        height: 1024,
        alt: "IshqYara — Modern Dating & Social Discovery",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "IshqYara — Beyond the Swipe, Where Dil Finds Its Vibe",
    description:
      "Kolkata's modern dating and connection app. Match with genuine people, discover true compatibility, and spark real chemistry.",
    images: ["/logo.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${nandia.variable} ${jakarta.variable} scroll-smooth`}>
      <body className="min-h-screen bg-[#faf7f2] text-stone-900 font-sans antialiased selection:bg-[#9e1b22] selection:text-white">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
