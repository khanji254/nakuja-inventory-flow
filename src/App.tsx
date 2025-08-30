import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { SupabaseLoginForm } from "./components/auth/SupabaseLoginForm";
import { SupabaseRegisterForm } from "./components/auth/SupabaseRegisterForm";
import { AuthProvider, useAuth } from "./components/auth/AuthProvider";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import PurchaseRequests from "./pages/PurchaseRequestsEnhanced";
import BOM from "./pages/BOM";
import Vendors from "./pages/Vendors";
import EisenhowerMatrix from "./pages/EisenhowerMatrix";
import Profile from "./pages/Profile";
import Notifications from "./pages/Notifications";
import Users from "./pages/Users";
import TeamManagement from "./pages/TeamManagement";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

function AppContent() {
  const [showRegister, setShowRegister] = useState(false);
  const { user, loading, signOut } = useAuth();

  const handleSwitchToRegister = () => {
    setShowRegister(true);
  };

  const handleSwitchToLogin = () => {
    setShowRegister(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    if (showRegister) {
      return (
        <SupabaseRegisterForm
          onSwitchToLogin={handleSwitchToLogin}
        />
      );
    } else {
      return (
        <SupabaseLoginForm
          onSwitchToRegister={handleSwitchToRegister}
        />
      );
    }
  }

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppLayout onLogout={signOut} />}>
            <Route index element={<Dashboard />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="purchase-requests" element={<PurchaseRequests />} />
            <Route path="bom" element={<BOM />} />
            <Route path="vendors" element={<Vendors />} />
            <Route path="eisenhower" element={<EisenhowerMatrix />} />
            <Route path="profile" element={<Profile />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="users" element={<Users />} />
            <Route path="team-management" element={<TeamManagement />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
