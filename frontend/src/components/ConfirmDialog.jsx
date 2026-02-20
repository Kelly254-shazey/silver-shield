import { useCallback } from "react";
import "../styles/ConfirmDialog.css";

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

  const handleConfirm = useCallback(() => {
    onConfirm?.();
  }, [onConfirm]);

  if (!isOpen) {
    return null;
  }

  return (
    <>
      <div className="confirm-dialog-backdrop" onClick={handleBackdropClick} />
      <div className="confirm-dialog-container">
        <div className={`confirm-dialog glass-premium variant-${variant}`}>
          <div className="confirm-dialog-header">
            <h3>{title}</h3>
            <button className="confirm-dialog-close" onClick={onCancel} aria-label="Close dialog">
              x
            </button>
          </div>

          <p className="confirm-dialog-message">{message}</p>

          <div className="confirm-dialog-actions">
            <button className="btn btn-outline" onClick={onCancel}>
              {cancelText}
            </button>
            <button className={`btn btn-primary variant-${variant}`} onClick={handleConfirm}>
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default ConfirmDialog;
