
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Add global error handling
window.addEventListener('error', (event) => {
  console.error('Global error caught:', event.error);
});

// Add unhandled promise rejection handling
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

console.log('Starting application...');

try {
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    console.error('Root element not found');
    document.body.innerHTML = '<div>Failed to load application. Root element not found.</div>';
  } else {
    console.log('Root element found, rendering app');
    createRoot(rootElement).render(<App />);
    console.log('App rendered successfully');
  }
} catch (error) {
  console.error('Error rendering application:', error);
  document.body.innerHTML = '<div>Failed to load application. See console for details.</div>';
}
