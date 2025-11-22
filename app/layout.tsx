import type { Metadata } from "next";
import { Geist, Geist_Mono, Caveat, Outfit } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://imagestudiolab.com"),
  title: {
    default: "ImageStudioLab - AI Aesthetic Video & Photo Creator",
    template: "%s | ImageStudioLab",
  },
  description: "Create stunning animated video polaroids, aesthetic photo stories, and 3D visuals. Features AI-powered editing, cinematic filters (8mm, VHS), and seamless export for Instagram, TikTok, and Pinterest.",
  keywords: [
    "polaroid creator", 
    "video polaroid", 
    "aesthetic photo editor", 
    "AI image generator", 
    "cinematic filters", 
    "instagram story maker", 
    "retro photo effects", 
    "8mm filter", 
    "VHS effect", 
    "ImageStudioLab"
  ],
  authors: [{ name: "ImageStudioLab Team" }],
  creator: "ImageStudioLab",
  publisher: "ImageStudioLab",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://imagestudiolab.com",
    title: "PolaroidX - Create Aesthetic Video Polaroids",
    description: "Transform your memories into cinematic masterpieces. The only polaroid creator with video support, AI magic, and premium aesthetic filters.",
    siteName: "ImageStudioLab",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "PolaroidX Aesthetic Creator Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PolaroidX - AI Video & Photo Creator",
    description: "Create viral aesthetic content with PolaroidX. Video support, AI edits, and cinematic vibes.",
    images: ["/og-image.jpg"],
    creator: "@imagestudiolab",
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
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} ${caveat.variable} ${outfit.variable} font-sans antialiased bg-[#050505] text-white`}
      >
        {children}
      </body>
    </html>
  );
}
