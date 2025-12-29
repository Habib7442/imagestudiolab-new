export interface MiniApp {
  id: string;
  name: string;
  description: string;
  href: string;
  icon: string; // Emoji string
  status: "live" | "beta" | "coming_soon";
  color: string;
  gradient: string;
}

export const MINI_APPS: MiniApp[] = [
  /*
  {
    id: "polaroidx",
    name: "PolaroidX",
    description: "Turn boring photos into sexy, animated 3D polaroids. Cinematic dust, light leaks, and viral aesthetics.",
    href: "/polaroid",
    icon: "📸",
    status: "live",
    color: "#FF3333",
    gradient: "from-[#FF3333] to-[#FF2DAE]",
  },
  */
  {
    id: "photoshoot",
    name: "AI Photoshoot",
    description: "Professional AI photography. Transform your photos with filters like Noir, Blur, and Aesthetic while keeping your face perfect.",
    href: "/photoshoot",
    icon: "✨",
    status: "live",
    color: "#D946EF",
    gradient: "from-fuchsia-500 to-purple-600",
  },
  {
    id: "virtual-try-on",
    name: "Virtual Try-On",
    description: "Try premium outfits instantly with AI. Upload your photo and see how you look in the latest trends before buying.",
    href: "/try-on",
    icon: "👗",
    status: "live",
    color: "#EC4899",
    gradient: "from-pink-500 to-rose-500",
  },
  {
    id: "viral-trends",
    name: "Viral Trends",
    description: "Join the latest viral AI trends. Create stunning visuals for music, reels, and social media challenges.",
    href: "/trendings/music",
    icon: "🔥",
    status: "live",
    color: "#FF5500",
    gradient: "from-orange-500 to-red-600",
  },
  {
    id: "infographics",
    name: "AI Infographics",
    description: "Turn complex topics into viral, educational Instagram infographics. Visual learning made instant.",
    href: "/trendings/infographics",
    icon: "📊",
    status: "live",
    color: "#A855F7",
    gradient: "from-purple-500 to-indigo-600",
  },
];
