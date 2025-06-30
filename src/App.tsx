import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import { UserDataProvider } from "./contexts/UserDataContext"; // Import UserDataProvider
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Goals from "./pages/Goals";
import ProductLifecycle from "./components/ProductLifecycle";
import ProductComparison from "./components/ProductComparison";
import Footer from "./components/Footer";
import Layout from "./components/Layout";
import { ProductComparisonProvider } from "./contexts/ProductComparisonContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <UserDataProvider> {/* Wrap with UserDataProvider */}
          <ProductComparisonProvider>
            <CartProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <Routes>
                    <Route path="/" element={<Layout><Index /></Layout>} />
                    <Route path="/goals" element={<Layout><Goals /></Layout>} />
                    <Route path="/product-lifecycle" element={<Layout><ProductLifecycle /></Layout>} />
                    <Route path="/product-comparison" element={<Layout><ProductComparison /></Layout>} />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} /> {/* NotFound can be outside the layout if you want a different layout for 404 */}
                  </Routes>
                </BrowserRouter>
              </TooltipProvider>
            </CartProvider>
          </ProductComparisonProvider>
        </UserDataProvider> {/* Close UserDataProvider */}
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
