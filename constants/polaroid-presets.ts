// Predefined filters and themes
export const FILTERS = {
  none: { name: "Original", filter: "" },
  vintage: { name: "Vintage", filter: "sepia(0.5) contrast(1.1)" },
  warm: { name: "Warm Sunset", filter: "saturate(1.3) hue-rotate(-10deg) brightness(1.1)" },
  cool: { name: "Cool Blue", filter: "saturate(0.9) hue-rotate(10deg) brightness(0.95)" },
  dramatic: { name: "Dramatic", filter: "contrast(1.4) saturate(1.2) brightness(0.9)" },
  dreamy: { name: "Dreamy", filter: "brightness(1.1) saturate(0.8) blur(0.5px)" },
  noir: { name: "Film Noir", filter: "grayscale(1) contrast(1.3)" },
  neon: { name: "Neon Nights", filter: "saturate(2) contrast(1.2) hue-rotate(20deg)" },
};

export const THEMES = {
  classic: {
    name: "Classic White",
    frameColor: "#FFFFFF",
    textColor: "#000000",
    shadow: "0 4px 20px rgba(0,0,0,0.15)",
  },
  dark: {
    name: "Dark Academia",
    frameColor: "#1A1A1A",
    textColor: "#FFFFFF",
    shadow: "0 4px 20px rgba(0,0,0,0.4)",
  },
  y2k: {
    name: "Y2K Glossy",
    frameColor: "#FFB6E1",
    textColor: "#FF1493",
    shadow: "0 4px 30px rgba(255,20,147,0.3)",
  },
  cyberpunk: {
    name: "Cyberpunk Neon",
    frameColor: "#0A0A0A",
    textColor: "#00FFFF",
    shadow: "0 0 30px rgba(0,255,255,0.5)",
  },
  luxury: {
    name: "Luxury Gold",
    frameColor: "#FFD700",
    textColor: "#000000",
    shadow: "0 4px 30px rgba(255,215,0,0.4)",
  },
  minimal: {
    name: "Minimal Editorial",
    frameColor: "#F5F5F5",
    textColor: "#333333",
    shadow: "0 2px 15px rgba(0,0,0,0.08)",
  },
};

export const BACKGROUND_COLORS = [
  { name: "Beige Linen", color: "#E8DCC4" },
  { name: "Soft Pink", color: "#FFE5E5" },
  { name: "Mint Green", color: "#E0F4E8" },
  { name: "Lavender", color: "#E6E6FA" },
  { name: "Peach", color: "#FFE5CC" },
  { name: "Sky Blue", color: "#E0F2FF" },
  { name: "White", color: "#FFFFFF" },
  { name: "Black", color: "#000000" },
];

export const EXPORT_SIZES = {
  single: [
    { name: "Instagram Story (9:16)", width: 1080, height: 1920, aspectRatio: 9/16 },
    { name: "Instagram Post (1:1)", width: 1080, height: 1080, aspectRatio: 1 },
    { name: "Instagram Feed (4:5)", width: 1080, height: 1350, aspectRatio: 4/5 },
  ],
  storyboard: [
    { name: "Instagram Carousel (1:1)", width: 1080, height: 1080, aspectRatio: 1 },
    { name: "Landscape (16:9)", width: 1920, height: 1080, aspectRatio: 16/9 },
    { name: "Pinterest (2:3)", width: 1000, height: 1500, aspectRatio: 2/3 },
  ],
};

export const AI_EDIT_PROMPTS = [
  "Make lips bolder and more vibrant",
  "Enhance eyes and make them pop",
  "Add a soft glow to the skin",
  "Make the image more cinematic",
  "Add warm golden hour lighting",
  "Make colors more vibrant and saturated",
  "Add a dreamy, ethereal effect",
  "Enhance contrast for dramatic look",
];

export const CAPTION_STYLES = [
  "Flirty & Playful",
  "Romantic & Sweet",
  "Minimal & Aesthetic",
  "Moody & Deep",
  "Confident & Bold",
  "Cute & Wholesome",
];
