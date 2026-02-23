import React from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from "react-router-dom";
import { AppProvider, useAppContext } from "./context/AppContext";
import { LandingView } from "./views/LandingView";
import { AuthView } from "./views/AuthView";
import { DashboardView } from "./views/DashboardView";
import { WorkspaceView } from "./views/WorkspaceView";
import { CommunityView } from "./views/CommunityView";
import { ProfileView } from "./views/ProfileView";
import { SettingsView } from "./views/SettingsView";
import { ProductivityView } from "./views/ProductivityView";
import AchievementsView from "./views/AchievementsView";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import { Toaster } from "sonner";

/**
 * ProtectedLayout wrapper to enforce authentication.
 */
function ProtectedLayout() {
  const { user, loading } = useAppContext();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#020617]">
        <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}

/**
 * Main App Component with Routing
 */
function AppContent() {
  return (
    <div className="min-h-screen bg-[#020617] text-foreground selection:bg-blue-500/30 selection:text-white transition-colors duration-300 overflow-hidden font-sans">
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingView />} />
        <Route path="/login" element={<AuthView />} />
        <Route path="/signup" element={<AuthView />} />

        {/* Protected Routes */}
        <Route element={<ProtectedLayout />}>
          <Route path="/workspace" element={
            <DashboardLayout>
              <DashboardView />
            </DashboardLayout>
          } />
          {/* Legacy redirect */}
          <Route path="/dashboard" element={<Navigate to="/workspace" replace />} />

          <Route path="/team/:teamId" element={<WorkspaceView />} />

          <Route path="/community" element={
            <DashboardLayout>
              <CommunityView />
            </DashboardLayout>
          } />

          <Route path="/profile" element={
            <DashboardLayout>
              <ProfileView />
            </DashboardLayout>
          } />

          <Route path="/u/:userId" element={
            <DashboardLayout>
              <ProfileView />
            </DashboardLayout>
          } />

          <Route path="/settings" element={
            <DashboardLayout>
              <SettingsView />
            </DashboardLayout>
          } />

          <Route path="/productivity" element={
            <DashboardLayout>
              <ProductivityView />
            </DashboardLayout>
          } />

          <Route path="/achievements" element={
            <DashboardLayout>
              <AchievementsView />
            </DashboardLayout>
          } />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <Toaster
        position="bottom-right"
        theme="dark"
        closeButton
        richColors
        toastOptions={{
          style: {
            borderRadius: '24px',
            border: '1px solid rgba(59,130,246,0.2)',
            background: 'rgba(15, 23, 42, 0.95)',
            backdropFilter: 'blur(10px)',
            color: '#fff',
            fontFamily: 'inherit',
            fontWeight: '900',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            fontSize: '10px'
          }
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AppProvider>
  );
}
