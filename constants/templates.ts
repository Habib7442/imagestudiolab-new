
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
    id: "film-strip-3",
    name: "Film Strip",
    description: "Cinematic vertical sequence",
    thumbnail: "/templates/film.png",
    minImages: 3,
    slots: [
      { x: 0, y: -250, rotation: 0, scale: 0.9, zIndex: 1 },
      { x: 0, y: 0, rotation: 0, scale: 0.9, zIndex: 2 },
      { x: 0, y: 250, rotation: 0, scale: 0.9, zIndex: 3 },
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
    id: "duo-overlap",
    name: "Besties",
    description: "Close overlap for duos",
    thumbnail: "/templates/duo.png",
    minImages: 2,
    slots: [
      { x: -60, y: -20, rotation: -5, scale: 1.2, zIndex: 1 },
      { x: 60, y: 20, rotation: 5, scale: 1.2, zIndex: 2 },
    ],
  },
];
