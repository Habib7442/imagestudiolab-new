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
    id: "retro-press",
    name: "Retro Press",
    description: "Get featured on a 1920s newspaper front page. 'WANTED', 'LOCAL HERO', or custom headlines with weathered textures.",
    href: "#",
    icon: "📰",
    status: "coming_soon",
    color: "#FFCB3A",
    gradient: "from-[#FFCB3A] to-[#FF7A3C]",
  },
];
