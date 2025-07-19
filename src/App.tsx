import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import PurchaseRequests from "./pages/PurchaseRequests";
import BOM from "./pages/BOM";
import Vendors from "./pages/Vendors";
import EisenhowerMatrix from "./pages/EisenhowerMatrix";
import Profile from "./pages/Profile";
import Notifications from "./pages/Notifications";
import Users from "./pages/Users";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import { syncService } from "./lib/sync-service";

const queryClient = new QueryClient();

// Initialize automatic synchronization
SyncService.initializeAutoSync();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="purchase-requests" element={<PurchaseRequests />} />
            <Route path="bom" element={<BOM />} />
            <Route path="vendors" element={<Vendors />} />
            <Route path="eisenhower" element={<EisenhowerMatrix />} />
            <Route path="profile" element={<Profile />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="users" element={<Users />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
