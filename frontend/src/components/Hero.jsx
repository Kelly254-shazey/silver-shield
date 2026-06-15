import React from "react";
import {  } from "framer-motion";

/**
 * Viewport-First Hero: Fixes oversized sections and high LCP.
 * Communicates platinum value immediately without excessive scrolling.
 */
export const Hero = () => {
  return (
    <section className="relative pt-32 pb-16 px-6 min-h-[70vh] flex flex-col items-center text-center overflow-hidden">
      {/* Ambient background signal */}
      <div 
        className="absolute top-0 -z-10 h-[600px] w-full bg-[radial-gradient(circle_farthest-side_at_50%_0%,#1e1b4b,transparent)] opacity-40" 
        aria-hidden="true"
      />

      <m.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
      >
        <span className="inline-block px-3 py-1 mb-6 rounded-full border border-indigo-500/20 bg-indigo-500/5 text-[10px] font-semibold text-indigo-400 tracking-wider uppercase">
          New: Enterprise Shield 2.0
        </span>
        
        <h1 className="display-heading max-w-4xl mx-auto mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-zinc-500">
          The Platinum Standard in Digital Security.
        </h1>
        
        <p className="body-premium max-w-2xl mx-auto mb-10">
          Silver Shield integrates world-class threat intelligence with seamless workflow automation. 
          Modern protection for the high-trust economy.
        </p>

        <div className="flex flex-wrap gap-4 justify-center">
          <button className="bg-white text-black px-8 py-3 rounded-full font-bold hover:bg-zinc-200 transition-all">
            Get Started
          </button>
          <button className="border border-white/10 px-8 py-3 rounded-full font-bold hover:bg-white/5 transition-all">
            View Security Docs
          </button>
        </div>
      </m.div>
    </section>
  );
};