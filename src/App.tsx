import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { LoginForm } from "./components/auth/LoginForm";
import { RegisterForm } from "./components/auth/RegisterForm";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import PurchaseRequests from "./pages/PurchaseRequestsEnhanced";
import BOM from "./pages/BOM";
import Vendors from "./pages/Vendors";
import EisenhowerMatrix from "./pages/EisenhowerMatrix";
import Profile from "./pages/Profile";
import Notifications from "./pages/Notifications";
import Users from "./pages/Users";
import Settings from "./pages/Settings";
import TaskDemo from "./pages/TaskDemo";
import NotFound from "./pages/NotFound";
import { User } from "./lib/permissions";
import { AuthService } from "./lib/auth-service-mock";
import { taskScheduler } from "./lib/task-scheduler";
import { Toaster } from "./components/ui/toaster";

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

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [showRegister, setShowRegister] = useState(false);
  const [loading, setLoading] = useState(true);

  console.log('App state:', { isAuthenticated, showRegister }); // Debug log

  // Check for existing auth on app load
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('auth_token');
      const userData = localStorage.getItem('user');
      
      if (token && userData) {
        try {
          const isValid = await AuthService.validateToken(token);
          if (isValid) {
            const parsedUser = JSON.parse(userData);
            setUser(parsedUser);
            setIsAuthenticated(true);
          } else {
            // Token expired
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user');
          }
        } catch (error) {
          console.error('Token validation failed:', error);
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  // Initialize task scheduler when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('🚀 Initializing task scheduler for authenticated user...');
      taskScheduler.initialize().catch(console.error);
    }
  }, [isAuthenticated, user]);

  const handleLogin = (userData: User, token: string) => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('auth_token', token);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  };

  const handleSwitchToRegister = () => {
    console.log('Switching to register form'); // Debug log
    setShowRegister(true);
  };

  const handleSwitchToLogin = () => {
    console.log('Switching to login form'); // Debug log
    setShowRegister(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (showRegister) {
      console.log('Rendering RegisterForm'); // Debug log
      return (
        <RegisterForm
          onSuccess={handleLogin}
          onSwitchToLogin={handleSwitchToLogin}
        />
      );
    } else {
      console.log('Rendering LoginForm'); // Debug log
      return (
        <LoginForm
          onSuccess={handleLogin}
          onSwitchToRegister={handleSwitchToRegister}
        />
      );
    }
  }

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppLayout user={user} onLogout={handleLogout} />}>
            <Route index element={<Dashboard />} />
            <Route path="inventory" element={<Inventory user={user} />} />
            <Route path="purchase-requests" element={<PurchaseRequests user={user} />} />
            <Route path="bom" element={<BOM user={user} />} />
            <Route path="vendors" element={<Vendors />} />
            <Route path="eisenhower" element={<EisenhowerMatrix user={user} />} />
            <Route path="profile" element={<Profile />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="users" element={<Users user={user} />} />
            <Route path="settings" element={<Settings />} />
            <Route path="task-demo" element={<TaskDemo />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
