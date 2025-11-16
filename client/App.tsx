import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";

const Index = lazy(() => import("./pages/Index"));
const ChatApp = lazy(() => import("./pages/ChatApp"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const LoadingFallback = () => (
  <div className="w-screen h-screen flex items-center justify-center bg-slate-900 text-white">
    <div className="text-center">
      <div className="animate-spin inline-block mb-4">
        <svg className="w-8 h-8" viewBox="0 0 50 50">
          <circle cx="25" cy="25" r="20" stroke="currentColor" strokeWidth="5" fill="none" opacity="0.3" />
          <circle cx="25" cy="25" r="20" stroke="currentColor" strokeWidth="5" fill="none" strokeDasharray="100" strokeDashoffset="75" />
        </svg>
      </div>
      <p className="font-medium">Loading...</p>
    </div>
  </div>
);

// Lazy load the Chat route with its provider
const ChatRoute = lazy(async () => {
  const { SharedDataProvider } = await import("./context/SharedDataProvider");
  const ChatAppComponent = (await import("./pages/ChatApp")).default;

  const ChatAppWithProvider = () => (
    <SharedDataProvider>
      <ChatAppComponent />
    </SharedDataProvider>
  );

  return { default: ChatAppWithProvider };
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
              <Route path="/app" element={<ChatAppWithProvider />} />
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
  createRoot(root).render(<App />);
} else {
  console.error("Root element not found");
}
