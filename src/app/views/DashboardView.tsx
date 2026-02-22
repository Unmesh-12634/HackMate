import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Badge } from "../components/ui/card";
import { Button, cn } from "../components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "../components/ui/avatar";
import { Input } from "../components/ui/input";
import { toast } from "sonner";
import { useAppContext, Team } from "../context/AppContext";
import {
  Plus,
  Users,
  Zap,
  Flame,
  X,
  Sparkles,
  Trophy as TrophyIcon,
  Globe,
  Lock,
  Target,
  FileText,
  Rocket,
  ArrowRight,
  Shield,
  Layers,
  Activity,
  ChevronRight,
  Command,
  LayoutGrid,
  TrendingUp,
  BrainCircuit,
  Terminal,
  Clock,
  Briefcase,
  Bot
} from "lucide-react";

export function DashboardView() {
  const { teams, addTeam, setActiveTeamId, user, joinTeam } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get("q")?.toLowerCase() || "";

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinCode, setJoinCode] = useState("");

  const [formData, setFormData] = useState<Partial<Team>>({
    name: "",
    event: "",
    type: "Hackathon",
    visibility: "Public",
    maxMembers: 4,
    deadline: "",
    description: ""
  });

  const handleJoinTeam = async (code: string) => {
    const success = await joinTeam(code);
    if (success) {
      // Toast handled by context
      setShowJoinModal(false);
      setJoinCode("");
    }
  };

  const filteredTeams = teams.filter(t =>
    searchQuery === "" ||
    t.name.toLowerCase().includes(searchQuery) ||
    (t.event && t.event.toLowerCase().includes(searchQuery))
  );

  const pendingTasks = teams.flatMap(team =>
    (team.tasks || []).map(task => ({ ...task, teamName: team.name, teamId: team.id, teamColor: team.color }))
  ).filter(t =>
    t.status !== "done" &&
    (searchQuery === "" || t.title.toLowerCase().includes(searchQuery) || t.teamName.toLowerCase().includes(searchQuery))
  ).sort((a, b) => {
    const pWeight: Record<string, number> = { urgent: 3, high: 2, medium: 1, low: 0 };
    return (pWeight[b.priority] || 0) - (pWeight[a.priority] || 0);
  });

  // Dynamic Personnel Metrics
  const deploymentsCount = teams.length;
  const allTasks = teams.flatMap(team => team.tasks || []);
  const completedTasksCount = allTasks.filter(t => t.status === "done").length;
  const totalTasksCount = allTasks.length;
  const efficiencyPercentage = totalTasksCount > 0 ? ((completedTasksCount / totalTasksCount) * 100).toFixed(1) : "0.0";
  const formattedReputation = new Intl.NumberFormat('en-US').format(user?.reputation || 0);
  const userRankText = user?.rank || "Elite Rank";
  const userAuthorityText = user?.role || "System Authority";

  const handleCreateTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.event) {
      toast.error("Deployment data incomplete.");
      return;
    }

    const colors = ["bg-blue-600", "bg-indigo-600", "bg-purple-600", "bg-emerald-600"];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    addTeam({ ...formData, color: randomColor });
    setShowCreateModal(false);
    setFormData({ name: "", event: "", type: "Hackathon", visibility: "Public", maxMembers: 4 });
    toast.success("Strategic Workspace initialized.");
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-16 animate-in fade-in slide-in-from-bottom-6 duration-1000 font-sans pb-24">
      {/* Immersive Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 pb-16 border-b border-border/40 relative overflow-hidden">
        <div className="space-y-6 relative z-10">
          <div className="flex items-center gap-4">
            <Badge className="bg-hack-blue/10 text-hack-blue border-hack-blue/20 px-4 py-1.5 rounded-xl font-black text-[10px] uppercase tracking-[0.3em]">Operational Status: Active</Badge>
            <div className="flex items-center gap-2 px-3 py-1 bg-secondary/50 rounded-lg border border-border/50">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Link Stable</span>
            </div>
          </div>
          <h1 className="text-6xl font-black tracking-tighter leading-none uppercase text-foreground font-mono">
            Mission <span className="text-hack-blue">Control</span>.
          </h1>
          <p className="text-sm text-muted-foreground font-medium max-w-xl leading-relaxed uppercase tracking-[0.1em]">
            Operative <span className="text-foreground font-black">{user?.name?.split(' ')[0] || "Alex"}</span>, you are currently managing <span className="text-foreground font-black">{teams.length} Strategic Units</span> with active objectives pending across multiple sectors.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 relative z-10">
          <Button variant="outline" className="h-16 px-10 rounded-2xl gap-4 font-black text-[10px] uppercase tracking-[0.3em] border-border/50 bg-secondary/30 hover:bg-secondary/50 transition-all shadow-2xl text-muted-foreground hover:text-foreground" onClick={() => setShowJoinModal(true)}>
            <Users className="w-4 h-4 text-hack-blue" /> Join Squad
          </Button>
          <Button variant="outline" className="h-16 px-10 rounded-2xl gap-4 font-black text-[10px] uppercase tracking-[0.3em] border-border/50 bg-secondary/30 hover:bg-secondary/50 transition-all shadow-2xl text-muted-foreground hover:text-foreground" onClick={() => navigate("/community")}>
            <Globe className="w-4 h-4 text-hack-blue" /> Intelligence Hub
          </Button>
          <Button className="h-16 px-10 rounded-2xl gap-4 shadow-[0_25px_50px_-12px_rgba(37,99,235,0.3)] font-black text-[10px] uppercase tracking-[0.3em] group bg-hack-blue hover:bg-hack-blue/90 text-white" onClick={() => setShowCreateModal(true)}>
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" /> Deploy New Unit
          </Button>
        </div>

        {/* Background Highlight */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-hack-blue/5 rounded-full blur-[120px] -mr-48 -mt-48 opacity-40 pointer-events-none" />
      </div>

      <div className="grid grid-cols-12 gap-12">
        {/* Main Sector: Active Units & Tasks */}
        <div className="col-span-12 xl:col-span-8 space-y-16">

          {/* Global Operations Board (Prioritized) */}
          <div className="space-y-8">
            <h2 className="text-[11px] font-black uppercase tracking-[0.5em] text-muted-foreground flex items-center gap-4">
              <div className="w-8 h-8 rounded-[11px] bg-rose-500/10 border border-border/50 flex items-center justify-center">
                <Target className="w-4 h-4 text-rose-500" />
              </div>
              Global Operations Board
            </h2>
            <div className="space-y-4">
              {pendingTasks.length === 0 ? (
                <div className="py-20 flex flex-col items-center justify-center border-2 border-dashed border-border/50 rounded-[48px] bg-secondary/10">
                  <Target className="w-16 h-16 text-muted-foreground mb-6 opacity-20" />
                  <div className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">No Pending Objectives Detected</div>
                </div>
              ) : (
                pendingTasks.slice(0, 15).map(task => (
                  <div key={`${task.teamId}-${task.id}`} onClick={() => navigate(`/team/${task.teamId}`)} className="p-6 rounded-[32px] bg-card border border-border/50 hover:border-hack-blue/50 cursor-pointer transition-all flex items-center justify-between group shadow-sm hover:shadow-xl hover:shadow-hack-blue/5">
                    <div className="flex items-center gap-6">
                      <div className={`w-2.5 h-2.5 shadow-[0_0_15px_currentColor] rounded-full ${task.priority === 'urgent' ? 'bg-rose-500 text-rose-500' : task.priority === 'high' ? 'bg-orange-500 text-orange-500' : 'bg-emerald-500 text-emerald-500'}`} />
                      <div>
                        <div className="text-sm font-black text-foreground uppercase tracking-tight mb-1.5 group-hover:text-hack-blue transition-colors">{task.title}</div>
                        <div className="flex items-center gap-3 text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                          <span className={task.teamColor ? `text-${task.teamColor.split('-')[1]}-500` : "text-hack-blue"}>{task.teamName}</span>
                          <span className="w-1 h-1 rounded-full bg-border" />
                          <span>{task.status.replace('_', ' ')}</span>
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" className="opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-2 w-12 h-12 rounded-2xl bg-secondary/50">
                      <ArrowRight className="w-5 h-5" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="h-px bg-border/40 w-full" />

          {/* Secondary: Strategic Command Units */}
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-[11px] font-black uppercase tracking-[0.5em] text-muted-foreground flex items-center gap-4">
                <div className="w-8 h-8 rounded-[11px] bg-secondary/50 border border-border/50 flex items-center justify-center"><Layers className="w-4 h-4 text-hack-blue" /></div>
                Strategic Command Units
              </h2>
              <div className="flex items-center gap-6">
                <button className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground hover:text-foreground transition-colors">Archive</button>
                <div className="h-4 w-px bg-border/50" />
                <button className="text-[9px] font-black uppercase tracking-[0.3em] text-hack-blue hover:text-foreground transition-colors">Analytics</button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTeams.length === 0 ? (
                <div className="col-span-full py-20 flex flex-col items-center justify-center border-2 border-dashed border-border/50 rounded-3xl bg-secondary/20 group hover:bg-secondary/30 transition-all">
                  <Rocket className="w-12 h-12 text-muted-foreground mb-4 opacity-20 group-hover:scale-110 group-hover:text-hack-blue transition-all" />
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground mb-6">No Operational Units Found</p>
                  <Button variant="outline" className="h-12 px-8 rounded-xl font-black uppercase tracking-[0.3em] text-[10px] border-border/50 hover:bg-hack-blue hover:text-white hover:border-hack-blue transition-all" onClick={() => setShowCreateModal(true)}>Initialize Primary Link</Button>
                </div>
              ) : (
                filteredTeams.map((team) => (
                  <motion.div
                    key={team.id}
                    whileHover={{ y: -5 }}
                    className="group"
                    onClick={() => { setActiveTeamId(team.id); navigate(`/team/${team.id}`); }}
                  >
                    <Card className="h-full bg-card border-border/50 rounded-3xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl hover:shadow-hack-blue/5 hover:border-hack-blue/30 transition-all duration-300 relative flex flex-col">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-hack-blue/5 rounded-full blur-[60px] -mr-16 -mt-16 group-hover:bg-hack-blue/10 transition-colors" />

                      <CardHeader className="p-6 relative z-10">
                        <div className="flex justify-between items-start mb-6">
                          <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg transition-all duration-500 group-hover:scale-105", team.color)}>
                            {team.type === "Hackathon" ? <Zap className="w-6 h-6 fill-white" /> : <Layers className="w-6 h-6" />}
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <Badge className={cn("px-3 py-1 rounded-lg border-none font-black text-[9px] uppercase tracking-widest",
                              team.visibility === "Public" ? "bg-emerald-500/10 text-emerald-500" : "bg-orange-500/10 text-orange-500"
                            )}>
                              {team.visibility === "Public" ? <Globe className="w-3 h-3 mr-1.5" /> : <Lock className="w-3 h-3 mr-1.5" />}
                              {team.visibility}
                            </Badge>
                            <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest border-border/50 text-muted-foreground px-3 py-1 rounded-lg">{team.type}</Badge>
                          </div>
                        </div>
                        <CardTitle className="text-xl font-black leading-tight uppercase tracking-tight group-hover:text-hack-blue transition-colors text-foreground font-mono truncate">{team.name}</CardTitle>
                        <CardDescription className="text-[10px] font-bold uppercase tracking-[0.2em] mt-2 line-clamp-1 text-muted-foreground">{team.event}</CardDescription>
                      </CardHeader>

                      <CardContent className="p-6 pt-0 flex-1 flex flex-col justify-end relative z-10">
                        <div className="flex items-center justify-between mb-8">
                          <div className="flex -space-x-3">
                            {team.currentMembers.map((m, i) => (
                              <Avatar key={i} className="w-10 h-10 border-4 border-card ring-1 ring-border/10 shadow-lg">
                                <AvatarImage src={m.avatar} />
                                <AvatarFallback className="text-[9px] font-black bg-hack-blue text-white uppercase">{m.name[0]}</AvatarFallback>
                              </Avatar>
                            ))}
                            {team.maxMembers > team.currentMembers.length && (
                              <div className="w-10 h-10 rounded-full border-4 border-card bg-secondary/50 flex items-center justify-center text-[9px] font-black shadow-lg text-muted-foreground ring-1 ring-border/10">
                                +{team.maxMembers - team.currentMembers.length}
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground block mb-1">Velocity</span>
                            <span className="text-xl font-black text-foreground">{team.progress}%</span>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden shadow-inner border border-border/20">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${team.progress}%` }}
                              className={cn("h-full rounded-full shadow-[0_0_15px_rgba(59,130,246,0.3)]", team.color)}
                            />
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2 text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                              <Target className="w-3.5 h-3.5 text-hack-blue" /> {team.tasksCount} Active
                            </div>
                            <div className="group-hover:translate-x-2 transition-transform duration-300 flex items-center gap-2 text-hack-blue">
                              <span className="text-[9px] font-black uppercase tracking-widest">Link</span>
                              <ArrowRight className="w-4 h-4" />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Sector: Intel & Personnel */}
        <div className="col-span-12 xl:col-span-4 space-y-12">
          <div className="space-y-8">
            <h2 className="text-[11px] font-black uppercase tracking-[0.5em] text-muted-foreground flex items-center gap-4">
              <div className="w-8 h-8 rounded-xl bg-secondary/50 border border-border/50 flex items-center justify-center"><TrophyIcon className="w-4 h-4 text-orange-500" /></div>
              Personnel Meta-Data
            </h2>
            <Card className="bg-gradient-to-br from-card via-background to-indigo-950/20 text-foreground border-border/50 rounded-[56px] shadow-2xl shadow-hack-blue/5 overflow-hidden relative group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-hack-blue/10 rounded-full blur-[120px] -mr-32 -mt-32 group-hover:scale-150 transition-transform duration-1000" />
              <CardHeader className="p-12 relative z-10">
                <div className="flex justify-between items-center mb-10">
                  <div className="w-14 h-14 bg-background/50 rounded-2xl flex items-center justify-center border border-border/50 backdrop-blur-md shadow-2xl">
                    <Flame className="w-7 h-7 text-orange-500 fill-orange-500" />
                  </div>
                  <Badge className="bg-background/80 text-foreground border-border text-[10px] font-black uppercase px-4 py-1.5 rounded-xl tracking-widest">{userRankText}</Badge>
                </div>
                <CardTitle className="text-foreground text-4xl font-black uppercase tracking-tight font-mono">{userAuthorityText}</CardTitle>
              </CardHeader>
              <CardContent className="p-12 pt-0 relative z-10 space-y-12">
                <div className="grid grid-cols-2 gap-10">
                  <div>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] mb-3">Deployments</p>
                    <p className="text-5xl font-black text-foreground">{deploymentsCount.toString().padStart(2, '0')}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] mb-3">Victories</p>
                    <p className="text-5xl font-black text-foreground">{completedTasksCount.toString().padStart(2, '0')}</p>
                  </div>
                </div>
                <div className="pt-12 border-t border-border/20 flex items-center justify-between">
                  <div className="space-y-3">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">Global Rep</p>
                    <p className="text-2xl font-black text-hack-blue flex items-center gap-3">{formattedReputation} <Sparkles className="w-5 h-5" /></p>
                  </div>
                  <div className="space-y-3 text-right">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">Efficiency</p>
                    <p className="text-2xl font-black text-emerald-400">{efficiencyPercentage}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-8">
            <h2 className="text-[11px] font-black uppercase tracking-[0.5em] text-muted-foreground flex items-center gap-4">
              <div className="w-8 h-8 rounded-xl bg-secondary/50 border border-border/50 flex items-center justify-center"><BrainCircuit className="w-4 h-4 text-hack-blue" /></div>
              Predictive Intel
            </h2>
            <Card className="border-hack-blue/30 bg-hack-blue/5 rounded-[56px] p-2 overflow-hidden shadow-inner border-2 border-dashed group cursor-pointer hover:bg-hack-blue/10 transition-all">
              <div className="p-10 space-y-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-hack-blue flex items-center justify-center text-white shadow-[0_15px_30px_rgba(37,99,235,0.4)]">
                    <Bot className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-[0.4em] text-hack-blue font-mono">Architect.ai</span>
                </div>
                <p className="text-sm leading-relaxed font-bold italic text-muted-foreground border-l-4 border-hack-blue pl-8 py-3 bg-card/20 rounded-r-2xl">
                  {teams.length > 0 ? (
                    <>
                      "Operative velocity analysis indicates squad '{teams[0].name}' is performing at <span className="text-foreground">{efficiencyPercentage}% capacity</span>. Estimated deployment readiness: <span className="text-foreground">Optimal</span>."
                    </>
                  ) : (
                    "System awaiting unit deployment. Initialize new squad to begin predictive analysis."
                  )}
                </p>
                <Button variant="outline" className="w-full h-14 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] border-hack-blue/30 text-hack-blue hover:bg-hack-blue/10 transition-all">
                  Optimize Squad Rotation
                </Button>
              </div>
            </Card>
          </div>


        </div>
      </div>

      {/* Enhanced Create Unit Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 lg:p-12">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowCreateModal(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              transition={{ type: "spring", damping: 30, stiffness: 250 }}
              className="bg-card w-full max-w-5xl rounded-[64px] border border-border/10 shadow-[0_100px_200px_-50px_rgba(0,0,0,0.5)] relative z-10 overflow-hidden flex flex-col lg:flex-row min-h-[700px]"
            >
              {/* Modal Left Sidebar */}
              <div className="w-full lg:w-[400px] bg-hack-blue p-16 text-white flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                  <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-200" />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_white_1px,_transparent_1px)] bg-[size:40px_40px] scale-150" />
                </div>
                <div className="relative z-10 space-y-12">
                  <div className="w-20 h-20 bg-white/20 rounded-[32px] flex items-center justify-center backdrop-blur-2xl border border-white/30 shadow-2xl">
                    <Rocket className="w-10 h-10 fill-white" />
                  </div>
                  <div className="space-y-6">
                    <h2 className="text-5xl font-black uppercase tracking-tight leading-none">Deploy <br /> Unit.</h2>
                    <p className="text-sm font-medium opacity-80 leading-relaxed uppercase tracking-widest max-w-[280px]">
                      Initialize your tactical workspace. All core assets will be provisioned via Architect-AI protocols.
                    </p>
                  </div>
                </div>
                <div className="relative z-10 pt-20">
                  <div className="flex items-center gap-4 text-[11px] font-black uppercase tracking-[0.4em] opacity-60">
                    <div className="w-2 h-2 rounded-full bg-white animate-pulse" /> Secure Connection v4.2
                  </div>
                </div>
              </div>

              {/* Modal Form Area */}
              <div className="flex-1 p-16 lg:p-20 overflow-y-auto custom-scrollbar bg-card">
                <div className="flex items-center justify-between mb-16">
                  <h2 className="text-[11px] font-black uppercase tracking-[0.5em] text-muted-foreground lg:hidden">Unit Config</h2>
                  <button onClick={() => setShowCreateModal(false)} className="w-12 h-12 flex items-center justify-center hover:bg-secondary/50 rounded-2xl ml-auto transition-all text-foreground"><X className="w-6 h-6" /></button>
                </div>

                <form onSubmit={handleCreateTeam} className="space-y-12">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground ml-1">Squad Designation</label>
                      <div className="relative group">
                        <Terminal className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-hack-blue transition-colors" />
                        <Input placeholder="E.G. NEURAL_SYNC" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="h-16 pl-14 rounded-2xl bg-secondary/30 border-border/10 font-black uppercase text-xs px-6 text-foreground focus:ring-hack-blue/20" required />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground ml-1">Operational Event</label>
                      <div className="relative group">
                        <Briefcase className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-hack-blue transition-colors" />
                        <Input placeholder="E.G. GLOBAL_HACK_2026" value={formData.event} onChange={(e) => setFormData({ ...formData, event: e.target.value })} className="h-16 pl-14 rounded-2xl bg-secondary/30 border-border/10 font-black uppercase text-xs px-6 text-foreground focus:ring-hack-blue/20" required />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground ml-1">Mission Type</label>
                      <div className="relative">
                        <select
                          className="w-full h-16 bg-secondary/30 border border-border/10 rounded-2xl px-8 text-[11px] font-black uppercase tracking-[0.3em] focus:outline-none focus:ring-2 focus:ring-hack-blue/20 appearance-none cursor-pointer text-foreground"
                          value={formData.type}
                          onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                        >
                          <option value="Hackathon">Tactical Hackathon</option>
                          <option value="Project">Stealth Project</option>
                          <option value="Research">Research Lab</option>
                          <option value="Open Source">Global Hub</option>
                        </select>
                        <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none rotate-90" />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground ml-1">Access Protocol</label>
                      <div className="relative">
                        <select
                          className="w-full h-16 bg-secondary/30 border border-border/10 rounded-2xl px-8 text-[11px] font-black uppercase tracking-[0.3em] focus:outline-none focus:ring-2 focus:ring-hack-blue/20 appearance-none cursor-pointer text-foreground"
                          value={formData.visibility}
                          onChange={(e) => setFormData({ ...formData, visibility: e.target.value as any })}
                        >
                          <option value="Public">Public Access</option>
                          <option value="Private">Encrypted / Stealth</option>
                        </select>
                        <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none rotate-90" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground ml-1">Personnel Limit</label>
                      <div className="relative group">
                        <Users className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input type="number" min="1" max="10" value={formData.maxMembers} onChange={(e) => setFormData({ ...formData, maxMembers: parseInt(e.target.value) })} className="h-16 pl-14 rounded-2xl bg-secondary/30 border-border/10 font-black px-8 text-foreground focus:ring-hack-blue/20" />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground ml-1">Mission Deadline</label>
                      <div className="relative group">
                        <Clock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input type="date" value={formData.deadline} onChange={(e) => setFormData({ ...formData, deadline: e.target.value })} className="h-16 pl-14 rounded-2xl bg-secondary/30 border-border/10 font-black px-8 uppercase text-xs text-foreground focus:ring-hack-blue/20" />
                      </div>
                    </div>
                  </div>

                  <div className="pt-12 flex gap-6">
                    <Button type="button" variant="ghost" className="h-20 px-12 rounded-[32px] font-black uppercase tracking-[0.4em] text-[10px] border border-border/50 text-foreground hover:bg-secondary/80" onClick={() => setShowCreateModal(false)}>Abort</Button>
                    <Button type="submit" className="flex-1 h-20 px-12 rounded-[32px] font-black uppercase tracking-[0.4em] text-[10px] shadow-[0_25px_50px_-12px_rgba(37,99,235,0.4)] bg-hack-blue hover:bg-hack-blue/90 text-white transition-all hover:scale-[1.02] active:scale-95">Initialize Unit</Button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Join Team Modal */}
      <AnimatePresence>
        {showJoinModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-background/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card w-full max-w-lg rounded-[40px] border border-border/50 shadow-2xl overflow-hidden"
            >
              <div className="p-10 text-center space-y-6">
                <div className="w-20 h-20 bg-hack-blue/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="w-10 h-10 text-hack-blue" />
                </div>
                <h2 className="text-2xl font-black uppercase tracking-tight text-foreground">Join Existing Squad</h2>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider leading-relaxed">
                  Enter the secure uplink code provided by your squad leader to sync your neural link.
                </p>

                <div className="space-y-4 pt-4">
                  <Input
                    placeholder="ENTER UPLINK CODE"
                    className="text-center text-lg font-black uppercase tracking-[0.3em] h-16 rounded-2xl bg-secondary/50 border-border/50 focus:ring-hack-blue/30 text-foreground"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  />
                  <Button
                    className="w-full h-14 rounded-2xl font-black uppercase tracking-[0.2em] bg-hack-blue hover:bg-hack-blue/90 text-white shadow-lg shadow-hack-blue/20"
                    onClick={() => {
                      if (joinCode.trim()) {
                        handleJoinTeam(joinCode);
                      } else {
                        toast.error("Please enter a valid code");
                      }
                    }}
                  >
                    Authenticate &amp; Sync
                  </Button>
                </div>
              </div>
              <div className="p-6 bg-secondary/30 border-t border-border/50 text-center">
                <Button variant="ghost" className="text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-foreground" onClick={() => setShowJoinModal(false)}>Cancel Sequence</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
