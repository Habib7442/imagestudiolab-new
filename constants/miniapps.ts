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
    id: "yt-thumbnail",
    name: "YT Thumbnail Gen",
    description: "Create viral YouTube thumbnails with AI. Auto-enhance faces, add catchy text, and generate click-worthy backgrounds.",
    href: "/thumbnail-gen",
    icon: "▶️",
    status: "live",
    color: "#FF0000",
    gradient: "from-[#FF0000] to-[#282828]",
  },
  {
    id: "carousel-maker",
    name: "AI Carousel Maker",
    description: "Turn YouTube videos, PDFs, or ideas into engaging, swipeable social media carousels in seconds.",
    href: "/carousel",
    icon: "🎠",
    status: "live",
    color: "#A855F7",
    gradient: "from-purple-600 to-pink-600",
  },
];
