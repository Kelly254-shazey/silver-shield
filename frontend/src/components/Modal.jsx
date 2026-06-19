import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

function Modal({ isOpen, onClose, title, icon, children, maxWidth = "max-w-2xl" }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-modal flex items-center justify-center p-6 bg-brand-900/40 backdrop-blur-sm overflow-y-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className={`relative w-full ${maxWidth} bg-white rounded-[40px] shadow-premium border border-border-subtle overflow-hidden flex flex-col my-auto`}
          >
            <header className="flex items-center justify-between p-8 border-b border-border-subtle bg-surface-100">
              <div className="flex items-center gap-4">
                {icon && (
                  <div className="w-12 h-12 rounded-2xl bg-brand-900 text-white flex items-center justify-center shadow-lg">
                    {icon}
                  </div>
                )}
                <div className="flex flex-col">
                  <h2 className="text-sm font-black text-brand-900 uppercase tracking-widest m-0">{title}</h2>
                  <p className="text-[9px] font-bold text-text-400 uppercase tracking-tighter m-0 mt-1">Command Input required</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-3 text-text-400 hover:text-brand-900 transition-colors bg-transparent border-none cursor-pointer"
              >
                <X size={24} />
              </button>
            </header>
            <div className="p-8 md:p-10 max-h-[70vh] overflow-y-auto custom-scrollbar bg-white">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default Modal;