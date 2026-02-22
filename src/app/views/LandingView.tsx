import React from "react";
import { motion } from "motion/react";
import { Button, cn } from "../components/ui/button";
import { useAppContext } from "../context/AppContext";
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
  Code2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

export function LandingView() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 selection:bg-blue-500/30 overflow-x-hidden font-sans scroll-smooth">
      {/* Dynamic Background Overlay */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px] opacity-40 animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[120px] opacity-40 animate-pulse" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] brightness-125" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-20 border-b border-white/[0.03] bg-[#020617]/40 backdrop-blur-2xl px-6 md:px-12 flex items-center justify-between">
        <div className="flex items-center gap-3 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
            <Zap className="text-white w-5 h-5 fill-white" />
          </div>
          <span className="text-lg font-black tracking-tight uppercase leading-none text-white">HackMate</span>
        </div>

        <div className="hidden lg:flex items-center gap-10">
          {["Features", "Ecosystem", "Community", "Intelligence"].map((item) => (
            <a key={item} href={`#${item.toLowerCase()}`} className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-blue-500 transition-colors">
              {item}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-6">
          <button onClick={() => navigate("/login")} className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-white transition-colors">Sign In</button>
          <Button onClick={() => navigate("/signup")} className="rounded-full h-11 px-8 font-black uppercase text-[10px] tracking-widest bg-blue-600 hover:bg-blue-500 border-none shadow-xl shadow-blue-600/20 group">
            Get Started <ArrowRight className="w-3.5 h-3.5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-44 pb-32 px-6 md:px-12 max-w-[1400px] mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-10"
        >
          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-blue-500/5 border border-blue-500/10 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400">The Modern OS for Hackathons</span>
          </div>

          <h1 className="text-5xl md:text-8xl font-black tracking-tight uppercase leading-[0.9] text-white max-w-5xl mx-auto">
            Build Teams. Ship <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">Products.</span> Dominate.
          </h1>

          <p className="text-lg md:text-xl text-slate-400 font-medium uppercase tracking-wide max-w-3xl mx-auto leading-relaxed">
            HackMate provides the ultimate command center for elite development squads. Real-time collaboration, AI assistance, and mission-critical tools in one unified interface.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6">
            <Button onClick={() => navigate("/signup")} className="h-16 px-12 rounded-full text-xs font-black uppercase tracking-[0.3em] bg-blue-600 hover:bg-blue-500 shadow-2xl shadow-blue-600/30 hover:scale-105 transition-all">
              Initialize Command
            </Button>
            <Button variant="outline" className="h-16 px-12 rounded-full text-xs font-black uppercase tracking-[0.3em] border-white/10 bg-white/5 backdrop-blur-xl hover:bg-white/10 transition-all">
              View Briefing
            </Button>
          </div>
        </motion.div>

        {/* Dashboard Preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="mt-24 relative max-w-6xl mx-auto group"
        >
          <div className="absolute inset-0 bg-blue-600/20 blur-[120px] rounded-full opacity-30 group-hover:opacity-50 transition-opacity" />
          <div className="relative rounded-[40px] border border-white/10 bg-[#0f172a]/60 backdrop-blur-3xl p-3 shadow-2xl overflow-hidden aspect-[16/9]">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1575388902449-6bca946ad549?w=1600&h=900&fit=crop"
              alt="HackMate Dashboard"
              className="w-full h-full object-cover rounded-[32px] opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent" />
          </div>
        </motion.div>
      </section>

      {/* Social Proof */}
      <section className="relative z-10 py-20 border-y border-white/[0.03] bg-white/[0.01]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-12 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Trusted by 50,000+ Operatives:</span>
          <div className="flex flex-wrap justify-center gap-12 md:gap-20">
            {["GITHUB", "VERCEL", "STRIPE", "AWS", "DISCORD"].map(brand => (
              <span key={brand} className="text-lg font-black tracking-widest text-white">{brand}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="relative z-10 py-48 px-6 md:px-12 max-w-[1400px] mx-auto">
        <div className="text-center mb-24 space-y-4">
          <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-500">The Arsenal</h2>
          <h3 className="text-4xl md:text-6xl font-black uppercase tracking-tight text-white">Built for <span className="text-blue-500">Performance.</span></h3>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              title: "Mission Board",
              desc: "High-velocity Kanban boards optimized for sub-hour task cycles and squad dependencies.",
              icon: LayoutGrid,
              color: "blue"
            },
            {
              title: "Neural Sync Chat",
              desc: "Real-time communication with integrated code snippet support and AI logic refactoring.",
              icon: MessageSquare,
              color: "indigo"
            },
            {
              title: "Secure Vault",
              desc: "Encrypted storage for team assets, API keys, and tactical documentation.",
              icon: Shield,
              color: "purple"
            },
            {
              title: "Squad Intel",
              desc: "Deep analytics into team velocity, individual focus scores, and project health metrics.",
              icon: Activity,
              color: "emerald"
            },
            {
              title: "Strategy Builder",
              desc: "Interactive roadmap tools that automatically adapt based on squad progress and deadlines.",
              icon: Target,
              color: "orange"
            },
            {
              title: "Global Link",
              desc: "Seamlessly find and recruit high-authority personnel from the global hacker network.",
              icon: Globe,
              color: "cyan"
            }
          ].map((feature, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -8 }}
              className="group p-10 rounded-[40px] bg-[#0f172a]/40 border border-white/[0.05] hover:border-blue-500/30 transition-all duration-500 relative overflow-hidden"
            >
              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-10 group-hover:scale-110 transition-transform">
                <feature.icon className="w-8 h-8 text-blue-500" />
              </div>
              <h4 className="text-2xl font-black uppercase tracking-tight text-white mb-6">{feature.title}</h4>
              <p className="text-sm font-medium text-slate-500 leading-relaxed uppercase tracking-wider">{feature.desc}</p>

              <div className="mt-10 flex items-center gap-3 text-blue-500 group-hover:translate-x-2 transition-transform cursor-pointer">
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Read Intel</span>
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Product Showcase - Mid Page */}
      <section className="relative z-10 py-48 px-6 md:px-12 bg-white/[0.01] border-y border-white/[0.03]">
        <div className="max-w-[1400px] mx-auto grid lg:grid-cols-2 gap-24 items-center">
          <div className="space-y-12">
            <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-500">Neural Integration</h2>
            <h3 className="text-5xl md:text-7xl font-black uppercase tracking-tight text-white leading-[1.1]">
              Meet your <span className="text-blue-500">AI Architect.</span>
            </h3>
            <p className="text-lg text-slate-400 font-medium leading-relaxed uppercase tracking-wider">
              Every squad is assigned a dedicated Architect AI. It analyzes your code, suggests optimizations, and manages tactical deployments so you can focus on the core mission.
            </p>

            <ul className="space-y-6 pt-6">
              {[
                "Real-time Logic Auditing",
                "Automated Resource Allocation",
                "Predictive Deadline Analysis",
                "Integrated Neural Chat"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-4 text-sm font-black uppercase tracking-widest text-slate-300">
                  <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  {item}
                </li>
              ))}
            </ul>

            <Button className="h-16 px-12 rounded-full text-xs font-black uppercase tracking-[0.3em] bg-blue-600 hover:bg-blue-500 transition-all">
              Initialize Neural Link
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-blue-600/10 blur-[100px] rounded-full" />
            <div className="relative rounded-[48px] border border-white/10 bg-[#0f172a]/80 backdrop-blur-3xl p-4 overflow-hidden shadow-2xl">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1762280040702-dbe2f4869712?w=1000&h=1200&fit=crop"
                alt="AI Interface"
                className="w-full h-full object-cover rounded-[32px] opacity-60"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 bg-blue-600 rounded-[32px] flex items-center justify-center shadow-2xl animate-pulse">
                  <Bot className="w-10 h-10 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer Section */}
      <section className="relative z-10 py-48 px-6 md:px-12 text-center">
        <div className="max-w-4xl mx-auto space-y-12">
          <h2 className="text-5xl md:text-8xl font-black uppercase tracking-tight text-white leading-none">
            Establish Your <br /> <span className="text-blue-500">Dominance.</span>
          </h2>
          <p className="text-lg text-slate-400 font-medium uppercase tracking-[0.2em] leading-relaxed">
            Join the elite network of developers building the future. Your mission begins now.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 pt-8">
            <Button onClick={() => navigate("/signup")} className="h-24 px-16 rounded-full text-sm font-black uppercase tracking-[0.5em] bg-white text-blue-600 hover:bg-slate-100 shadow-2xl transition-all hover:scale-105 active:scale-95">
              Initialize Link
            </Button>
            <button className="text-[10px] font-black uppercase tracking-[0.6em] text-slate-500 hover:text-white transition-colors px-10">
              Contact High Command
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-24 px-6 md:px-12 border-t border-white/[0.03] bg-[#010409]">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-16 md:gap-8 mb-24">
          <div className="col-span-1 md:col-span-1 space-y-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-600/30">
                <Zap className="text-white w-5 h-5 fill-white" />
              </div>
              <span className="text-xl font-black tracking-tight uppercase text-white">HackMate</span>
            </div>
            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-widest leading-relaxed">
              The ultimate operating system for high-performance hackathon squads. Built for speed, precision, and global collaboration.
            </p>
          </div>

          {[
            { title: "Network", links: ["Intelligence Hub", "Global Squads", "Leaderboard", "Events"] },
            { title: "Arsenal", links: ["Mission Board", "Neural Sync", "Secure Vault", "Squad Intel"] },
            { title: "Company", links: ["About", "Careers", "Legal", "Privacy"] }
          ].map((group, i) => (
            <div key={i} className="space-y-8">
              <h5 className="text-[10px] font-black uppercase tracking-[0.4em] text-white">{group.title}</h5>
              <ul className="space-y-4">
                {group.links.map(link => (
                  <li key={link}><a href="#" className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-blue-500 transition-colors">{link}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-center gap-8 pt-12 border-t border-white/[0.03]">
          <div className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">
            © 2026 HackMate Systems Inc. // Transmission Secure
          </div>
          <div className="flex gap-10">
            {["Terms", "Privacy", "Security", "Status"].map(link => (
              <a key={link} href="#" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 hover:text-white transition-colors">{link}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
