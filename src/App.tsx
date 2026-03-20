import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Chemicals from "./pages/Chemicals";
import Inspections from "./pages/Inspections";
import NewInspection from "./pages/NewInspection";
import InspectionDetail from "./pages/InspectionDetail";
// DISABLED: NH3 Module - Work in Progress
// import NH3Module from "./pages/NH3Module";
// import DispersionCalculator from "./pages/nh3/DispersionCalculator";
// import LopaEstimator from "./pages/nh3/LopaEstimator";
// import NH3Checklists from "./pages/nh3/NH3Checklists";
// import IncidentTracker from "./pages/nh3/IncidentTracker";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/chemicals"
              element={
                <ProtectedRoute>
                  <Chemicals />
                </ProtectedRoute>
              }
            />
            <Route
              path="/inspections"
              element={
                <ProtectedRoute>
                  <Inspections />
                </ProtectedRoute>
              }
            />
            <Route
              path="/inspection/new"
              element={
                <ProtectedRoute>
                  <NewInspection />
                </ProtectedRoute>
              }
            />
            <Route
              path="/inspection/:id"
              element={
                <ProtectedRoute>
                  <InspectionDetail />
                </ProtectedRoute>
              }
            />
            {/* DISABLED: NH3 routes - Work in Progress
            <Route
              path="/nh3"
              element={
                <ProtectedRoute>
                  <NH3Module />
                </ProtectedRoute>
              }
            />
            <Route
              path="/nh3/dispersion"
              element={
                <ProtectedRoute>
                  <DispersionCalculator />
                </ProtectedRoute>
              }
            />
            <Route
              path="/nh3/lopa"
              element={
                <ProtectedRoute>
                  <LopaEstimator />
                </ProtectedRoute>
              }
            />
            <Route
              path="/nh3/checklists"
              element={
                <ProtectedRoute>
                  <NH3Checklists />
                </ProtectedRoute>
              }
            />
            <Route
              path="/nh3/incidents"
              element={
                <ProtectedRoute>
                  <IncidentTracker />
                </ProtectedRoute>
              }
            />
            */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
