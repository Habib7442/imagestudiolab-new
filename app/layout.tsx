import type { Metadata, Viewport } from "next";
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

export const viewport: Viewport = {
  themeColor: "#050505",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://imagestudiolab.com"),
  title: {
    default: "ImageStudioLab - AI Infographic Generator",
    template: "%s | ImageStudioLab",
  },
  description: "The ultimate AI Infographic suite. Turn topics and product photos into viral vertical infographics in seconds.",
  keywords: [
    "AI infographic", 
    "infographic generator", 
    "visual content", 
    "social media graphics", 
    "product showcase", 
    "educational visuals", 
    "ImageStudioLab"
  ],
  authors: [{ name: "ImageStudioLab Team" }],
  creator: "ImageStudioLab",
  publisher: "ImageStudioLab",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://imagestudiolab.com",
    title: "ImageStudioLab - AI Infographic Generator",
    description: "Turn topics and products into stunning infographics instantly with AI.",
    siteName: "ImageStudioLab",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "ImageStudioLab Creative Suite Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ImageStudioLab - AI Photoshoot & Viral Trends Studio",
    description: "Create professional headshots, virtual fashion try-ons, and viral music visuals with AI.",
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
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ImageStudioLab",
  },
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
