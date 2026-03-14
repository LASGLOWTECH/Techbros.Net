import { Toaster } from "@/components/ui/toaster";
import EditProfile from "@/pages/freelancer/EditProfile";
import ClientSettings from "@/pages/client/Settings";
import CompanyProfile from "@/pages/client/CompanyProfile";
import ClientJobs from "@/pages/client/Jobs";
import JobForm from "@/pages/client/JobForm";
import Jobs from "@/pages/Jobs";
import JobDetails from "@/pages/JobDetails";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Landing from "./pages/Landing";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import ResetPassword from "./pages/auth/ResetPassword";
import Explore from "./pages/Explore";
import TalentProfile from "./pages/TalentProfile";
import FreelancerDashboard from "./pages/freelancer/Dashboard";
import ClientDashboard from "./pages/client/Dashboard";
import AdminDashboard from "./pages/admin/Dashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/jobs/:jobId" element={<JobDetails />} />
            <Route path="/talent/:userId" element={<TalentProfile />} />
            <Route path="/freelancer" element={<FreelancerDashboard />} />
            <Route path="/freelancer/dashboard" element={<FreelancerDashboard />} />
            <Route path="/freelancer/profile" element={<EditProfile />} />
            <Route path="/freelancer/settings" element={<ClientSettings />} />
            <Route path="/client" element={<ClientDashboard />} />
            <Route path="/client/dashboard" element={<ClientDashboard />} />
            <Route path="/client/settings" element={<ClientSettings />} />
            <Route path="/client/company" element={<CompanyProfile />} />
            <Route path="/client/jobs" element={<ClientJobs />} />
            <Route path="/client/jobs/new" element={<JobForm />} />
            <Route path="/client/jobs/:jobId/edit" element={<JobForm />} />
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/jobs/new" element={<JobForm />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
