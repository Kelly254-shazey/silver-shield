import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import { DialogProvider } from "./context/DialogContext";
import "./index.css";
import "./App.css";
import "./styles/component-showcase.css";
import "./styles/ConfirmDialog.css";
import "./styles/AssistantWidget.css";
import "./styles/AdminPanel.css";
import "./styles/LogoBrand.css";
import "./styles/DocumentHeader.css";
import "./styles/DonationReceipt.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <DialogProvider>
            <App />
          </DialogProvider>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
