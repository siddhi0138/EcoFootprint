import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import { UserDataProvider } from "./contexts/UserDataContext";
import { NotificationProvider } from "./contexts/NotificationsContextNew";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Cart from "./components/Cart";
import Goals from "./pages/Goals";
import ProductLifecycle from "./components/ProductLifecycle";
import ProductComparison from "./components/ProductComparison";
import Footer from "./components/Footer";
import Layout from "./components/Layout";
import { ProductComparisonProvider } from "./contexts/ProductComparisonContext";
import CommunityHub from "./components/CommunityHub";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <UserDataProvider>
          <ProductComparisonProvider>
            <NotificationProvider>
              <CartProvider>

                <TooltipProvider>
                  <Toaster />
                  <Sonner />
                  <BrowserRouter>
                    <Routes>
                      <Route path="/" element={<Layout><Index /></Layout>} />
                      <Route path="/cart" element={<Layout><Cart setActiveTab={function (tab: string): void {
                        throw new Error("Function not implemented.");
                      } } /></Layout>} />
                      <Route path="/goals" element={<Layout><Goals /></Layout>} />
                      <Route path="/product-lifecycle" element={<Layout><ProductLifecycle /></Layout>} />
                      <Route path="/product-comparison" element={<Layout><ProductComparison /></Layout>} />
                      <Route path="/community" element={<Layout><CommunityHub /></Layout>} />
                      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </BrowserRouter>
                </TooltipProvider>
              </CartProvider>
            </NotificationProvider>
          </ProductComparisonProvider>
        </UserDataProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
