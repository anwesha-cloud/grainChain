import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Index from "./pages/Index";
import TestMapPage from "./pages/TestMap";
// inside <Routes> …
<Route path="/test-map" element={<TestMapPage />} />;

import NotFound from "./pages/NotFound";
import DonorDashboard from "./pages/DonorDashboard";
import NGODashboard from "./pages/NGODashboard";
import { Login } from "./components/auth/Login"; // 👈 import your Login page
import { SignUp } from "./components/auth/SignUp"; // 👈 import your SignUp page

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route
            path="/login"
            element={<Login onBack={() => window.history.back()} />}
          />
          <Route
            path="/signup"
            element={<SignUp onBack={() => window.history.back()} />}
          />
          <Route path="/donor-dashboard" element={<DonorDashboard />} />
          <Route path="/ngo-dashboard" element={<NGODashboard />} />
          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
