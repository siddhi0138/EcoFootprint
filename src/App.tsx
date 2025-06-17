import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom"; // Assuming react-router-dom is used
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

import React, { useState } from 'react';

const queryClient = new QueryClient();

const App = () => {
  const [showLoginForm, setShowLoginForm] = useState(false);
  const toggleLoginForm = () => setShowLoginForm(!showLoginForm);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
          <Route path="/" element={<Index showLoginForm={showLoginForm} toggleLoginForm={toggleLoginForm} />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
