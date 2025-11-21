
export interface TemplateSlot {
  x: number;
  y: number;
  rotation: number;
  scale: number;
  zIndex: number;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  slots: TemplateSlot[];
  background?: string;
  minImages: number;
}

export const TEMPLATES: Template[] = [
  {
    id: "love-struck",
    name: "Love Struck",
    description: "Romantic chaotic energy",
    thumbnail: "/templates/love.png",
    minImages: 2,
    slots: [
      { x: -80, y: -50, rotation: -12, scale: 1.1, zIndex: 1 },
      { x: 80, y: 50, rotation: 12, scale: 1.1, zIndex: 2 },
    ],
  },
  {
    id: "gallery-wall-3",
    name: "Gallery Wall",
    description: "Artistic spread of memories",
    thumbnail: "/templates/film.png", // Keeping same thumbnail for now or use a generic one
    minImages: 3,
    slots: [
      { x: -120, y: -100, rotation: -3, scale: 0.9, zIndex: 1 },
      { x: 120, y: 0, rotation: 3, scale: 0.9, zIndex: 2 },
      { x: -120, y: 100, rotation: -2, scale: 0.9, zIndex: 3 },
    ],
  },
  {
    id: "messy-pile-5",
    name: "Memories Pile",
    description: "A beautiful mess of moments",
    thumbnail: "/templates/messy.png",
    minImages: 5,
    slots: [
      { x: -150, y: -150, rotation: -15, scale: 0.8, zIndex: 1 },
      { x: 150, y: -120, rotation: 10, scale: 0.8, zIndex: 2 },
      { x: 0, y: 0, rotation: 5, scale: 1, zIndex: 5 },
      { x: -120, y: 150, rotation: -5, scale: 0.8, zIndex: 3 },
      { x: 180, y: 180, rotation: 8, scale: 0.8, zIndex: 4 },
    ],
  },
  {
    id: "grid-4-aesthetic",
    name: "Clean Grid",
    description: "Minimalist 2x2 arrangement",
    thumbnail: "/templates/grid.png",
    minImages: 4,
    slots: [
      { x: -130, y: -130, rotation: 0, scale: 0.95, zIndex: 1 },
      { x: 130, y: -130, rotation: 0, scale: 0.95, zIndex: 1 },
      { x: -130, y: 130, rotation: 0, scale: 0.95, zIndex: 1 },
      { x: 130, y: 130, rotation: 0, scale: 0.95, zIndex: 1 },
    ],
  },
  {
    id: "fan-stack",
    name: "Fan Stack",
    description: "Elegant fanned cards",
    thumbnail: "/templates/duo.png", // Keep same thumbnail or update if available
    minImages: 3,
    slots: [
      { x: -100, y: 20, rotation: -15, scale: 0.9, zIndex: 1 },
      { x: 0, y: -20, rotation: 0, scale: 0.9, zIndex: 2 },
      { x: 100, y: 20, rotation: 15, scale: 0.9, zIndex: 3 },
    ],
  },
];
