import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initPerformanceOptimizations } from "./utils/performanceOptimizations";

// Initialize performance optimizations
initPerformanceOptimizations();

createRoot(document.getElementById("root")!).render(<App />);
