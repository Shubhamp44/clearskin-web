import React from "react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { Toaster } from "react-hot-toast";


createRoot(document.getElementById("root")).render(
  <StrictMode>
     <ThemeProvider>
    <BrowserRouter>
     <App/>
      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: "12px",
            background: "#1f3d2b",
            color: "#fff",
            padding: "12px 16px",
          },
        }}
      />
    </BrowserRouter>
    </ThemeProvider>
  </StrictMode>
);