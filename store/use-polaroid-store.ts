import { create } from 'zustand';

interface PolaroidState {
  uploadedImage: string | null;
  caption: string;
  filter: string;
  frameStyle: string;
  isProcessing: boolean;
  setUploadedImage: (image: string | null) => void;
  setCaption: (caption: string) => void;
  setFilter: (filter: string) => void;
  setFrameStyle: (style: string) => void;
  setIsProcessing: (isProcessing: boolean) => void;
}

export const usePolaroidStore = create<PolaroidState>((set) => ({
  uploadedImage: null,
  caption: '',
  filter: 'none',
  frameStyle: 'classic-white',
  isProcessing: false,
  setUploadedImage: (image) => set({ uploadedImage: image }),
  setCaption: (caption) => set({ caption }),
  setFilter: (filter) => set({ filter }),
  setFrameStyle: (frameStyle) => set({ frameStyle }),
  setIsProcessing: (isProcessing) => set({ isProcessing }),
}));
