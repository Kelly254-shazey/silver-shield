import { useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertTriangle, CheckCircle2, Info } from "lucide-react";

function ConfirmDialog({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "primary",
}) {
  const handleBackdropClick = useCallback(
    (event) => {
      if (event.target === event.currentTarget) {
        onCancel?.();
      }
    },
    [onCancel],
  );

  const icons = {
    primary: <Info className="text-brand-700" size={24} />,
    danger: <AlertTriangle className="text-danger" size={24} />,
    success: <CheckCircle2 className="text-success" size={24} />,
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-modal flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-brand-900/40 backdrop-blur-sm"
            onClick={handleBackdropClick}
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full max-w-md bg-white rounded-[32px] shadow-premium border border-border-subtle p-8 overflow-hidden"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${variant === 'danger' ? 'bg-danger/10' : 'bg-brand-100'}`}>
                  {icons[variant] || icons.primary}
                </div>
                <h3 className="text-xl font-black text-brand-900 m-0 uppercase tracking-tight">{title}</h3>
              </div>
              <button 
                className="p-2 text-text-400 hover:text-brand-900 transition-colors bg-transparent border-none cursor-pointer"
                onClick={onCancel}
              >
                <X size={20} />
              </button>
            </div>

            <p className="text-sm text-text-500 font-medium leading-relaxed mb-8 m-0">
              {message}
            </p>

            <div className="flex gap-4">
              <button 
                className="btn btn-secondary flex-grow py-3 rounded-2xl font-bold"
                onClick={onCancel}
              >
                {cancelText}
              </button>
              <button 
                className={`btn flex-grow py-3 rounded-2xl font-bold text-white shadow-lg border-none cursor-pointer ${
                  variant === 'danger' ? 'bg-danger hover:bg-danger/90' : 'bg-brand-800 hover:bg-brand-900'
                }`}
                onClick={onConfirm}
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default ConfirmDialog;
