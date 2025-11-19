import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";

const Index = lazy(() => import("./pages/Index"));
const InMemoryChatPage = lazy(() => import("./pages/InMemoryChat"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const LoadingFallback = () => (
  <div className="w-screen h-screen flex items-center justify-center bg-slate-900 text-white">
    <div className="text-center">
      <div className="animate-spin inline-block mb-4">
        <svg className="w-8 h-8" viewBox="0 0 50 50">
          <circle
            cx="25"
            cy="25"
            r="20"
            stroke="currentColor"
            strokeWidth="5"
            fill="none"
            opacity="0.3"
          />
          <circle
            cx="25"
            cy="25"
            r="20"
            stroke="currentColor"
            strokeWidth="5"
            fill="none"
            strokeDasharray="100"
            strokeDashoffset="75"
          />
        </svg>
      </div>
      <p className="font-medium">Loading...</p>
    </div>
  </div>
);

// Lazy load the In-Memory Chat route with in-memory provider
const InMemoryChatRoute = lazy(async () => {
  const { InMemoryDataProvider } = await import(
    "./context/InMemoryDataProvider"
  );
  const InMemoryChatComponent = (await import("./pages/InMemoryChat")).default;

  const InMemoryChatWithProvider = () => (
    <InMemoryDataProvider>
      <InMemoryChatComponent />
    </InMemoryDataProvider>
  );

  return { default: InMemoryChatWithProvider };
});

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/chat" element={<InMemoryChatRoute />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

const root = document.getElementById("root");
if (root) {
  // Check if a React root already exists on this element
  const existingRoot = (root as any)._reactRootContainer || (root as any)._reactRoot;

  if (existingRoot) {
    // Use existing root for HMR updates
    existingRoot.render(<App />);
  } else {
    // Create new root on first load
    createRoot(root).render(<App />);
  }
} else {
  console.error("Root element not found");
}
