"use client";

import Navbar from "@/components/shared/Navbar";
import InfographicGenerator from "@/components/infographics/InfographicGenerator";

export default function CreateProductPage() {
  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px]" />
            <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-teal-600/10 rounded-full blur-[120px]" />
        </div>

        <Navbar />

        <main className="container mx-auto px-4 pt-24 pb-20 relative z-10">
            <div className="text-center mb-12">
               <h1 className="text-4xl md:text-5xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-500">
                  Product Showcase
               </h1>
               <p className="text-neutral-400 max-w-2xl mx-auto">
                  Create high-converting, viral product infographics for your brand instantly.
               </p>
            </div>

            <InfographicGenerator mode="product" />
        </main>
    </div>
  );
}
