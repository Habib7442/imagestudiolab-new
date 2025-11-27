"use client";

import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";

export default function CookiePolicy() {
  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-fuchsia-500 selection:text-white">
      <Navbar />
      
      <main className="pt-32 pb-20 px-4 md:px-8 max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold mb-8 bg-gradient-to-r from-white to-neutral-400 bg-clip-text text-transparent">
          Cookie Policy
        </h1>
        
        <div className="prose prose-invert prose-lg max-w-none text-neutral-400">
          <p className="lead text-xl text-neutral-300 mb-8">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <p>
            This is the Cookie Policy for ImageStudioLab, accessible from imagestudiolab.com
          </p>

          <h2 className="text-white mt-12 mb-4 text-2xl font-bold">What Are Cookies</h2>
          <p>
            As is common practice with almost all professional websites this site uses cookies, which are tiny files that are 
            downloaded to your computer, to improve your experience. This page describes what information they gather, how we 
            use it and why we sometimes need to store these cookies. We will also share how you can prevent these cookies from 
            being stored however this may downgrade or 'break' certain elements of the sites functionality.
          </p>

          <h2 className="text-white mt-12 mb-4 text-2xl font-bold">How We Use Cookies</h2>
          <p>
            We use cookies for a variety of reasons detailed below. Unfortunately in most cases there are no industry standard 
            options for disabling cookies without completely disabling the functionality and features they add to this site. 
            It is recommended that you leave on all cookies if you are not sure whether you need them or not in case they are 
            used to provide a service that you use.
          </p>

          <h2 className="text-white mt-12 mb-4 text-2xl font-bold">Disabling Cookies</h2>
          <p>
            You can prevent the setting of cookies by adjusting the settings on your browser (see your browser Help for how to 
            do this). Be aware that disabling cookies will affect the functionality of this and many other websites that you 
            visit. Disabling cookies will usually result in also disabling certain functionality and features of the this site. 
            Therefore it is recommended that you do not disable cookies.
          </p>

          <h2 className="text-white mt-12 mb-4 text-2xl font-bold">The Cookies We Set</h2>
          <ul className="list-disc pl-6 space-y-4 my-4">
            <li>
              <strong className="text-white">Account related cookies</strong>
              <p>
                If you create an account with us then we will use cookies for the management of the signup process and general 
                administration. These cookies will usually be deleted when you log out however in some cases they may remain 
                afterwards to remember your site preferences when logged out.
              </p>
            </li>
            <li>
              <strong className="text-white">Login related cookies</strong>
              <p>
                We use cookies when you are logged in so that we can remember this fact. This prevents you from having to log in 
                every single time you visit a new page. These cookies are typically removed or cleared when you log out to ensure 
                that you can only access restricted features and areas when logged in.
              </p>
            </li>
            <li>
              <strong className="text-white">Site preferences cookies</strong>
              <p>
                In order to provide you with a great experience on this site we provide the functionality to set your preferences 
                for how this site runs when you use it. In order to remember your preferences we need to set cookies so that this 
                information can be called whenever you interact with a page is affected by your preferences.
              </p>
            </li>
          </ul>

          <h2 className="text-white mt-12 mb-4 text-2xl font-bold">Third Party Cookies</h2>
          <p>
            In some special cases we also use cookies provided by trusted third parties. The following section details which 
            third party cookies you might encounter through this site.
          </p>
          <ul className="list-disc pl-6 space-y-4 my-4">
            <li>
              <p>
                This site uses Google Analytics which is one of the most widespread and trusted analytics solution on the web for 
                helping us to understand how you use the site and ways that we can improve your experience. These cookies may 
                track things such as how long you spend on the site and the pages that you visit so we can continue to produce 
                engaging content.
              </p>
            </li>
          </ul>

          <h2 className="text-white mt-12 mb-4 text-2xl font-bold">More Information</h2>
          <p>
            Hopefully that has clarified things for you and as was previously mentioned if there is something that you aren't sure 
            whether you need or not it's usually safer to leave cookies enabled in case it does interact with one of the features 
            you use on our site.
          </p>
          <p className="mt-8">
            However if you are still looking for more information then you can contact us through one of our preferred contact methods:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li>Email: support@imagestudiolab.com</li>
          </ul>
        </div>
      </main>

      <Footer />
    </div>
  );
}
