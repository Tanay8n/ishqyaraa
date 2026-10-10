import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { AppProviders } from "@/components/AppProviders";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://ishqyaraa-tanay8ns-projects.vercel.app"
  ),
  title: "Puja Partner — Find Your People. Celebrate Together. 🪷",
  description:
    "The modern social platform for Durga Puja in Kolkata. Find compatible pandal-hopping partners, join verified groups, plan your routes, and celebrate together.",
  keywords: ["Durga Puja", "Puja Partner", "Kolkata", "Pandal Hopping", "Sharodiya", "Dating", "Friends", "Maddox Square"],
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
    title: "Puja Partner — Find Your People. Celebrate Together. 🪷",
    description: "Meet compatible people, find Puja buddies, join pandal-hopping groups, and make your Durga Puja unforgettable.",
    type: "website",
    images: [
      {
        url: "/logo.png",
        width: 1024,
        height: 1024,
        alt: "IshqYara — Puja Partner",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${jakarta.variable} scroll-smooth`}>
      <body className="min-h-screen bg-[#faf7f2] text-stone-900 font-sans antialiased selection:bg-[#9e1b22] selection:text-white">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
