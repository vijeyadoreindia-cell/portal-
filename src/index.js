import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Hide the HTML loading screen once React has rendered
// requestAnimationFrame ensures the first paint has happened
requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    if (typeof window.__hideLoader === "function") {
      window.__hideLoader();
    }
  });
});
