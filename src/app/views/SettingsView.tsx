import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useAppContext } from "../context/AppContext";
import {
   User,
   Lock,
   Bell,
   Shield,
   Palette,
   CreditCard,
   Key,
   Sun,
   Moon,
   Trash2,
   Github,
   CheckCircle2,
   Globe,
   Twitter,
   Activity,
   Mail,
   Laptop,
   Smartphone,
   ChevronDown,
   Search,
   Briefcase
} from "lucide-react";
import { cn } from "../components/ui/button";
import { toast } from "sonner";
import { Badge } from "../components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "../components/ui/avatar";
import { RoleSelector } from "../components/RoleSelector";


// ------------------------------------
// SETTINGS VIEW
// ------------------------------------
type Tab = "Account" | "Security" | "Notifications" | "Appearance" | "Billing" | "Developer";

export function SettingsView() {
   const { theme, toggleTheme, user, updateProfile, connectGitHub, disconnectGitHub, githubData } = useAppContext();
   const [activeTab, setActiveTab] = useState<Tab>("Account");

   useEffect(() => {
      const params = new URLSearchParams(window.location.search);
      if (params.get('status') === 'github_link_success') {
         toast.success("Security Uplink Established: GitHub identity confirmed.", {
            style: { background: '#059669', color: '#fff', border: '0' }
         });
         window.history.replaceState({}, document.title, "/settings");
      }
   }, []);

   return (
      <div className="max-w-5xl mx-auto space-y-6 md:space-y-8 pb-20 px-4 md:px-0 mt-4 md:mt-0">
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 md:mb-8 pb-4 border-b border-border/20 md:border-none">
            <div>
               <h1 className="text-2xl md:text-3xl font-black tracking-tighter uppercase text-foreground">Command <span className="text-hack-blue">Protocols</span></h1>
               <p className="text-[10px] md:text-sm font-bold text-muted-foreground mt-1 uppercase tracking-widest opacity-60">Neural identity & security configurations.</p>
            </div>
         </div>

         <div className="flex flex-col md:grid md:grid-cols-4 gap-6 md:gap-8">
            {/* Sidebar Navigation -> Horizontal Scroll on Mobile */}
            <div className="flex md:flex-col gap-2 overflow-x-auto no-scrollbar scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0 sticky top-0 md:static bg-background/50 backdrop-blur-md md:bg-transparent z-40 py-2 md:py-0">
               {[
                  { label: "Account", icon: User },
                  { label: "Security", icon: Shield },
                  { label: "Notifications", icon: Bell },
                  { label: "Appearance", icon: Palette },
                  { label: "Billing", icon: CreditCard },
                  { label: "Developer", icon: Key },
               ].map(item => (
                  <button
                     key={item.label}
                     onClick={() => setActiveTab(item.label as Tab)}
                     className={cn(
                        "flex items-center gap-3 p-3 md:p-4 rounded-xl md:rounded-2xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all duration-300 shrink-0 border border-transparent",
                        activeTab === item.label
                           ? "bg-hack-blue text-white shadow-lg shadow-hack-blue/30 border-hack-blue/20"
                           : "text-muted-foreground hover:bg-secondary/50"
                     )}
                  >
                     <item.icon className="w-3.5 h-3.5 md:w-4 md:h-4" />
                     {item.label}
                  </button>
               ))}
            </div>

            {/* Content Area */}
            <div className="flex-1 md:col-span-3 space-y-6 md:space-y-8">
               {activeTab === "Account" && <AccountTab />}
               {activeTab === "Security" && <SecurityTab />}
               {activeTab === "Notifications" && <NotificationsTab />}
               {activeTab === "Appearance" && <AppearanceTab />}
               {activeTab === "Billing" && <BillingTab />}
               {activeTab === "Developer" && <DeveloperTab />}
            </div>
         </div>
      </div>
   );
}

// ----------------------------------------------------
// TAB COMPONENTS
// ----------------------------------------------------

function AccountTab() {
   const { user, updateProfile, connectGitHub, connectGitHubManual, disconnectGitHub, githubData } = useAppContext();
   const [formData, setFormData] = useState({
      name: "", email: "", bio: "", twitter: "", website: ""
   });
   const [selectedRole, setSelectedRole] = useState("");
   const [skillsInput, setSkillsInput] = useState("");
   const [githubInput, setGithubInput] = useState("");
   const [loading, setLoading] = useState(false);
   const [ghLoading, setGhLoading] = useState(false);
   const [showManual, setShowManual] = useState(false);

   useEffect(() => {
      if (user) {
         setFormData({
            name: user.name || "",
            email: user.email || "",
            bio: user.bio || "",
            twitter: user.socials?.twitter || "",
            website: user.socials?.website || ""
         });
         setSkillsInput(user.skills?.join(", ") || "");
         setSelectedRole(user.role || "");
      }
   }, [user]);

   const handleSaveProfile = async () => {
      setLoading(true);
      try {
         await updateProfile({
            name: formData.name,
            bio: formData.bio,
            skills: skillsInput.split(",").map(s => s.trim()).filter(Boolean),
            socials: { ...user?.socials, twitter: formData.twitter, website: formData.website },
            ...(selectedRole ? { role: selectedRole } : {}),
         });
         toast.success("Profile saved instantly!");
      } catch (error) {
         toast.error("Failed to update profile.");
      } finally {
         setLoading(false);
      }
   };

   const handleConnectGithub = async () => {
      setGhLoading(true);
      const success = await connectGitHub();
      if (!success) {
         setShowManual(true);
      }
      setGhLoading(false);
   };

   const handleConnectManual = async () => {
      if (!githubInput) return toast.error("Please enter a username.");
      setGhLoading(true);
      await connectGitHubManual(githubInput);
      setGhLoading(false);
   };

   return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
         <Card className="border-border/50 shadow-md">
            <CardHeader>
               <CardTitle>Profile Information</CardTitle>
               <CardDescription>Update your public identity on HackMate.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 md:p-8 space-y-5 md:space-y-6">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="space-y-2">
                     <label className="text-xs font-bold uppercase text-muted-foreground">Full Name</label>
                     <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                     <label className="text-xs font-bold uppercase text-muted-foreground">Email Address</label>
                     <Input value={formData.email} disabled className="opacity-50 cursor-not-allowed bg-secondary/30" />
                  </div>
               </div>

               <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-muted-foreground">Bio</label>
                  <textarea
                     value={formData.bio}
                     onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                     className="w-full bg-background border border-input rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-hack-blue min-h-[100px] custom-scrollbar"
                     placeholder="Tell us about your developer journey..."
                  />
               </div>

               <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-muted-foreground">Skills (Comma separated)</label>
                  <Input
                     value={skillsInput}
                     onChange={(e) => setSkillsInput(e.target.value)}
                     placeholder="React, TypeScript, Node.js"
                  />
               </div>

               {/* ── PRIMARY ROLE PICKER ── */}
               <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-1.5">
                     <Briefcase className="w-3 h-3" /> Primary Role
                  </label>
                  <RoleSelector value={selectedRole} onChange={setSelectedRole} />
                  <p className="text-[10px] text-muted-foreground font-medium leading-relaxed">
                     Shown on your profile, in the global workspace sidebar, and across the platform in real-time.
                  </p>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                     <label className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-1"><Twitter className="w-3 h-3" /> Twitter</label>
                     <Input value={formData.twitter} onChange={(e) => setFormData({ ...formData, twitter: e.target.value })} placeholder="https://twitter.com/..." />
                  </div>
                  <div className="space-y-2">
                     <label className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-1"><Globe className="w-3 h-3" /> Website</label>
                     <Input value={formData.website} onChange={(e) => setFormData({ ...formData, website: e.target.value })} placeholder="https://..." />
                  </div>
               </div>

               <div className="pt-2">
                  <Button onClick={handleSaveProfile} disabled={loading} className="w-full md:w-auto shadow-lg shadow-hack-blue/20 bg-gradient-to-r from-hack-blue to-hack-purple text-white border-0">
                     {loading ? "Saving..." : "Save Profile Changes"}
                  </Button>
               </div>
            </CardContent>
         </Card>

         {/* GitHub Real Integration Card */}
         <Card className={cn("border transition-all duration-500 shadow-md", user?.github_username ? "border-green-500/50 bg-green-500/5" : "border-border/50")}>
            <CardHeader className="pb-4">
               <CardTitle className="flex items-center gap-2">
                  <Github className="w-5 h-5" /> GitHub Connection
                  {user?.github_username && <Badge className="bg-green-500 text-white border-0 uppercase text-[10px] tracking-wider"><CheckCircle2 className="w-3 h-3 mr-1" /> Connected</Badge>}
               </CardTitle>
               <CardDescription>
                  {user?.github_username
                     ? "Your public GitHub data is streaming to your HackMate profile."
                     : "Connect your GitHub account to sync your repos, languages, and activity to your profile instantly."}
               </CardDescription>
            </CardHeader>
            <CardContent>
               {!user?.github_username ? (
                  <div className="flex flex-col items-start gap-4">
                     {!showManual ? (
                        <>
                           <p className="text-sm text-muted-foreground max-w-md">
                              Authorize HackMate to access your GitHub profile. This will redirect you to GitHub to securely verify your identity.
                           </p>
                           <Button
                              onClick={handleConnectGithub}
                              disabled={ghLoading}
                              className="bg-foreground text-background hover:bg-foreground/90 flex items-center gap-2 h-12 px-8 rounded-xl shadow-xl border border-border"
                           >
                              {ghLoading ? <Activity className="w-4 h-4 animate-pulse" /> : <Github className="w-5 h-5" />}
                              {ghLoading ? "Redirecting..." : "Connect Securely via GitHub"}
                           </Button>
                           <button
                              onClick={() => setShowManual(true)}
                              className="text-[10px] text-muted-foreground uppercase tracking-widest hover:text-hack-blue transition-colors mt-2"
                           >
                              Or connect manually via username
                           </button>
                        </>
                     ) : (
                        <div className="w-full space-y-4">
                           <p className="text-sm text-muted-foreground">
                              Enter your GitHub username to sync public data.
                           </p>
                           <div className="flex gap-2 w-full max-w-sm">
                              <Input
                                 placeholder="e.g. torvalds"
                                 value={githubInput}
                                 onChange={e => setGithubInput(e.target.value)}
                                 className="flex-1"
                              />
                              <Button onClick={handleConnectManual} disabled={ghLoading}>
                                 {ghLoading ? "Syncing..." : "Sync Profile"}
                              </Button>
                           </div>
                           <button
                              onClick={() => setShowManual(false)}
                              className="text-[10px] text-muted-foreground uppercase tracking-widest hover:text-hack-blue transition-colors"
                           >
                              Back to Secure OAuth
                           </button>
                        </div>
                     )}
                  </div>
               ) : (
                  <div className="space-y-6">
                     <div className="flex items-center justify-between p-4 bg-background border border-border/50 rounded-xl">
                        <div className="flex items-center gap-4">
                           <Avatar className="w-12 h-12 ring-2 ring-green-500/50 ring-offset-2 ring-offset-background">
                              <AvatarImage src={githubData?.profile?.avatar_url || `https://github.com/${user.github_username}.png`} />
                              <AvatarFallback>GH</AvatarFallback>
                           </Avatar>
                           <div>
                              <h4 className="font-bold text-sm">@{user.github_username}</h4>
                              <p className="text-xs text-muted-foreground">{githubData?.profile?.public_repos || 0} public repos · {githubData?.profile?.followers || 0} followers</p>
                           </div>
                        </div>
                        <Button variant="outline" size="sm" onClick={disconnectGitHub} className="border-destructive/50 text-destructive hover:bg-destructive hover:text-white">
                           Disconnect
                        </Button>
                     </div>
                  </div>
               )}
            </CardContent>
         </Card>
      </div>
   );
}

function SecurityTab() {
   const { user, sessions } = useAppContext();
   const isOAuth = user?.auth_methods?.some(m => m === 'google' || m === 'github' || m === 'azure');

   return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
         <Card className="border-border/50 shadow-md">
            <CardHeader>
               <CardTitle>Password & Authentication</CardTitle>
               <CardDescription>
                  {isOAuth
                     ? "Your identity is managed via a social provider."
                     : "Manage your security credentials."}
               </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
               {!isOAuth ? (
                  <div className="space-y-4">
                     <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-muted-foreground">Current Password</label>
                        <Input type="password" placeholder="••••••••" />
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                           <label className="text-xs font-bold uppercase text-muted-foreground">New Password</label>
                           <Input type="password" placeholder="••••••••" />
                        </div>
                        <div className="space-y-2">
                           <label className="text-xs font-bold uppercase text-muted-foreground">Confirm Password</label>
                           <Input type="password" placeholder="••••••••" />
                        </div>
                     </div>
                     <Button variant="secondary">Update Password</Button>
                  </div>
               ) : (
                  <div className="p-6 rounded-2xl bg-hack-blue/5 border border-hack-blue/20 flex flex-col md:flex-row items-center gap-6">
                     <div className="w-16 h-16 rounded-full bg-hack-blue/10 flex items-center justify-center">
                        <Shield className="w-8 h-8 text-hack-blue" />
                     </div>
                     <div>
                        <h4 className="font-bold text-lg text-foreground">Social Authentication Active</h4>
                        <p className="text-sm text-muted-foreground mt-2 max-w-md">
                           You are currently authenticated via <span className="text-hack-blue font-semibold">{user?.auth_methods?.join(" & ")}</span>.
                           Password changes and security protocols are managed securely by your provider.
                        </p>
                     </div>
                  </div>
               )}

               <hr className="border-border" />

               <div className="flex items-center justify-between">
                  <div>
                     <p className="font-bold text-sm">Two-Factor Authentication</p>
                     <p className="text-xs text-muted-foreground mt-1">Add an extra layer of security to your account.</p>
                  </div>
                  <Button variant="outline" disabled={isOAuth}>
                     {isOAuth ? "Managed by Provider" : "Enable 2FA"}
                  </Button>
               </div>
            </CardContent>
         </Card>

         <Card className="border-border/50 shadow-md">
            <CardHeader>
               <CardTitle className="flex items-center gap-2 font-black italic tracking-tighter">
                  <Activity className="w-5 h-5 text-hack-blue" />
                  REAL-TIME SECURITY LOG
               </CardTitle>
               <CardDescription>Active sessions and telemetry data from your account.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               {sessions.slice(0, 4).length === 0 ? (
                  <div className="py-10 text-center border border-dashed rounded-xl">
                     <p className="text-sm text-muted-foreground italic">Syncing session telemetry...</p>
                  </div>
               ) : (
                  sessions.slice(0, 4).map((session, i) => {
                     const DeviceIcon = session.device_type === 'Mobile' ? Smartphone : Laptop;
                     return (
                        <div key={session.id} className="flex items-center justify-between p-4 rounded-2xl border border-border/50 bg-secondary/5 hover:bg-secondary/10 transition-all duration-300">
                           <div className="flex items-center gap-4">
                              <div className={cn("p-3 rounded-xl bg-background border border-border shadow-inner", session.is_active ? "text-hack-blue shadow-hack-blue/10" : "text-muted-foreground")}>
                                 <DeviceIcon className="w-5 h-5" />
                              </div>
                              <div>
                                 <p className="text-sm font-bold flex items-center gap-2">
                                    {session.browser} on {session.os}
                                    {session.is_active && <Badge className="text-[10px] bg-hack-blue/20 text-hack-blue px-2 py-0 border-0">ACTIVE NOW</Badge>}
                                 </p>
                                 <p className="text-xs text-muted-foreground mt-0.5">{session.location || 'Unknown Location'} · {new Date(session.last_active).toLocaleString()}</p>
                              </div>
                           </div>
                           {!session.is_active && <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10">Terminate</Button>}
                        </div>
                     );
                  })
               )}
            </CardContent>
         </Card>
      </div>
   );
}

function NotificationsTab() {
   const { user, updatePreferences } = useAppContext();
   const alerts = user?.preferences?.notifications || {
      team_invites: true,
      task_updates: true,
      mentions: true,
      platform_news: false
   };

   const toggle = (key: string) => {
      const newAlerts = { ...alerts, [key]: !alerts[key as keyof typeof alerts] };
      updatePreferences({ notifications: newAlerts });
      toast.success("Syncing preferences to cloud...");
   };

   return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
         <Card className="border-border/50 shadow-md overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-hack-blue via-hack-purple to-hack-neon animate-pulse" />
            <CardHeader>
               <CardTitle>Cloud-Synced Notifications</CardTitle>
               <CardDescription>Real-time updates delivered across all your linked devices.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               {[
                  { key: "team_invites", label: "Team Invitations", desc: "When someone invites you to a project or hackathon." },
                  { key: "task_updates", label: "Task Updates", desc: "When tasks assigned to you are modified." },
                  { key: "mentions", label: "Mentions & DMs", desc: "When someone @mentions you or sends a direct message." },
                  { key: "platform_news", label: "Platform News", desc: "Updates about HackMate features and events." },
               ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-secondary/5 hover:bg-secondary/10 hover:border-hack-blue/30 transition-all duration-300">
                     <div className="max-w-[80%]">
                        <p className="font-bold text-sm">{item.label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                     </div>
                     <button
                        onClick={() => toggle(item.key)}
                        className={cn(
                           "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full transition-all duration-300 ease-in-out focus:outline-none",
                           alerts[item.key as keyof typeof alerts] ? "bg-hack-blue shadow-[0_0_10px_rgba(0,119,255,0.4)]" : "bg-muted"
                        )}
                     >
                        <span className={cn(
                           "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition duration-300 ease-in-out",
                           alerts[item.key as keyof typeof alerts] ? "translate-x-2.5" : "-translate-x-2.5"
                        )} />
                     </button>
                  </div>
               ))}
            </CardContent>
         </Card>
      </div>
   );
}

function AppearanceTab() {
   const { theme, toggleTheme, user, updatePreferences } = useAppContext();
   const currentAccent = user?.preferences?.appearance?.accentColor || "bg-hack-blue";

   const updateAccent = (color: string) => {
      updatePreferences({
         appearance: { ...user?.preferences?.appearance, accentColor: color }
      });
      toast.success("Accent color updated across your grid.");
   };

   return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
         <Card className="border-border/50 shadow-md">
            <CardHeader>
               <CardTitle>Appearance & Identity</CardTitle>
               <CardDescription>Customize your workspace interface in real-time.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
               <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/10 border border-border/50 hover:border-hack-blue/30 transition-all duration-300">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 rounded-2xl bg-background flex items-center justify-center border border-border shadow-inner">
                        {theme === "light" ? <Sun className="w-6 h-6 text-yellow-500" /> : <Moon className="w-6 h-6 text-hack-blue" />}
                     </div>
                     <div>
                        <p className="text-sm font-bold">Luminosity Level</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Toggle between Dark and Light mode.</p>
                     </div>
                  </div>
                  <button
                     onClick={() => {
                        toggleTheme();
                        toast.success(`Switched to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`, { icon: theme === 'dark' ? '☀️' : '🌙' });
                     }}
                     className={cn(
                        "w-12 h-6 rounded-full p-1 transition-colors relative",
                        theme === "dark" ? "bg-hack-blue" : "bg-muted"
                     )}
                  >
                     <div className={cn(
                        "w-4 h-4 bg-white rounded-full transition-transform shadow",
                        theme === "dark" ? "translate-x-6" : "translate-x-0"
                     )} />
                  </button>
               </div>

               <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 rounded-xl bg-secondary/10 border border-border/50 gap-4">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 rounded-2xl bg-background flex items-center justify-center border border-border text-hack-purple shadow-inner">
                        <Palette className="w-6 h-6 text-hack-neon" />
                     </div>
                     <div>
                        <p className="text-sm font-bold">Chromium Identity</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Primary accent color for your dashboard.</p>
                     </div>
                  </div>
                  <div className="flex gap-3">
                     {[
                        { bg: "bg-hack-blue", name: "Cyber Blue" },
                        { bg: "bg-hack-purple", name: "Quantum Purple" },
                        { bg: "bg-hack-neon", name: "Acid Green" },
                        { bg: "bg-orange-500", name: "Heat Wave" },
                        { bg: "bg-rose-500", name: "Pulse Red" }
                     ].map((color) => (
                        <div
                           key={color.bg}
                           onClick={() => updateAccent(color.bg)}
                           className={cn(
                              "w-8 h-8 rounded-full cursor-pointer ring-offset-2 ring-offset-background hover:ring-2 transition-all duration-300",
                              color.bg,
                              currentAccent === color.bg ? "ring-2 ring-hack-blue scale-110 shadow-lg shadow-hack-blue/20" : "scale-100 opacity-80 hover:opacity-100"
                           )}
                           title={color.name}
                        />
                     ))}
                  </div>
               </div>
            </CardContent>
         </Card>
      </div>
   );
}

function BillingTab() {
   return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
         <Card className="border-hack-blue/30 shadow-lg relative overflow-hidden bg-gradient-to-br from-hack-blue/10 via-background to-background min-h-[400px] flex flex-col items-center justify-center text-center p-8">
            <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:32px_32px]" />
            <div className="relative z-10 space-y-6 max-w-md">
               <div className="w-20 h-20 bg-hack-blue/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CreditCard className="w-10 h-10 text-hack-blue animate-pulse" />
               </div>
               <h2 className="text-4xl font-black italic tracking-tighter text-foreground uppercase">Monetization Module Locked</h2>
               <p className="text-muted-foreground">We are currently integrating global payment gateways. The Billing & Subscription engine will be active in the next deployment cycle.</p>
               <div className="pt-4 flex flex-col gap-3">
                  <Badge className="bg-hack-blue/20 text-hack-blue mx-auto py-1 px-4 border-hack-blue/30">STATUS: COMING SOON</Badge>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Early access members will receive legacy perks.</p>
               </div>
            </div>
         </Card>
      </div>
   );
}

function DeveloperTab() {
   return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
         <Card className="border-border/50 shadow-md min-h-[300px] flex items-center justify-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-hack-purple/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardContent className="text-center space-y-4 relative z-10">
               <div className="w-16 h-16 bg-hack-purple/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-hack-purple/20">
                  <Key className="w-8 h-8 text-hack-purple animate-bounce" />
               </div>
               <h3 className="text-2xl font-bold italic tracking-tighter uppercase">Developer Portal: Closed</h3>
               <p className="text-sm text-muted-foreground max-w-sm">Programmatic access via GraphQL and REST is under development. Public API documentation will be released shortly.</p>
               <div className="pt-2">
                  <Badge className="bg-hack-purple/20 text-hack-purple border-hack-purple/30">FEATURE IN PROGRESS</Badge>
               </div>
            </CardContent>
         </Card>

         <Card className="border-destructive/30 bg-destructive/5">
            <CardHeader>
               <CardTitle className="text-destructive">Danger Zone</CardTitle>
               <CardDescription>Irreversible account actions.</CardDescription>
            </CardHeader>
            <CardContent>
               <div className="flex items-center justify-between">
                  <div>
                     <p className="text-sm font-bold text-foreground">Delete Account</p>
                     <p className="text-[10px] text-muted-foreground">Permanently remove your identity and data.</p>
                  </div>
                  <Button variant="destructive" size="sm" className="gap-2">
                     <Trash2 className="w-4 h-4" /> Delete Account
                  </Button>
               </div>
            </CardContent>
         </Card>
      </div>
   );
}
