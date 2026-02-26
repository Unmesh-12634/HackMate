import React from "react";
import { motion } from "motion/react";
import { Button, cn } from "../components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  Zap,
  Target,
  MessageSquare,
  Shield,
  Bot,
  Globe,
  Rocket,
  ArrowRight,
  Sparkles,
  Activity,
  Users,
  Trophy,
  CheckCircle2,
  LayoutGrid,
  Search,
  Hash,
  Filter,
  ArrowUpRight,
  Layers,
  Terminal,
  Cpu,
  Workflow,
  Code2,
  ChevronRight
} from "lucide-react";

export function LandingView() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 selection:bg-blue-500/30 overflow-x-hidden font-sans scroll-smooth">
      {/* Background Layer: Tactical Grid & Depth */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] brightness-125" />
        <div className="absolute top-[-20%] left-[-10%] w-[700px] h-[700px] bg-blue-600/10 rounded-full blur-[150px] opacity-20" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-400/5 rounded-full blur-[150px] opacity-20" />
        {/* Subtle HUD Grid */}
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(circle, #3b82f6 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      {/* Floating Navigation */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-7xl h-16 border border-white/[0.05] bg-[#020617]/40 backdrop-blur-2xl px-6 rounded-2xl flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-2 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-300">
            <Zap className="text-white w-4 h-4 fill-white" />
          </div>
          <span className="text-sm font-black tracking-tighter uppercase text-white">HackMate</span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          {["Arsenal", "Network", "Intel", "Docs"].map((item) => (
            <a key={item} href={`#${item.toLowerCase()}`} className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 hover:text-blue-400 transition-colors">
              {item}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/login")} className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 hover:text-white transition-colors">Sign In</button>
          <Button onClick={() => navigate("/signup")} className="h-9 px-6 rounded-lg font-bold uppercase text-[10px] tracking-widest bg-blue-600 hover:bg-blue-500 border-none shadow-lg shadow-blue-600/20 group transition-all duration-300">
            Initialize <ChevronRight className="w-3 h-3 ml-1 group-hover:translate-x-0.5 transition-transform" />
          </Button>
        </div>
      </nav>

      {/* Hero Section: Typrographic Focus */}
      <section className="relative z-10 pt-48 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center space-y-8"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 backdrop-blur-md">
            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
            <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-blue-400">Tactical OS v2.0 Live</span>
          </div>

          <h1 className="text-6xl md:text-[7rem] font-black tracking-tight uppercase leading-[0.85] text-white">
            Command Your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-br from-blue-400 to-blue-600">Innovation.</span>
          </h1>

          <p className="max-w-xl mx-auto text-sm md:text-base text-slate-400 font-medium leading-relaxed uppercase tracking-wider">
            The high-precision workspace for elite development squads.
            Built to scale, engineered for speed, designed for impact.
          </p>

          <div className="pt-4 flex flex-wrap justify-center gap-4">
            <Button onClick={() => navigate("/signup")} className="h-14 px-10 rounded-xl text-[11px] font-black uppercase tracking-[0.3em] bg-blue-600 hover:bg-blue-500 shadow-xl shadow-blue-600/20 hover:scale-[1.02] transition-all duration-300">
              Launch Mission
            </Button>
            <Button variant="outline" className="h-14 px-10 rounded-xl text-[11px] font-black uppercase tracking-[0.3em] border-white/10 bg-white/5 backdrop-blur-xl hover:bg-white/10 transition-all">
              Read Briefing
            </Button>
          </div>
        </motion.div>

        {/* 3D Hero Visual Plate */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="mt-20 relative w-full aspect-[21/9] rounded-[2rem] overflow-hidden group shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] border border-white/5"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent z-10" />
          <img
            src="/assets/hero_3d.png"
            alt="HackMate Tactical Console"
            className="w-full h-full object-cover transform scale-100 group-hover:scale-[1.02] transition-transform duration-[3s] ease-out"
          />

          {/* Internal HUD Elements overlay */}
          <div className="absolute top-10 right-10 z-20 hidden md:block">
            <div className="p-4 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                <span className="text-[8px] font-bold uppercase tracking-widest text-slate-300">System Nominal</span>
              </div>
              <div className="w-32 h-1 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "85%" }}
                  transition={{ duration: 2, delay: 1 }}
                  className="h-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                />
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Feature Command Center */}
      <section id="features" className="relative z-10 py-32 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20">
          <div className="space-y-4">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.5em] text-blue-500">Weaponry</h2>
            <h3 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white">Full Spectrum <br /> Capabilities.</h3>
          </div>
          <p className="max-w-xs text-[10px] font-bold uppercase tracking-widest text-slate-500 leading-relaxed">
            Every module is engineered for low-latency collaboration and high-authority mission management.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/[0.05] border border-white/[0.05] rounded-[2rem] overflow-hidden">
          {[
            { title: "Mission Board", icon: LayoutGrid, desc: "Ultra-precise task tracking with dependency mapping." },
            { title: "Neural Chat", icon: MessageSquare, desc: "Real-time communication with context-aware AI relay." },
            { title: "Secure Vault", icon: Shield, desc: "Military-grade encryption for all project credentials." },
            { title: "Squad Intel", icon: Activity, desc: "Deep performance analytics and velocity tracking." },
            { title: "Global Link", icon: Globe, desc: "Find elite personnel across the secure network." },
            { title: "AI Architect", icon: Bot, desc: "Autonomous project optimization and code auditing." }
          ].map((feature, i) => (
            <motion.div
              key={i}
              whileHover={{ backgroundColor: "rgba(255,255,255,0.02)" }}
              className="group p-12 bg-[#020617] transition-all duration-300 cursor-default"
            >
              <feature.icon className="w-6 h-6 text-blue-500 mb-8 group-hover:scale-110 transition-transform" />
              <h4 className="text-lg font-black uppercase tracking-tight text-white mb-4">{feature.title}</h4>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-loose">{feature.desc}</p>

              <div className="mt-8 flex items-center gap-2 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                <span className="text-[8px] font-black uppercase tracking-widest text-blue-500">View Intel</span>
                <ArrowRight className="w-3 h-3 text-blue-500" />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* AI Product Showcase */}
      <section className="relative z-10 py-32 px-6 bg-blue-600/[0.02] border-y border-white/[0.03]">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
          <div className="order-2 lg:order-1 relative h-[600px] rounded-[3rem] overflow-hidden border border-white/10 group bg-[#020617]">
            <div className="absolute inset-0 bg-blue-600/5 animate-pulse" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                <div className="absolute inset-0 blur-3xl bg-blue-500/20 animate-pulse scale-150" />
                <div className="w-48 h-48 rounded-[2rem] bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center relative z-10 shadow-[0_0_50px_rgba(59,130,246,0.5)]">
                  <Bot className="w-20 h-20 text-white animate-bounce" />
                </div>
              </div>
            </div>
            {/* Dynamic scan line effect */}
            <div className="absolute top-0 left-0 w-full h-[2px] bg-blue-500/50 blur-[2px] animate-[scan_4s_linear_infinite]" />

            <style dangerouslySetInnerHTML={{
              __html: `
                @keyframes scan {
                  0% { top: 0% }
                  100% { top: 100% }
                }
             `}} />
          </div>

          <div className="order-1 lg:order-2 space-y-10">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.5em] text-blue-500">Autonomous Intel</h2>
            <h3 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-white leading-[0.9]">
              The <span className="text-blue-500">Architect</span> <br /> Always Watches.
            </h3>
            <p className="text-base text-slate-400 font-medium uppercase tracking-widest leading-relaxed">
              Experience the first AI-driven project refinery. It doesn't just suggest—it predicts bottlenecks before they compromise your mission.
            </p>

            <div className="grid grid-cols-2 gap-8 py-4">
              {[
                { label: "Predictive", val: "94%" },
                { label: "Efficiency", val: "2.4x" },
              ].map(stat => (
                <div key={stat.label} className="space-y-1">
                  <div className="text-3xl font-black text-white">{stat.val}</div>
                  <div className="text-[9px] font-bold uppercase tracking-widest text-slate-500">{stat.label}</div>
                </div>
              ))}
            </div>

            <Button className="h-16 px-12 rounded-xl text-[11px] font-black uppercase tracking-[0.4em] bg-white text-[#020617] hover:bg-slate-200 transition-all">
              Initialize Neural Relay
            </Button>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-24 border-b border-white/[0.03]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col items-center gap-12">
          <span className="text-[9px] font-bold uppercase tracking-[0.5em] text-slate-500">Verified and Utilized By Elite Teams At:</span>
          <div className="flex flex-wrap justify-center gap-12 md:gap-24 opacity-30 invert brightness-200 hover:opacity-100 transition-opacity duration-700">
            {["GH", "VM", "ST", "AW", "DC"].map(logo => (
              <span key={logo} className="text-3xl font-black tracking-tighter text-white">{logo}</span>
            ))}
          </div>
        </div>
      </section>

      {/* High Command CTA */}
      <section className="relative py-48 px-6 text-center overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/5 rounded-full blur-[120px]" />

        <motion.div
          whileInView={{ opacity: 1, scale: 1 }}
          initial={{ opacity: 0, scale: 0.95 }}
          className="relative z-10 max-w-4xl mx-auto space-y-12"
        >
          <h2 className="text-6xl md:text-[8rem] font-black uppercase tracking-tight text-white leading-[0.8]">
            Claim Your <br /> <span className="text-blue-500 shadow-blue-500/50">Station.</span>
          </h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-10">
            <Button onClick={() => navigate("/signup")} className="h-20 px-16 rounded-2xl text-[12px] font-black uppercase tracking-[0.5em] bg-blue-600 hover:bg-blue-500 shadow-2xl shadow-blue-600/30 transition-all hover:scale-[1.05] active:scale-95">
              Initialize Command
            </Button>
            <button className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400 hover:text-white transition-colors h-20 px-10">
              Request Intel
            </button>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-32 px-6 border-t border-white/[0.03] bg-[#010409]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-20 md:gap-12">
          <div className="space-y-8">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-blue-600 rounded flex items-center justify-center shadow-lg shadow-blue-600/30">
                <Zap className="text-white w-4 h-4 fill-white" />
              </div>
              <span className="text-lg font-black tracking-tighter uppercase text-white">HackMate</span>
            </div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed">
              The high-authority OS for elite development squads. 2026 Transmission Secured.
            </p>
          </div>

          {[
            { title: "Arsenal", links: ["Mission Board", "Neural Sync", "Vault", "Intel"] },
            { title: "Ecosystem", links: ["API Docs", "Changelog", "Network", "Status"] },
            { title: "Legal", links: ["Terms", "Privacy", "Security", "Cookie Policy"] }
          ].map((group, i) => (
            <div key={i} className="space-y-8">
              <h5 className="text-[9px] font-black uppercase tracking-[0.4em] text-white underline decoration-blue-500/50 underline-offset-8 decoration-2">{group.title}</h5>
              <ul className="space-y-4">
                {group.links.map(link => (
                  <li key={link}><a href="#" className="text-[9px] font-bold text-slate-500 uppercase tracking-widest hover:text-blue-500 transition-colors">{link}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="max-w-7xl mx-auto pt-24 flex flex-col md:flex-row justify-between items-center gap-8 text-[9px] font-bold text-slate-700 uppercase tracking-[0.3em]">
          <span>© 2026 HackMate Systems // All Rights Reserved</span>
          <div className="flex gap-10">
            {["SYSTEM_OK", "TRANS_ENCRYPTED", "LATENCY_2MS"].map(tag => (
              <span key={tag} className="flex items-center gap-2">
                <div className="w-1 h-1 bg-emerald-500/50 rounded-full" /> {tag}
              </span>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
