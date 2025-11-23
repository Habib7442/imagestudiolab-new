import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { saveDraft, getDraft, deleteDraft } from '@/lib/indexed-db';

// Custom storage adapter for Zustand to use IndexedDB
const idbStorage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      const value = await getDraft(name);
      // IndexedDB stores the raw string if we passed it from persist, 
      // or the object if we saved it manually. 
      // Zustand persist with createJSONStorage expects a stringified JSON.
      return value ? (value as string) : null;
    } catch (e) {
      console.error("IDB Get Error", e);
      return null;
    }
  },
  setItem: async (name: string, value: string): Promise<void> => {
    try {
      await saveDraft(name, value);
    } catch (e) {
      console.error("IDB Set Error", e);
    }
  },
  removeItem: async (name: string): Promise<void> => {
    try {
      await deleteDraft(name);
    } catch (e) {
      console.error("IDB Remove Error", e);
    }
  },
};

interface ChallengeState {
  step: number;
  category: string;
  customCategory: string;
  title: string;
  prompt: string;
  coverPrompt: string;
  coverRefImage: string | null;
  generatedCover: string | null;
  generatedPages: string[];
  
  setStep: (step: number) => void;
  setCategory: (category: string) => void;
  setCustomCategory: (customCategory: string) => void;
  setTitle: (title: string) => void;
  setPrompt: (prompt: string) => void;
  setCoverPrompt: (coverPrompt: string) => void;
  setCoverRefImage: (image: string | null) => void;
  setGeneratedCover: (cover: string | null) => void;
  setGeneratedPages: (pages: string[]) => void;
  reset: () => void;
}

export const useChallengeStore = create<ChallengeState>()(
  persist(
    (set) => ({
      step: 1,
      category: "cooking",
      customCategory: "",
      title: "",
      prompt: "",
      coverPrompt: "",
      coverRefImage: null,
      generatedCover: null,
      generatedPages: [],

      setStep: (step) => set({ step }),
      setCategory: (category) => set({ category }),
      setCustomCategory: (customCategory) => set({ customCategory }),
      setTitle: (title) => set({ title }),
      setPrompt: (prompt) => set({ prompt }),
      setCoverPrompt: (coverPrompt) => set({ coverPrompt }),
      setCoverRefImage: (coverRefImage) => set({ coverRefImage }),
      setGeneratedCover: (generatedCover) => set({ generatedCover }),
      setGeneratedPages: (generatedPages) => set({ generatedPages }),
      reset: () => set({
        step: 1,
        category: "cooking",
        customCategory: "",
        title: "",
        prompt: "",
        coverPrompt: "",
        coverRefImage: null,
        generatedCover: null,
        generatedPages: [],
      }),
    }),
    {
      name: 'challenge-draft-store', // Unique name for IndexedDB key
      storage: createJSONStorage(() => idbStorage),
      skipHydration: true, // Important for Next.js SSR
    }
  )
);
