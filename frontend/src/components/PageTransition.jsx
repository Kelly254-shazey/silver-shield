import { motion } from "framer-motion";

function PageTransition({ children, className = "" }) {
  return (
    <motion.main
      className={className}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
    >
      {children}
    </motion.main>
  );
}

export default PageTransition;
