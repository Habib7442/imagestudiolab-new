"use client";

import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-fuchsia-500 selection:text-white">
      <Navbar />
      
      <main className="pt-32 pb-20 px-4 md:px-8 max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold mb-8 bg-gradient-to-r from-white to-neutral-400 bg-clip-text text-transparent">
          Privacy Policy
        </h1>
        
        <div className="prose prose-invert prose-lg max-w-none text-neutral-400">
          <p className="lead text-xl text-neutral-300 mb-8">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <p>
            At ImageStudioLab, accessible from imagestudiolab.com, one of our main priorities is the privacy of our visitors. 
            This Privacy Policy document contains types of information that is collected and recorded by ImageStudioLab and how we use it.
          </p>

          <h2 className="text-white mt-12 mb-4 text-2xl font-bold">Log Files</h2>
          <p>
            ImageStudioLab follows a standard procedure of using log files. These files log visitors when they visit websites. 
            All hosting companies do this and a part of hosting services' analytics. The information collected by log files include 
            internet protocol (IP) addresses, browser type, Internet Service Provider (ISP), date and time stamp, referring/exit pages, 
            and possibly the number of clicks. These are not linked to any information that is personally identifiable. 
            The purpose of the information is for analyzing trends, administering the site, tracking users' movement on the website, 
            and gathering demographic information.
          </p>

          <h2 className="text-white mt-12 mb-4 text-2xl font-bold">Cookies and Web Beacons</h2>
          <p>
            Like any other website, ImageStudioLab uses 'cookies'. These cookies are used to store information including visitors' 
            preferences, and the pages on the website that the visitor accessed or visited. The information is used to optimize 
            the users' experience by customizing our web page content based on visitors' browser type and/or other information.
          </p>

          <h2 className="text-white mt-12 mb-4 text-2xl font-bold">Privacy Policies</h2>
          <p>
            You may consult this list to find the Privacy Policy for each of the advertising partners of ImageStudioLab.
          </p>
          <p>
            Third-party ad servers or ad networks uses technologies like cookies, JavaScript, or Web Beacons that are used in their 
            respective advertisements and links that appear on ImageStudioLab, which are sent directly to users' browser. 
            They automatically receive your IP address when this occurs. These technologies are used to measure the effectiveness 
            of their advertising campaigns and/or to personalize the advertising content that you see on websites that you visit.
          </p>
          <p>
            Note that ImageStudioLab has no access to or control over these cookies that are used by third-party advertisers.
          </p>

          <h2 className="text-white mt-12 mb-4 text-2xl font-bold">Third Party Privacy Policies</h2>
          <p>
            ImageStudioLab's Privacy Policy does not apply to other advertisers or websites. Thus, we are advising you to consult 
            the respective Privacy Policies of these third-party ad servers for more detailed information. It may include their 
            practices and instructions about how to opt-out of certain options.
          </p>

          <h2 className="text-white mt-12 mb-4 text-2xl font-bold">Children's Information</h2>
          <p>
            Another part of our priority is adding protection for children while using the internet. We encourage parents and 
            guardians to observe, participate in, and/or monitor and guide their online activity.
          </p>
          <p>
            ImageStudioLab does not knowingly collect any Personal Identifiable Information from children under the age of 13. 
            If you think that your child provided this kind of information on our website, we strongly encourage you to contact 
            us immediately and we will do our best efforts to promptly remove such information from our records.
          </p>

          <h2 className="text-white mt-12 mb-4 text-2xl font-bold">Online Privacy Policy Only</h2>
          <p>
            This Privacy Policy applies only to our online activities and is valid for visitors to our website with regards to 
            the information that they shared and/or collect in ImageStudioLab. This policy is not applicable to any information 
            collected offline or via channels other than this website.
          </p>

          <h2 className="text-white mt-12 mb-4 text-2xl font-bold">Consent</h2>
          <p>
            By using our website, you hereby consent to our Privacy Policy and agree to its Terms and Conditions.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
