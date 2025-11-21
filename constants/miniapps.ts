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
];
