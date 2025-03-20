import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import "./index.css";
import App from "./App.tsx";
import eruda from "eruda";

// Add types for Eruda
declare global {
  interface Window {
    eruda?: {
      init: (options?: any) => void;
      _isInit?: boolean;
    };
    enableErudaDebugger?: () => void;
  }
}

// Add console error reporting to help debug issues
console.log("App starting...");
//enable eruda from eruda package
eruda.init();
console.log("Eruda initialized programmatically");


// Helper function to enable Eruda programmatically from code
const enableEruda = () => {
  if (typeof window !== "undefined" && window.eruda && !window.eruda._isInit) {
    window.eruda.init({
      tool: ["console", "elements", "network", "resources", "info"],
      useShadowDom: true,
      autoScale: true,
    });
    console.log("Eruda initialized programmatically");
  }
};

// You can call this function anywhere to force-enable Eruda for debugging
// Useful for debugging specific scenarios
window.enableErudaDebugger = enableEruda;

// Enable Eruda if debug=true or debug=1 is in the URL
if (
  typeof window !== "undefined" &&
  (window.location.search.includes("debug=true") || window.location.search.includes("debug=1"))
) {
  console.log("Debug mode enabled via URL parameter");
  enableEruda();
}

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
    </StrictMode>,
  );
  console.log("App rendered");
} catch (error) {
  console.error("Failed to render app:", error);
  rootElement.innerHTML = `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; text-align: center; padding: 20px;">
      <h2 style="margin-bottom: 16px; color: #e11d48;">App Failed to Load</h2>
      <p style="margin-bottom: 8px; color: #334155;">An error occurred while loading the application.</p>
      <pre style="background: #f1f5f9; padding: 12px; border-radius: 4px; max-width: 100%; overflow: auto;">${error instanceof Error ? error.message : String(error)}</pre>
      <button 
        onclick="window.enableErudaDebugger(); return false;"
        style="margin-top: 16px; background: #3b82f6; color: white; padding: 8px 16px; border-radius: 4px; border: none; cursor: pointer;"
      >
        Show Debugger
      </button>
    </div>
  `;

  // Auto-enable Eruda on errors
  enableEruda();
}
