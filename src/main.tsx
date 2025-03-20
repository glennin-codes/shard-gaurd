import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import "./index.css";
import App from "./App.tsx";

// Add console error reporting to help debug issues
console.log("App starting...");

// Error handling for missing root element
const rootElement = document.getElementById("root");
if (!rootElement) {
  console.error("Failed to find root element");
  throw new Error("Failed to find root element");
}

try {
  console.log("Rendering app...");
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
  console.log("App rendered");
} catch (error) {
  console.error("Failed to render app:", error);
  rootElement.innerHTML = `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; text-align: center; padding: 20px;">
      <h2 style="margin-bottom: 16px; color: #e11d48;">App Failed to Load</h2>
      <p style="margin-bottom: 8px; color: #334155;">An error occurred while loading the application.</p>
      <pre style="background: #f1f5f9; padding: 12px; border-radius: 4px; max-width: 100%; overflow: auto;">${error instanceof Error ? error.message : String(error)}</pre>
    </div>
  `;
}
