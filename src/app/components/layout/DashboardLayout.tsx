import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useAppContext, Notification } from "../../context/AppContext";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { Badge } from "../ui/card";
import {
  LayoutDashboard,
  Users,
  Settings,
  Search,
  Bell,
  Menu,
  LogOut,
  Moon,
  Sun,
  Zap,
  Globe as GlobeIcon,
  User as UserIcon,
  Target,
  ArrowLeft,
  X,
  CheckCircle2,
  Info,
  AlertTriangle,
  Flame,
  Clock
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button, cn } from "../ui/button";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { theme, toggleTheme, user, logout, setActiveTeamId, notifications, markAsRead } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const navItems = [
    { id: "workspace", label: "Global Workspace", icon: LayoutDashboard, path: "/workspace" },
    { id: "productivity", label: "Productivity", icon: Target, path: "/productivity" },
    { id: "community", label: "Explore", icon: GlobeIcon, path: "/community" },
    { id: "profile", label: "Profile", icon: UserIcon, path: "/profile" },
    { id: "settings", label: "Settings", icon: Settings, path: "/settings" },
  ];

  return (
    <div className="flex h-screen bg-background overflow-hidden relative font-sans">
      {/* Sidebar */}
      <aside
        className={cn(
          "bg-card border-r border-border h-full z-50 flex flex-col shrink-0 transition-all duration-300",
          isSidebarOpen ? "w-[280px]" : "w-[80px] items-center"
        )}
      >
        <div className="p-6 flex items-center justify-between mb-8">
          <div className={cn("flex items-center gap-3 overflow-hidden whitespace-nowrap", !isSidebarOpen && "hidden")}>
            <div className="w-8 h-8 bg-hack-blue rounded-lg flex items-center justify-center shrink-0 shadow-lg shadow-hack-blue/20">
              <Zap className="text-white w-5 h-5 fill-white" />
            </div>
            <span className="text-lg font-black tracking-tight uppercase">HackMate</span>
          </div>
          {!isSidebarOpen && (
            <div className="w-10 h-10 bg-hack-blue rounded-xl flex items-center justify-center shadow-lg shadow-hack-blue/30 cursor-pointer" onClick={() => navigate("/workspace")}>
              <Zap className="text-white w-6 h-6 fill-white" />
            </div>
          )}
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-secondary rounded-lg lg:flex hidden">
            <Menu className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== "/workspace" && location.pathname.startsWith(item.path));
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={cn(
                  "flex items-center w-full gap-4 p-3.5 rounded-2xl transition-all group relative overflow-hidden",
                  isActive
                    ? "bg-hack-blue/10 text-hack-blue font-black"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                {isActive && (
                  <div className="absolute left-0 top-3 bottom-3 w-1.5 bg-hack-blue rounded-r-full shadow-[2px_0_10px_rgba(59,130,246,0.5)]" />
                )}
                <item.icon className={cn("w-5 h-5 shrink-0 transition-transform group-hover:scale-110", isActive && "text-hack-blue")} />
                <span className={cn("text-xs uppercase font-black tracking-widest transition-opacity duration-300", !isSidebarOpen && "lg:opacity-0 pointer-events-none")}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 space-y-4">
          <button
            onClick={toggleTheme}
            className={cn(
              "flex items-center w-full gap-4 p-3 rounded-2xl hover:bg-secondary text-muted-foreground transition-all",
              !isSidebarOpen && "justify-center"
            )}
          >
            {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            <span className={cn("text-[10px] font-black uppercase tracking-widest", !isSidebarOpen && "hidden")}>
              {theme === "light" ? "Night Mode" : "Day Mode"}
            </span>
          </button>

          <button
            onClick={logout}
            className={cn(
              "flex items-center w-full gap-4 p-3 rounded-2xl hover:bg-destructive/10 text-destructive transition-all",
              !isSidebarOpen && "justify-center"
            )}
          >
            <LogOut className="w-5 h-5" />
            <span className={cn("text-[10px] font-black uppercase tracking-widest", !isSidebarOpen && "hidden")}>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-background relative">
        {/* Global Header */}
        <header className="h-20 border-b border-border bg-card/40 backdrop-blur-xl flex items-center justify-between px-8 z-30 shrink-0">
          <div className="flex items-center gap-6 flex-1 max-w-2xl">
            <button className="lg:hidden p-2" onClick={() => setIsSidebarOpen(true)}>
              <Menu className="w-6 h-6" />
            </button>
            <div className="relative w-full group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-hack-blue transition-colors" />
              <input
                type="text"
                placeholder="Search intelligence, tasks, or squad files..."
                defaultValue={new URLSearchParams(location.search).get("q") || ""}
                onChange={(e) => {
                  const q = e.target.value;
                  const searchParams = new URLSearchParams(location.search);
                  if (q) {
                    searchParams.set("q", q);
                  } else {
                    searchParams.delete("q");
                  }
                  navigate(`${location.pathname}?${searchParams.toString()}`, { replace: true });
                }}
                className="w-full h-11 bg-secondary/30 rounded-2xl pl-11 pr-4 text-xs font-bold focus:outline-none focus:ring-4 focus:ring-hack-blue/5 transition-all border border-transparent focus:border-hack-blue/20"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Neural Link Stable</span>
            </div>

            {/* Notification Trigger */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className={cn(
                  "w-11 h-11 flex items-center justify-center rounded-2xl hover:bg-secondary relative transition-all active:scale-95 shadow-sm border border-border/50",
                  showNotifications && "bg-secondary ring-2 ring-hack-blue/20"
                )}
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-2.5 right-2.5 w-4 h-4 bg-destructive text-white text-[8px] font-black flex items-center justify-center rounded-full border-2 border-background ring-2 ring-destructive/20 animate-in zoom-in">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Panel */}
              <AnimatePresence>
                {showNotifications && (
                  <>
                    <motion.div
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="fixed inset-0 z-40 bg-black/5"
                      onClick={() => setShowNotifications(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-4 w-[380px] bg-card border border-border shadow-2xl rounded-[32px] z-50 overflow-hidden"
                    >
                      <div className="p-6 border-b border-border flex items-center justify-between bg-secondary/20">
                        <div className="flex items-center gap-3">
                          <h3 className="text-xs font-black uppercase tracking-[0.2em]">Intel Center</h3>
                          <Badge className="bg-hack-blue/10 text-hack-blue border-none text-[8px] px-2">{unreadCount} New</Badge>
                        </div>
                        <button className="text-[10px] font-black text-hack-blue uppercase hover:underline">Mark all read</button>
                      </div>

                      <div className="max-h-[450px] overflow-y-auto custom-scrollbar p-2">
                        {notifications.length > 0 ? (
                          notifications.map((n) => (
                            <div
                              key={n.id}
                              onClick={() => markAsRead(n.id)}
                              className={cn(
                                "p-4 rounded-2xl transition-all cursor-pointer group flex gap-4",
                                !n.read ? "bg-hack-blue/5 border border-hack-blue/10" : "hover:bg-secondary/50 border border-transparent"
                              )}
                            >
                              <div className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
                                n.type === 'success' ? 'bg-green-500/10 text-green-500' :
                                  n.type === 'warning' ? 'bg-orange-500/10 text-orange-500' :
                                    n.type === 'error' ? 'bg-destructive/10 text-destructive' : 'bg-hack-blue/10 text-hack-blue'
                              )}>
                                {n.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> :
                                  n.type === 'warning' ? <AlertTriangle className="w-5 h-5" /> :
                                    n.type === 'error' ? <X className="w-5 h-5" /> : <Info className="w-5 h-5" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start mb-1">
                                  <p className="text-[11px] font-black uppercase truncate leading-none">{n.title}</p>
                                  <span className="text-[8px] font-black text-muted-foreground uppercase opacity-50">{n.time}</span>
                                </div>
                                <p className="text-[10px] text-muted-foreground font-medium leading-relaxed uppercase tracking-wider line-clamp-2">{n.message}</p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="py-20 flex flex-col items-center justify-center opacity-20">
                            <Bell className="w-12 h-12 mb-4" />
                            <p className="text-[10px] font-black uppercase">No New Intel</p>
                          </div>
                        )}
                      </div>
                      <div className="p-4 bg-secondary/10 border-t border-border">
                        <Button variant="ghost" className="w-full text-[9px] font-black uppercase tracking-widest h-10 rounded-xl" onClick={() => setShowNotifications(false)}>Clear Signal Panel</Button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            <div className="h-8 w-px bg-border/50" />
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-black tracking-tight leading-none uppercase">{user?.name || "Alex Hacker"}</p>
                <p className="text-[9px] text-hack-blue font-black uppercase tracking-[0.2em] mt-1 opacity-70">Lvl 42 Architect</p>
              </div>
              <Avatar
                className="h-11 w-11 rounded-2xl border-2 border-background shadow-xl ring-2 ring-hack-blue/20 ring-offset-2 ring-offset-background transition-all hover:scale-105 cursor-pointer"
                onClick={() => navigate("/profile")}
              >
                <AvatarImage src={user?.avatar} />
                <AvatarFallback className="bg-hack-blue text-white font-black text-xs">AH</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* Content Container */}
        <div className={cn(
          "flex-1 overflow-hidden h-full p-8 custom-scrollbar overflow-y-auto"
        )}>
          {children}
        </div>
      </main>
    </div>
  );
}
