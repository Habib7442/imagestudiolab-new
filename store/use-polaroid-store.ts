import { create } from "zustand";
import { FILTERS, THEMES } from "@/constants/polaroid-presets";
import { TEMPLATES } from "@/constants/templates";

export interface Polaroid {
  id: string;
  imageUrl: string;
  mediaType: 'image' | 'video';
  caption: string;
  filter: keyof typeof FILTERS;
  theme: keyof typeof THEMES;
  rotation: number;
  position: { x: number; y: number };
  customFilter?: string;
  scale?: number;
  originalImageUrl?: string;
  date?: string;
}

interface PolaroidStore {
  // State
  polaroids: Polaroid[];
  selectedPolaroid: string | null;
  mode: "single" | "storyboard";
  backgroundColor: string;
  exportSize: number;
  isGeneratingCaption: boolean;
  isGeneratingEdit: boolean;
  isExporting: boolean;

  // Actions
  addPolaroid: (polaroid: Polaroid) => void;
  updatePolaroid: (id: string, updates: Partial<Polaroid>) => void;
  removePolaroid: (id: string) => void;
  setSelectedPolaroid: (id: string | null) => void;
  setMode: (mode: "single" | "storyboard") => void;
  setBackgroundColor: (color: string) => void;
  setExportSize: (size: number) => void;
  setIsGeneratingCaption: (value: boolean) => void;
  setIsGeneratingEdit: (value: boolean) => void;
  setIsExporting: (value: boolean) => void;
  clearPolaroids: () => void;
  applyTemplate: (templateId: string) => void;
  generateAIForPolaroid: (id: string) => Promise<void>;
  editPolaroidImage: (id: string, prompt: string) => Promise<void>;
  restorePolaroidImage: (id: string) => void;
}

export const usePolaroidStore = create<PolaroidStore>((set, get) => ({
  // Initial State
  polaroids: [],
  selectedPolaroid: null,
  mode: "single",
  backgroundColor: "#E8DCC4",
  exportSize: 0,
  isGeneratingCaption: false,
  isGeneratingEdit: false,
  isExporting: false,

  // Actions
  addPolaroid: (polaroid) =>
    set((state) => ({
      polaroids: state.mode === "single" 
        ? [{ ...polaroid, originalImageUrl: polaroid.imageUrl }] 
        : [...state.polaroids, { ...polaroid, originalImageUrl: polaroid.imageUrl }],
      selectedPolaroid: polaroid.id,
    })),

  updatePolaroid: (id, updates) =>
    set((state) => ({
      polaroids: state.polaroids.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      ),
    })),

  removePolaroid: (id) =>
    set((state) => ({
      polaroids: state.polaroids.filter((p) => p.id !== id),
      selectedPolaroid: state.selectedPolaroid === id ? null : state.selectedPolaroid,
    })),

  setSelectedPolaroid: (id) => set({ selectedPolaroid: id }),

  setMode: (mode) => set({ mode }),

  setBackgroundColor: (color) => set({ backgroundColor: color }),

  setExportSize: (size) => set({ exportSize: size }),

  setIsGeneratingCaption: (value) => set({ isGeneratingCaption: value }),

  setIsGeneratingEdit: (value) => set({ isGeneratingEdit: value }),

  setIsExporting: (value: boolean) => set({ isExporting: value }),

  clearPolaroids: () => set({ polaroids: [], selectedPolaroid: null }),

  applyTemplate: (templateId) => {
    const template = TEMPLATES.find((t) => t.id === templateId);
    if (!template) return;

    set((state) => {
      const newPolaroids = state.polaroids.map((polaroid, index) => {
        const slot = template.slots[index % template.slots.length];
        return {
          ...polaroid,
          position: { x: slot.x, y: slot.y },
          rotation: slot.rotation,
          scale: 0.5, // Force scale to 50% for better performance and consistency
        };
      });
      return {
        polaroids: newPolaroids,
        mode: "storyboard",
      };
    });
  },

  generateAIForPolaroid: async (id) => {
    const state = get();
    const polaroid = state.polaroids.find((p) => p.id === id);
    if (!polaroid) return;

    set({ isGeneratingCaption: true });
    try {
      const { generatePolaroidMetadata } = await import("@/actions/ai-actions");
      const metadata = await generatePolaroidMetadata(polaroid.imageUrl);
      
      set((state) => ({
        polaroids: state.polaroids.map((p) =>
          p.id === id
            ? {
                ...p,
                caption: metadata.caption,
                filter: metadata.mood.toLowerCase() as any, // Ensure it matches type
                theme: metadata.theme.toLowerCase() as any,
              }
            : p
        ),
        isGeneratingCaption: false,
      }));
    } catch (error) {
      console.error("Failed to generate AI metadata", error);
      set({ isGeneratingCaption: false });
    }
  },

  editPolaroidImage: async (id, prompt) => {
    const polaroid = get().polaroids.find((p) => p.id === id);
    if (!polaroid) return;

    set({ isGeneratingEdit: true });
    try {
      const { generateImageEdit } = await import("@/actions/ai-actions");
      // Ensure originalImageUrl is set before editing
      if (!polaroid.originalImageUrl) {
        get().updatePolaroid(id, { originalImageUrl: polaroid.imageUrl });
      }
      
      const newImageBase64 = await generateImageEdit(polaroid.imageUrl, prompt);
      get().updatePolaroid(id, { imageUrl: newImageBase64 });
    } catch (error) {
      console.error("Failed to edit polaroid image:", error);
    } finally {
      set({ isGeneratingEdit: false });
    }
  },

  restorePolaroidImage: (id) => {
    const polaroid = get().polaroids.find((p) => p.id === id);
    if (polaroid && polaroid.originalImageUrl) {
      get().updatePolaroid(id, { imageUrl: polaroid.originalImageUrl });
    }
  },
}));
