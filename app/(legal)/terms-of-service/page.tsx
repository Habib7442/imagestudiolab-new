"use client";

import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-fuchsia-500 selection:text-white">
      <Navbar />
      
      <main className="pt-32 pb-20 px-4 md:px-8 max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold mb-8 bg-gradient-to-r from-white to-neutral-400 bg-clip-text text-transparent">
          Terms of Service
        </h1>
        
        <div className="prose prose-invert prose-lg max-w-none text-neutral-400">
          <p className="lead text-xl text-neutral-300 mb-8">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <h2 className="text-white mt-12 mb-4 text-2xl font-bold">1. Terms</h2>
          <p>
            By accessing this Website, accessible from imagestudiolab.com, you are agreeing to be bound by these Website Terms and 
            Conditions of Use and agree that you are responsible for the agreement with any applicable local laws. If you disagree 
            with any of these terms, you are prohibited from accessing this site. The materials contained in this Website are 
            protected by copyright and trade mark law.
          </p>

          <h2 className="text-white mt-12 mb-4 text-2xl font-bold">2. Use License</h2>
          <p>
            Permission is granted to temporarily download one copy of the materials on ImageStudioLab's Website for personal, 
            non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license 
            you may not:
          </p>
          <ul className="list-disc pl-6 space-y-2 my-4">
            <li>modify or copy the materials;</li>
            <li>use the materials for any commercial purpose or for any public display;</li>
            <li>attempt to reverse engineer any software contained on ImageStudioLab's Website;</li>
            <li>remove any copyright or other proprietary notations from the materials; or</li>
            <li>transfer the materials to another person or "mirror" the materials on any other server.</li>
          </ul>
          <p>
            This will let ImageStudioLab to terminate upon violations of any of these restrictions. Upon termination, your viewing 
            right will also be terminated and you should destroy any downloaded materials in your possession whether it is printed 
            or electronic format.
          </p>

          <h2 className="text-white mt-12 mb-4 text-2xl font-bold">3. Disclaimer</h2>
          <p>
            All the materials on ImageStudioLab's Website are provided "as is". ImageStudioLab makes no warranties, may it be 
            expressed or implied, therefore negates all other warranties. Furthermore, ImageStudioLab does not make any 
            representations concerning the accuracy or likely results of the use of the materials on its Website or otherwise 
            relating to such materials or on any sites linked to this Website.
          </p>

          <h2 className="text-white mt-12 mb-4 text-2xl font-bold">4. Limitations</h2>
          <p>
            ImageStudioLab or its suppliers will not be hold accountable for any damages that will arise with the use or inability 
            to use the materials on ImageStudioLab's Website, even if ImageStudioLab or an authorize representative of this 
            Website has been notified, orally or written, of the possibility of such damage. Some jurisdiction does not allow 
            limitations on implied warranties or limitations of liability for incidental damages, these limitations may not apply 
            to you.
          </p>

          <h2 className="text-white mt-12 mb-4 text-2xl font-bold">5. Revisions and Errata</h2>
          <p>
            The materials appearing on ImageStudioLab's Website may include technical, typographical, or photographic errors. 
            ImageStudioLab will not promise that any of the materials in this Website are accurate, complete, or current. 
            ImageStudioLab may change the materials contained on its Website at any time without notice. ImageStudioLab does 
            not make any commitment to update the materials.
          </p>

          <h2 className="text-white mt-12 mb-4 text-2xl font-bold">6. Links</h2>
          <p>
            ImageStudioLab has not reviewed all of the sites linked to its Website and is not responsible for the contents of 
            any such linked site. The presence of any link does not imply endorsement by ImageStudioLab of the site. The use 
            of any linked website is at the user's own risk.
          </p>

          <h2 className="text-white mt-12 mb-4 text-2xl font-bold">7. Site Terms of Use Modifications</h2>
          <p>
            ImageStudioLab may revise these Terms of Use for its Website at any time without prior notice. By using this Website, 
            you are agreeing to be bound by the current version of these Terms and Conditions of Use.
          </p>

          <h2 className="text-white mt-12 mb-4 text-2xl font-bold">8. Your Privacy</h2>
          <p>
            Please read our Privacy Policy.
          </p>

          <h2 className="text-white mt-12 mb-4 text-2xl font-bold">9. Governing Law</h2>
          <p>
            Any claim related to ImageStudioLab's Website shall be governed by the laws of us without regards to its conflict 
            of law provisions.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
