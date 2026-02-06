import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  metadataBase: new URL('https://www.imagestudiolab.com'),
  title: "Image Studio Lab | AI-Powered Visual Study Engine",
  description: "Transform your notes into professional educational illustrations, smart study decks, and high-yield infographics automatically using AI. Master any subject visually.",
  keywords: [
    "ai study tool", 
    "visual learning", 
    "concept mapping", 
    "study engine", 
    "educational diagrams", 
    "smart notes", 
    "ai infographics",
    "visual memory aid",
    "exam preparation tool",
    "diagram generator",
    "scientific illustrations ai",
    "medical study aid",
    "engineering diagrams generator"
  ],
  authors: [{ name: "Image Studio Lab" }],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Image Studio Lab | The Visual Study Engine",
    description: "Convert notes into professional illustrations, smart quizzes, and infographics instantly with AI.",
    url: "https://www.imagestudiolab.com",
    siteName: "Image Studio Lab",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Image Studio Lab Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Image Studio Lab | The Visual Study Engine",
    description: "Transform complex notes into professional illustrations and smart study decks automatically.",
    images: ["/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport = {
  themeColor: "#0d9488",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <body className={`${inter.variable} ${outfit.variable} antialiased`}>
        <div className="min-h-screen flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
