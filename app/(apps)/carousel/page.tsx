import { CarouselGenerator } from "@/components/carousel/CarouselGenerator";
import Navbar from "@/components/shared/Navbar";
import { Camera, Sparkles } from "lucide-react";

export const metadata = {
  title: "AI Carousel Maker | ImageStudioLab",
  description: "Generate viral social media carousels from YouTube videos, PDFs, images, or topics.",
};

export default function CarouselPage() {
  return (
    <main className="min-h-screen bg-[#050505] text-white p-4 md:p-8 pt-24 md:pt-32 font-sans selection:bg-fuchsia-500 selection:text-white">
      <Navbar />
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 mb-4 rounded-2xl bg-fuchsia-500/10 border border-fuchsia-500/20 text-fuchsia-400">
            <Sparkles className="w-6 h-6 mr-2" />
            <span className="font-bold tracking-wider uppercase text-sm">AI Carousel Studio</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-white via-fuchsia-200 to-fuchsia-400 bg-clip-text text-transparent">
            Create Viral Carousels
          </h1>
          <p className="text-neutral-400 max-w-2xl mx-auto text-lg">
            Turn PDFs, or ideas into engaging, swipeable social media carousels in seconds.
          </p>
        </div>
        
        <CarouselGenerator />
      </div>
    </main>
  );
}
