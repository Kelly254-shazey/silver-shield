import React from "react";
import { LazyMotion, domAnimation } from "framer-motion";

/**
 * Performance Layer: LazyMotion reduces initial bundle size by loading 
 * motion features only when needed.
 */
export const MotionProvider = ({ children }) => (
  <LazyMotion features={domAnimation} strict>
    {children}
  </LazyMotion>
);