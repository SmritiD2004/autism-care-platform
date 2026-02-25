// src/main.jsx
import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import AppRouter from "./router";
import "./styles/design-system.css";

const queryClient = new QueryClient();
const root = document.getElementById("root");

createRoot(root).render(
  <React.StrictMode>
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          {/* 👇 Add the future flags here */}
          <BrowserRouter
            future={{
              v7_startTransition: true,      // wraps state updates in startTransition
              v7_relativeSplatPath: true,   // uses the new splat‑relative algorithm
            }}
          >
            <AppRouter />
          </BrowserRouter>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </React.StrictMode>
);
