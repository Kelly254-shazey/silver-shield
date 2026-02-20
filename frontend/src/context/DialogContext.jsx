import { createContext, useCallback, useContext, useMemo, useState } from "react";
import ConfirmDialog from "../components/ConfirmDialog";

const DialogContext = createContext(null);

export function DialogProvider({ children }) {
  const [dialogs, setDialogs] = useState([]);

  const showConfirm = useCallback((options) => {
    const id = Date.now();
    const {
      title = "Confirm",
      message = "",
      onConfirm,
      onCancel,
      confirmText = "Confirm",
      cancelText = "Cancel",
      variant = "primary",
    } = options;

    setDialogs((prev) => [
      ...prev,
      {
        id,
        title,
        message,
        onConfirm: () => {
          onConfirm?.();
          setDialogs((d) => d.filter((dialog) => dialog.id !== id));
        },
        onCancel: () => {
          onCancel?.();
          setDialogs((d) => d.filter((dialog) => dialog.id !== id));
        },
        confirmText,
        cancelText,
        variant,
        isOpen: true,
      },
    ]);

    return id;
  }, []);

  const closeDialog = useCallback((id) => {
    setDialogs((prev) => prev.filter((dialog) => dialog.id !== id));
  }, []);

  const value = useMemo(
    () => ({
      showConfirm,
      closeDialog,
    }),
    [showConfirm, closeDialog]
  );

  return (
    <DialogContext.Provider value={value}>
      {children}
      {dialogs.map((dialog) => (
        <ConfirmDialog
          key={dialog.id}
          isOpen={dialog.isOpen}
          title={dialog.title}
          message={dialog.message}
          onConfirm={dialog.onConfirm}
          onCancel={dialog.onCancel}
          confirmText={dialog.confirmText}
          cancelText={dialog.cancelText}
          variant={dialog.variant}
        />
      ))}
    </DialogContext.Provider>
  );
}

export function useDialog() {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error("useDialog must be used inside DialogProvider");
  }
  return context;
}
