
export enum FrameColor {
  White = 'bg-polaroid-white',
  Cream = 'bg-polaroid-cream',
  Black = 'bg-polaroid-black',
  Pink = 'bg-polaroid-pink',
  Blue = 'bg-polaroid-blue',
}

export enum FilterType {
  None = 'none',
  Sepia = 'sepia(0.6) contrast(1.1) brightness(0.9)',
  BW = 'grayscale(1) contrast(1.2)',
  Vintage = 'sepia(0.3) contrast(1.2) saturate(1.3) brightness(0.95)',
  Faded = 'opacity(0.9) brightness(1.1) sepia(0.2) contrast(0.9)',
  Warm = 'sepia(0.4) saturate(1.5) hue-rotate(-10deg)',
  Cool = 'saturate(0.8) hue-rotate(10deg) brightness(1.05)',
}

export enum FontFamily {
  Caveat = 'font-handwriting1',
  PermanentMarker = 'font-handwriting2',
  ShadowsIntoLight = 'font-handwriting3',
  Courier = 'font-typewriter',
}

export interface Sticker {
  id: string;
  image: string;
  x: number; // Percentage 0-100
  y: number; // Percentage 0-100
  rotation: number;
  scale: number;
}

export interface MusicTrack {
  title: string;
  artist: string;
  mood: 'happy' | 'sad' | 'chill' | 'energetic';
  tempo: number;
  source: 'generated' | 'upload';
  url?: string; // For uploaded files
}

export interface PolaroidConfig {
  image: string | null;
  mediaType: 'image' | 'video';
  caption: string;
  frameColor: FrameColor;
  filter: FilterType;
  font: FontFamily;
  rotation: number;
  showTape: boolean;
  showTexture: boolean;
  date: string;
  stickers: Sticker[];
  imageFit: 'cover' | 'contain';
  music: MusicTrack | null;
}
