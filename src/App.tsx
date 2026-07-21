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
import Footer from "./components/Footer";
import Layout from "./components/Layout";
import { ProductComparisonProvider } from "./contexts/ProductComparisonContext";
import CommunityHub from "./components/CommunityHub";
import About from "./pages/About";
import Contact from "./pages/Contact";
import PrivacyPolicy from "./pages/PrivacyPolicy";

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
                      {/* These all render Index too - it switches content based on the tab prop
                          Layout derives from the path. Real routes (instead of routing everything
                          through "/" with in-memory-only state) so a refresh doesn't bounce the
                          user back to the home hero - see Layout.tsx's pathToTabId. */}
                      <Route path="/scanner" element={<Layout><Index /></Layout>} />
                      <Route path="/chatbot" element={<Layout><Index /></Layout>} />
                      <Route path="/carbon-tracker" element={<Layout><Index /></Layout>} />
                      <Route path="/ai-recommendations" element={<Layout><Index /></Layout>} />
                      <Route path="/marketplace" element={<Layout><Index /></Layout>} />
                      <Route path="/education" element={<Layout><Index /></Layout>} />
                      <Route path="/lifestyle" element={<Layout><Index /></Layout>} />
                      <Route path="/profile" element={<Layout><Index /></Layout>} />
                      <Route path="/notifications" element={<Layout><Index /></Layout>} />
                      <Route path="/checkout" element={<Layout><Index /></Layout>} />
                      <Route path="/cart" element={<Layout><Cart setActiveTab={function (tab: string): void {
                        throw new Error("Function not implemented.");
                      } } /></Layout>} />
                      <Route path="/goals" element={<Layout><Goals /></Layout>} />
                      <Route path="/product-lifecycle" element={<Layout><ProductLifecycle /></Layout>} />
                      <Route path="/community" element={<Layout><CommunityHub /></Layout>} />
                      <Route path="/about" element={<Layout><About /></Layout>} />
                      <Route path="/contact" element={<Layout><Contact /></Layout>} />
                      <Route path="/privacy-policy" element={<Layout><PrivacyPolicy /></Layout>} />
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
