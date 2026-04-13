import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import { AuthProvider } from "./context/AuthContext";
import InstallPrompt from "./components/InstallPrompt";
import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter basename="/finance">
      <AuthProvider>
        <AppProvider>
          <App />
          <InstallPrompt />
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);