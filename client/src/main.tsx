
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Add global error handling
window.addEventListener('error', (event) => {
  console.error('Global error caught:', {
    error: event.error,
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    stack: event.error?.stack
  });
  // Prevent the error from being logged multiple times
  event.preventDefault();
});

// Add unhandled promise rejection handling
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', {
    reason: event.reason,
    promise: event.promise,
    stack: event.reason?.stack
  });
  // Prevent the error from being logged to console again
  event.preventDefault();
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
