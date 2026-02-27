import React from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";

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
import { CommandPalette } from "./components/CommandPalette";
import { HUDLayer } from "./components/HUDLayer";
import { cn } from "./components/ui/utils";

/**
 * ProtectedLayout wrapper to enforce authentication.
 */
function ProtectedLayout() {
  const { user, loading } = useAppContext();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
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
 * Component to wrap pages with transitions
 */
const PageWrapper = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.2, ease: "easeOut" }}
    className="h-full w-full"
  >
    {children}
  </motion.div>
);

/**
 * Main App Component with Routing
 */
function AppContent() {
  const { theme } = useAppContext();
  const location = useLocation();

  return (
    <div className={cn(
      "min-h-screen bg-background text-foreground selection:bg-blue-500/30 selection:text-foreground transition-colors duration-300 font-sans",
      theme
    )}>
      <CommandPalette />
      <HUDLayer />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* Public Routes */}
          <Route path="/" element={<PageWrapper><LandingView /></PageWrapper>} />
          <Route path="/login" element={<PageWrapper><AuthView /></PageWrapper>} />
          <Route path="/signup" element={<PageWrapper><AuthView /></PageWrapper>} />

          {/* Protected Routes */}
          <Route element={<ProtectedLayout />}>
            <Route path="/workspace" element={
              <DashboardLayout>
                <PageWrapper><DashboardView /></PageWrapper>
              </DashboardLayout>
            } />
            {/* Legacy redirect */}
            <Route path="/dashboard" element={<Navigate to="/workspace" replace />} />

            <Route path="/team/:teamId" element={<PageWrapper><WorkspaceView /></PageWrapper>} />

            <Route path="/community" element={
              <DashboardLayout>
                <PageWrapper><CommunityView /></PageWrapper>
              </DashboardLayout>
            } />

            <Route path="/profile" element={
              <DashboardLayout>
                <PageWrapper><ProfileView /></PageWrapper>
              </DashboardLayout>
            } />

            <Route path="/u/:userId" element={
              <DashboardLayout>
                <PageWrapper><ProfileView /></PageWrapper>
              </DashboardLayout>
            } />

            <Route path="/settings" element={
              <DashboardLayout>
                <PageWrapper><SettingsView /></PageWrapper>
              </DashboardLayout>
            } />

            <Route path="/productivity" element={
              <DashboardLayout>
                <PageWrapper><ProductivityView /></PageWrapper>
              </DashboardLayout>
            } />

            <Route path="/achievements" element={
              <DashboardLayout>
                <PageWrapper><AchievementsView /></PageWrapper>
              </DashboardLayout>
            } />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>

      <Toaster
        position="bottom-right"
        theme={theme as "light" | "dark"}
        closeButton
        richColors
        toastOptions={{
          style: {
            borderRadius: '24px',
            border: '1px solid rgba(59,130,246,0.2)',
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
