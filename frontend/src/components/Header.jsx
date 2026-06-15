import React from "react";
import {  } from "framer-motion";
import LogoBrand from "./LogoBrand";

/**
 * Premium Header: Fixes Issue #3 (Hamburgers on desktop).
 * Uses glassmorphism and intelligent grouping for better conversion.
 */
export const Header = () => {
  const links = ['Platform', 'Security', 'Enterprise', 'Pricing'];

  return (
    <header className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/50 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto h-16 px-6 flex items-center justify-between">
        {/* Logo and Primary Nav Group - Added constraints to prevent overlapping */}
        <div className="flex items-center gap-10 min-w-0">
          <a href="/" className="shrink-0 transition-opacity hover:opacity-80">
            <LogoBrand />
          </a>
          
          <nav className="hidden lg:flex items-center gap-8">
            {links.map((item) => (
              <a 
                key={item} 
                href={`#${item.toLowerCase()}`} 
                className="text-sm font-medium text-zinc-400 hover:text-white transition-colors"
              >
                {item}
              </a>
            ))}
          </nav>
        </div>

        {/* Action Group */}
        <div className="flex items-center gap-4 shrink-0">
          <button className="hidden sm:block text-sm font-medium text-zinc-400 hover:text-white">
            Log In
          </button>
          <m.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-black hover:bg-zinc-200 transition-all shadow-lg"
          >
            Start Protecting
          </m.button>
        </div>
      </div>
    </header>
  );
};