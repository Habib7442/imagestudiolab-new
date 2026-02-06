"use client";

import Navbar from "@/components/Navbar";
import NotesToDiagram from "@/components/NotesToDiagram";
import Features from "@/components/Features";

export default function Home() {
  return (
    <main className="flex-grow">
      <Navbar />
      
      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[10%] left-[5%] w-[400px] h-[400px] bg-teal-100/30 rounded-full blur-[120px]" />
        <div className="absolute bottom-[20%] right-[10%] w-[500px] h-[500px] bg-indigo-100/40 rounded-full blur-[140px]" />
      </div>

      <div className="relative pt-8">
        <NotesToDiagram />
        <Features />
      </div>

      <section className="bg-slate-900 text-white py-24 mt-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
            <div>
              <div className="w-12 h-12 bg-teal-500/20 text-teal-400 rounded-2xl flex items-center justify-center text-2xl mb-6 border border-teal-500/30">
                🎨
              </div>
              <h4 className="text-xl font-black mb-3 font-outfit">Visual Concepts</h4>
              <p className="text-slate-400 text-sm leading-relaxed">
                Textbook-quality illustrations for any scientific, technical, or complex subject area.
              </p>
            </div>
            <div>
              <div className="w-12 h-12 bg-indigo-500/20 text-indigo-400 rounded-2xl flex items-center justify-center text-2xl mb-6 border border-indigo-500/30">
                🗺️
              </div>
              <h4 className="text-xl font-black mb-3 font-outfit">Structured Breakdowns</h4>
              <p className="text-slate-400 text-sm leading-relaxed">
                Visual mapping of complex processes or systems for instant clarity and retention.
              </p>
            </div>
            <div>
              <div className="w-12 h-12 bg-purple-500/20 text-purple-400 rounded-2xl flex items-center justify-center text-2xl mb-6 border border-purple-500/30">
                🎯
              </div>
              <h4 className="text-xl font-black mb-3 font-outfit">Exam Mastery</h4>
              <p className="text-slate-400 text-sm leading-relaxed">
                AI extracts high-yield concepts tailored to your specific curriculum and goals.
              </p>
            </div>
            <div>
              <div className="w-12 h-12 bg-rose-500/20 text-rose-400 rounded-2xl flex items-center justify-center text-2xl mb-6 border border-rose-500/30">
                📄
              </div>
              <h4 className="text-xl font-black mb-3 font-outfit">Pro PDF Exports</h4>
              <p className="text-slate-400 text-sm leading-relaxed">
                Download beautiful, high-resolution study guides and diagrams as professional PDFs.
              </p>
            </div>
          </div>

          <div className="mt-24 pt-12 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-2.5">
              <img src="/logo.png" alt="Logo" className="w-6 h-6" />
              <span className="font-outfit font-black text-lg">ImageStudioLab</span>
            </div>
            <p className="text-slate-500 text-sm">© 2026 ImageStudioLab. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="text-slate-500 hover:text-white transition-colors text-sm">Terms</a>
              <a href="#" className="text-slate-500 hover:text-white transition-colors text-sm">Privacy</a>
              <a href="#" className="text-slate-500 hover:text-white transition-colors text-sm">Contact</a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
