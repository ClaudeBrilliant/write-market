import { TooltipProvider } from "@radix-ui/react-tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageTasks from "./pages/admin/ManageTasks";
import ManageUsers from "./pages/admin/ManageUsers";
import BidHistory from "./pages/dashboard/BidHistory";
import Earnings from "./pages/dashboard/Earnings";
import TasksList from "./pages/dashboard/TasksList";
import WriterDashboard from "./pages/dashboard/WriterDashboard";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Register from "./pages/Register";
import ResendVerification from "./pages/resendVerification";
import VerifyEmail from "./pages/VerifyEmail";
import Landing from "./pages/Landing";

const queryClient = new QueryClient();


const App = () => (
  
  <BrowserRouter>
    <QueryClientProvider 
    
    client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />

          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/register" element={<Register />} />
            <Route path="/auth/verify-email" element={<VerifyEmail />} />
            <Route
              path="/auth/resend-verification"
              element={<ResendVerification />}
            />

            {/* Writer Dashboard */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <WriterDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/tasks"
              element={
                <ProtectedRoute>
                  <TasksList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/bids"
              element={
                <ProtectedRoute>
                  <BidHistory />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/earnings"
              element={
                <ProtectedRoute>
                  <Earnings />
                </ProtectedRoute>
              }
            />

            {/* Admin Dashboard */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute adminOnly>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/tasks"
              element={
                <ProtectedRoute adminOnly>
                  <ManageTasks />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute adminOnly>
                  <ManageUsers />
                </ProtectedRoute>
              }
            />

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>

        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </BrowserRouter>
);

export default App;
