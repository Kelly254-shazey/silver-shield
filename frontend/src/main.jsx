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
import "./styles/HomePage.css";
import "./styles/ConfirmDialog.css";
import "./styles/AssistantWidget.css";
import "./styles/AdminPanel.css";
import "./styles/LogoBrand.css";
import "./styles/DocumentHeader.css";
import "./styles/DonationReceipt.css";

const getRouterBasename = () => {
  const scriptPath = new URL(import.meta.url, window.location.origin).pathname;
  if (!scriptPath.includes("/assets/")) {
    return "/";
  }

  const basePath = scriptPath.split("/assets/")[0].replace(/\/+$/, "");
  return basePath || "/";
};

const routerBasename = getRouterBasename();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter basename={routerBasename}>
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
