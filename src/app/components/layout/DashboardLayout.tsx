import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useAppContext, Notification } from "../../context/AppContext";
import { RoleSelector } from "../RoleSelector";
import { MobileNav } from "./MobileNav";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { Badge } from "../ui/card";
import {
  LayoutDashboard,
  Users,
  Settings,
  Search,
  Bell,
  Download,
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
  Clock,
  Trophy
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button, cn } from "../ui/button";
import { toast } from "sonner";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const {
    theme,
    toggleTheme,
    user,
    logout,
    setActiveTeamId,
    notifications,
    markAsRead,
    markAllNotificationsAsRead,
    globalOnlineUsers,
    updateProfile
  } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstallPrompt(null);
    }
  };
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showPresence, setShowPresence] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const navItems = [
    { id: "workspace", label: "Global Workspace", icon: LayoutDashboard, path: "/workspace" },
    { id: "productivity", label: "Productivity", icon: Target, path: "/productivity" },
    { id: "community", label: "Explore", icon: GlobeIcon, path: "/community" },
    { id: "achievements", label: "Achievements", icon: Trophy, path: "/achievements" },
    { id: "profile", label: "Profile", icon: UserIcon, path: "/profile" },
    { id: "settings", label: "Settings", icon: Settings, path: "/settings" },
  ];

  return (
    <div className="flex h-screen bg-background overflow-hidden relative font-sans">
      {/* Sidebar */}
      <aside
        className={cn(
          "bg-card border-r border-border h-full z-50 hidden md:flex flex-col shrink-0 transition-all duration-300",
          isSidebarOpen ? "w-[280px]" : "w-[80px] items-center"
        )}
      >
        <div className="p-6 flex items-center justify-between mb-8">
          <div className={cn("flex items-center gap-3 overflow-hidden whitespace-nowrap", !isSidebarOpen && "hidden")}>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0">
              <img src="/assets/logo.png" className="w-8 h-8 object-contain" alt="HackMate" />
            </div>
            <span className="text-lg font-black tracking-tight uppercase">HackMate</span>
          </div>
          {!isSidebarOpen && (
            <div className="w-12 h-12 rounded-xl flex items-center justify-center cursor-pointer" onClick={() => navigate("/workspace")}>
              <img src="/assets/logo.png" className="w-10 h-10 object-contain" alt="HackMate" />
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
          {installPrompt && (
            <button
              onClick={handleInstall}
              className={cn(
                "flex items-center w-full gap-4 p-3 rounded-2xl bg-hack-blue/10 text-hack-blue border border-hack-blue/20 hover:bg-hack-blue/20 transition-all group",
                !isSidebarOpen && "justify-center"
              )}
            >
              <Download className="w-5 h-5 shrink-0 group-hover:bounce" />
              <span className={cn("text-[10px] font-black uppercase tracking-widest text-left", !isSidebarOpen && "hidden")}>
                Download App
              </span>
            </button>
          )}

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
        <header className="h-20 border-b border-border bg-card/40 backdrop-blur-xl flex items-center justify-between px-4 md:px-8 z-30 shrink-0">
          <div className="flex items-center gap-4 md:gap-6 flex-1 max-w-2xl">
            {/* Mobile Actions Overlay Trigger */}
            <div className="flex items-center gap-3 md:hidden">
              <button
                onClick={() => setIsMobileDrawerOpen(true)}
                className="w-10 h-10 flex items-center justify-center bg-secondary/50 rounded-xl border border-border/50 text-foreground"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2" onClick={() => navigate("/workspace")}>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0">
                  <img src="/assets/logo.png" className="w-7 h-7 object-contain" alt="HackMate" />
                </div>
                <span className="text-sm font-black tracking-tighter uppercase">HM</span>
              </div>
            </div>

            <div className="relative w-full group hidden sm:block">
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
            <div className="hidden lg:flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Neural Link Stable</span>
            </div>

            {/* Tactical Specialization (Primary Role) Selector */}
            <RoleSelector
              value={user?.role || ""}
              onChange={(role) => {
                updateProfile({ role });
                toast.success(`Specialization updated: ${role}`);
              }}
              variant="minimal"
            />

            {/* Mobile Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="md:hidden w-11 h-11 flex items-center justify-center rounded-2xl hover:bg-secondary border border-border/50 shadow-sm transition-all active:scale-95"
            >
              {theme === "light" ? <Moon className="w-5 h-5 text-muted-foreground" /> : <Sun className="w-5 h-5 text-muted-foreground" />}
            </button>

            {/* Notification Trigger & Panel */}
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
                      className="absolute -right-4 md:right-0 mt-4 w-[calc(100vw-32px)] md:w-[380px] max-w-[380px] bg-card border border-border shadow-2xl rounded-[32px] z-50 overflow-hidden"
                    >
                      <div className="p-6 border-b border-border flex items-center justify-between bg-secondary/20">
                        <div className="flex items-center gap-3">
                          <h3 className="text-xs font-black uppercase tracking-[0.2em]">Intel Center</h3>
                          <Badge className="bg-hack-blue/10 text-hack-blue border-none text-[8px] px-2">{unreadCount} New</Badge>
                        </div>
                        <button
                          onClick={markAllNotificationsAsRead}
                          className="text-[10px] font-black text-hack-blue uppercase hover:underline"
                        >
                          Mark all read
                        </button>
                      </div>

                      <div className="max-h-[450px] overflow-y-auto custom-scrollbar p-2">
                        {notifications.length > 0 ? (
                          notifications.map((n: Notification) => (
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

            <div className="hidden md:block h-8 w-px bg-border/50" />
            <div className="hidden md:flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-black tracking-tight leading-none uppercase">{user?.name || "Alex Hacker"}</p>
                <p className="text-[9px] text-hack-blue font-black uppercase tracking-[0.2em] mt-1 opacity-70">
                  {user?.role ? user.role : `Lvl ${user?.level || 1} ${user?.rank || "Operative"}`}
                </p>
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
          "flex-1 overflow-hidden h-full p-4 md:p-8 custom-scrollbar overflow-y-auto pb-24 md:pb-8"
        )}>
          {children}
        </div>
      </main>

      <MobileNav />

      {/* Global Presence Sidebar (Right) */}
      <AnimatePresence>
        {showPresence && (
          <motion.aside
            initial={{ x: 350 }}
            animate={{ x: 0 }}
            exit={{ x: 350 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-[350px] bg-card border-l border-border z-[100] shadow-2xl flex flex-col"
          >
            <div className="p-8 border-b border-border flex items-center justify-between bg-secondary/10">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)] animate-pulse" />
                  <span className="text-[10px] font-black text-green-500 uppercase tracking-[0.2em]">Neural Network Active</span>
                </div>
                <h3 className="text-xl font-black text-foreground uppercase tracking-tighter">Who's Online</h3>
              </div>
              <button onClick={() => setShowPresence(false)} className="p-3 rounded-2xl hover:bg-secondary transition-all">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
              {globalOnlineUsers?.length > 0 ? (
                globalOnlineUsers.map((onlineUser: any) => (
                  <div
                    key={onlineUser.id}
                    className="flex items-center gap-4 p-4 rounded-2xl hover:bg-secondary/50 border border-transparent hover:border-border/50 transition-all group"
                  >
                    <div className="relative">
                      <Avatar className="h-12 w-12 rounded-xl border border-border shadow-md transition-transform group-hover:scale-105">
                        <AvatarImage src={onlineUser.avatar} />
                        <AvatarFallback className="bg-hack-blue/10 text-hack-blue text-[10px] font-black">
                          {onlineUser.name?.[0]?.toUpperCase() || 'OP'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-card rounded-full shadow-[0_0_10px_rgba(34,197,94,0.4)]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-xs font-black uppercase text-foreground leading-none truncate">{onlineUser.name}</span>
                        <span className="text-[8px] font-black text-muted-foreground uppercase bg-secondary/50 px-1.5 py-0.5 rounded-md">
                          Lvl {onlineUser.level || 1}
                        </span>
                      </div>
                      <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider truncate opacity-60">
                        {onlineUser.role || onlineUser.rank || "Operative"}
                      </p>
                    </div>
                    <button
                      onClick={() => navigate(`/profile/${onlineUser.id}`)}
                      className="p-2.5 rounded-xl bg-hack-blue/5 text-hack-blue opacity-0 group-hover:opacity-100 transition-all hover:bg-hack-blue hover:text-white"
                    >
                      <Search className="w-4 h-4" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="py-20 flex flex-col items-center justify-center opacity-20 text-center px-8">
                  <div className="w-16 h-16 rounded-full border border-dashed border-border/50 flex items-center justify-center mb-4">
                    <Users className="w-8 h-8" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest">Scanning for signals... No other pulses detected.</p>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-border bg-secondary/5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Global Status</span>
                <Badge className="bg-green-500/10 text-green-500 border-none text-[8px] px-2 uppercase font-black tracking-widest">
                  {globalOnlineUsers?.length || 0} Operatives Active
                </Badge>
              </div>
              <p className="text-[9px] text-muted-foreground leading-relaxed font-bold uppercase tracking-tight italic opacity-40">
                Data stream encrypted via Tactical Neural Link v2.0. Presence tracking respects all stealth protocols.
              </p>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
      {/* Mobile Drawer (Slide-out Side Nav) */}
      <AnimatePresence>
        {isMobileDrawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileDrawerOpen(false)}
              className="fixed inset-0 bg-background/80 backdrop-blur-md z-[100] md:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-[85%] max-w-[320px] bg-card border-r border-border z-[101] md:hidden flex flex-col"
            >
              <div className="p-8 border-b border-border flex items-center justify-between bg-secondary/10">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center">
                    <img src="/assets/logo.png" className="w-12 h-12 object-contain" alt="HackMate" />
                  </div>
                  <span className="text-xl font-black tracking-tight uppercase">HackMate</span>
                </div>
                <button
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="p-3 rounded-2xl hover:bg-secondary transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-2">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] mb-4 ml-2">Navigation</p>
                {navItems.map((item) => {
                  const isActive = location.pathname === item.path || (item.path !== "/workspace" && location.pathname.startsWith(item.path));
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        navigate(item.path);
                        setIsMobileDrawerOpen(false);
                      }}
                      className={cn(
                        "flex items-center w-full gap-4 p-4 rounded-2xl transition-all group relative overflow-hidden",
                        isActive
                          ? "bg-hack-blue text-white shadow-lg shadow-hack-blue/20"
                          : "text-muted-foreground hover:bg-secondary"
                      )}
                    >
                      <item.icon className="w-5 h-5 shrink-0" />
                      <span className="text-xs uppercase font-black tracking-widest">{item.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="p-6 border-t border-border bg-secondary/5 space-y-4">
                {installPrompt && (
                  <button
                    onClick={() => {
                      handleInstall();
                      setIsMobileDrawerOpen(false);
                    }}
                    className="w-full flex items-center justify-center gap-3 p-4 rounded-2xl bg-hack-blue text-white shadow-lg shadow-hack-blue/20 font-black uppercase text-[10px] tracking-widest"
                  >
                    <Download className="w-5 h-5" />
                    Install App
                  </button>
                )}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-muted/20 border border-border/30">
                  <div className="flex items-center gap-3 w-full">
                    <Avatar className="h-10 w-10 rounded-xl border-2 border-background shadow-lg ring-2 ring-hack-blue/10">
                      <AvatarImage src={user?.avatar} />
                      <AvatarFallback className="bg-hack-blue text-white font-black text-[10px]">A</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-black uppercase tracking-tight truncate">{user?.name || "Operative"}</p>
                      <p className="text-[8px] text-hack-blue font-black uppercase tracking-[0.2em] opacity-60">Access: Lvl {user?.level || 1}</p>
                    </div>
                    <button
                      onClick={logout}
                      className="w-10 h-10 ml-auto flex items-center justify-center rounded-xl bg-destructive/10 text-destructive hover:bg-destructive text-white transition-all shadow-sm"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
