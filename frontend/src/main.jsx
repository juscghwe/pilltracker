import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";

import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

import "./styles/base.css";
import "./styles/layout.css";
import "./styles/material-symbols.css";

import AppRoutes from "./AppRoutes.jsx";

const rootElement = document.getElementById("root");

if (rootElement === null) {
  throw new Error("Root element #root not found.");
}

createRoot(rootElement).render(
  <StrictMode>
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  </StrictMode>,
);
