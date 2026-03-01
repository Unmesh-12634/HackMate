import React, { useEffect, useRef, useCallback, useState, useMemo } from "react";
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from "motion/react";
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
  ChevronRight,
  Calendar,
  FileText,
  Code,
  User,
  Clock,
  Link as LinkIcon,
  Linkedin,
  Github,
  Mail,
  ExternalLink,
  ChevronDown
} from "lucide-react";
import RadialOrbitalTimeline from "../components/ui/radial-orbital-timeline";
import { InteractiveGlobe } from "../components/ui/interactive-globe";
import Preloader from "../components/ui/Preloader";

// ─── Hide Unicorn Studio watermark globally ───────────────────────────────────
const HIDE_BADGE_CSS = `
  [data-us-badge],
  a[href*="unicorn.studio"],
  div[style*="unicorn"] a {
    display: none !important;
    pointer-events: none !important;
    opacity: 0 !important;
  }
`;

// ─── Unicorn Studio WebGL Scene ───────────────────────────────────────────────
const UNICORN_SDK_URL = "https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v2.0.5/dist/unicornStudio.umd.js";

function UnicornHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<any>(null);

  useEffect(() => {
    let loaded = false;

    const initScene = async () => {
      if (loaded || !containerRef.current) return;
      const win = window as any;

      const run = async () => {
        try {
          sceneRef.current = await win.UnicornStudio.addScene({
            elementId: "unicorn-hero-bg",
            projectId: "tOpwBilsEt2cAhMzxI6h",
            scale: 1,
            dpi: 1.5,
            fps: 60,
            lazyLoad: false,
            production: false,
          });
          loaded = true;
        } catch (e) {
          console.warn("[UnicornStudio] Scene init failed:", e);
        }
      };

      if (win.UnicornStudio?.addScene) {
        await run();
      } else {
        const existing = document.querySelector(`script[src="${UNICORN_SDK_URL}"]`);
        if (!existing) {
          const script = document.createElement("script");
          script.src = UNICORN_SDK_URL;
          script.async = true;
          script.onload = run;
          document.head.appendChild(script);
        } else {
          existing.addEventListener("load", run);
        }
      }
    };

    initScene();

    return () => {
      sceneRef.current?.destroy?.();
    };
  }, []);

  return (
    <>
      {/* Suppress the SDK-injected watermark badge */}
      <style>{HIDE_BADGE_CSS}</style>
      <div
        id="unicorn-hero-bg"
        ref={containerRef}
        className="absolute inset-0 w-full h-full"
        aria-hidden="true"
      />
    </>
  );
}

export function LandingView() {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ─── Scroll-Linked Animations ───
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const heroOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.4], [1, 0.95]);
  const heroY = useTransform(scrollYProgress, [0, 0.4], [0, 100]);
  const bgTranslate = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);

  const springOpacity = useSpring(heroOpacity, { stiffness: 100, damping: 30, restDelta: 0.001 });
  const springY = useSpring(heroY, { stiffness: 100, damping: 30, restDelta: 0.001 });

  return (
    <AnimatePresence mode="wait">
      {isLoading ? (
        <Preloader key="preloader" onComplete={() => setIsLoading(false)} />
      ) : (
        <motion.div
          key="landing-content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          ref={containerRef}
          className="min-h-screen bg-black text-slate-200 selection:bg-blue-500/30 overflow-x-hidden font-sans scroll-smooth"
        >

          {/* ─── Floating Navigation ──────────────────────────────────────────── */}
          <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-7xl h-16 border border-white/[0.06] bg-black/40 backdrop-blur-2xl px-6 rounded-2xl flex items-center justify-between shadow-2xl shadow-black/80">
            <div className="flex items-center gap-2 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                <img src="/assets/logo.png" className="w-7 h-7 object-contain" alt="HackMate" />
              </div>
              <span className="text-sm font-black tracking-tighter uppercase text-white">HackMate</span>
            </div>

            <div className="hidden md:flex items-center gap-8">
              {[
                { label: "Features", href: "#features" },
                { label: "Global", href: "#global" },
                { label: "Intelligence", href: "#intelligence" },
                { label: "Briefing", href: "#briefing" }
              ].map((item) => (
                <a key={item.label} href={item.href} className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 hover:text-blue-400 transition-colors">
                  {item.label}
                </a>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <button onClick={() => navigate("/login")} className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 hover:text-white transition-colors">Log In</button>
              <Button onClick={() => navigate("/signup")} className="h-9 px-6 rounded-lg font-bold uppercase text-[10px] tracking-widest bg-blue-600 hover:bg-blue-500 border-none shadow-lg shadow-blue-600/25 group transition-all duration-300">
                Initialize <ChevronRight className="w-3 h-3 ml-1 group-hover:translate-x-0.5 transition-transform" />
              </Button>
            </div>
          </nav>

          {/* ─── HERO: Full-screen WebGL Scene ─────────────────────────────── */}
          <section className="relative w-full min-h-screen flex flex-col items-center justify-center overflow-hidden">
            {/* WebGL Background */}
            <motion.div style={{ y: bgTranslate }} className="absolute inset-0 z-0">
              <UnicornHero />
            </motion.div>

            {/* Dark overlay gradient so text remains readable */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black pointer-events-none z-[1]" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/50 pointer-events-none z-[1]" />

            <motion.div
              style={{ opacity: springOpacity, y: springY, scale: heroScale }}
              className="relative z-10 flex flex-col items-center text-center px-6 pt-28 pb-24 max-w-6xl mx-auto w-full"
            >
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-8"
              >
                {/* Status pill */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/25 backdrop-blur-md"
                >
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(96,165,250,0.8)]" />
                  <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-blue-400">Tactical OS v2.0 · Live</span>
                </motion.div>

                {/* Main headline */}
                <motion.h1
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                  className="text-6xl md:text-[8rem] font-black tracking-tight uppercase leading-[0.85] text-white drop-shadow-[0_4px_32px_rgba(0,0,0,0.5)]"
                >
                  Command Your <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-br from-blue-300 via-blue-400 to-blue-600">
                    Innovation.
                  </span>
                </motion.h1>

                {/* Subheadline */}
                <motion.p
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                  className="max-w-xl mx-auto text-sm md:text-base text-slate-300/80 font-medium leading-relaxed uppercase tracking-wider"
                >
                  The high-precision workspace for elite development squads.
                  Built to scale, engineered for speed, designed for impact.
                </motion.p>

                {/* CTAs */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.55, duration: 0.8 }}
                  className="pt-4 flex flex-wrap justify-center gap-4"
                >
                  <Button
                    onClick={() => navigate("/signup")}
                    className="h-14 px-10 rounded-xl text-[11px] font-black uppercase tracking-[0.3em] bg-blue-600 hover:bg-blue-500 shadow-xl shadow-blue-600/30 hover:scale-[1.02] hover:shadow-blue-500/40 transition-all duration-300"
                  >
                    Launch Mission
                  </Button>
                  <Button
                    variant="outline"
                    className="h-14 px-10 rounded-xl text-[11px] font-black uppercase tracking-[0.3em] border-white/15 bg-white/[0.06] backdrop-blur-xl hover:bg-white/[0.12] hover:border-white/25 transition-all"
                  >
                    Read Briefing
                  </Button>
                </motion.div>

                {/* Live stats strip */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8, duration: 1 }}
                  className="flex flex-wrap justify-center gap-8 pt-10 border-t border-white/[0.06] mt-10"
                >
                  {[
                    { label: "Sync Latency", val: "< 2MS" },
                    { label: "Neural Link", val: "ACTIVE" },
                    { label: "Encryption", val: "AES-256" },
                    { label: "System Uptime", val: "99.99%" },
                  ].map((st, i) => (
                    <div key={st.label} className={`text-left px-6 ${i !== 0 ? 'border-l border-white/10' : ''}`}>
                      <div className="text-xl md:text-2xl font-black text-white tracking-tight">{st.val}</div>
                      <div className="text-[8px] font-black uppercase tracking-[0.3em] text-blue-500/60 mt-0.5">{st.label}</div>
                    </div>
                  ))}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2, duration: 1 }}
                  className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
                >
                  <span className="text-[8px] font-black uppercase tracking-[0.4em] text-slate-600">Scroll to Synchronize</span>
                  <ChevronDown className="w-4 h-4 text-blue-500 animate-bounce" />
                </motion.div>
              </motion.div>
            </motion.div>
          </section>

          {/* ─── Features Section ─────────────────────────────────────── */}
          <section id="features" className="relative z-10 py-32 px-6">
            <div className="max-w-7xl mx-auto rounded-[4rem] bg-crystal-black border border-white/[0.05] p-12 md:p-24 shadow-2xl overflow-hidden min-h-[900px] flex flex-col items-center justify-center relative">
              <div className="absolute inset-0 bg-blue-600/[0.02] pointer-events-none" />
              <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600/5 rounded-full blur-[100px] pointer-events-none" />
              <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-600/5 rounded-full blur-[100px] pointer-events-none" />

              <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20 relative z-10">
                <div className="space-y-6">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    className="flex items-center gap-3"
                  >
                    <div className="h-px w-8 bg-blue-500/50" />
                    <h2 className="text-[10px] font-bold uppercase tracking-[0.5em] text-blue-500">Weaponry // Arsenal</h2>
                  </motion.div>
                  <h3 className="text-4xl md:text-7xl font-black uppercase tracking-tighter text-white leading-none">
                    Full Spectrum <br /> Capabilities.
                  </h3>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                    className="flex items-center gap-3 py-2 px-4 rounded-lg bg-blue-600/5 border border-blue-500/10 w-fit"
                  >
                    <Terminal className="w-3 h-3 text-blue-500" />
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-400">
                      &gt; [MISSION_INTEL]: INTERACT WITH NODES TO ANALYZE CAPABILITIES
                    </span>
                  </motion.div>
                </div>
                <p className="max-w-xs text-[10px] font-bold uppercase tracking-widest text-slate-500 leading-relaxed border-l border-white/10 pl-6">
                  Every module is engineered for low-latency collaboration and high-authority mission management. Optimized for 2026 tactical deployment.
                </p>
              </div>

              <div className="relative mt-20 min-h-[700px] w-full flex items-center justify-center">
                <RadialOrbitalTimeline
                  timelineData={[
                    {
                      id: 1,
                      title: "Mission Board",
                      date: "Q1 2026",
                      content: "Ultra-precise task tracking with advanced dependency mapping and real-time state synchronization across all command units.",
                      category: "Operations",
                      icon: LayoutGrid,
                      relatedIds: [2, 4, 7],
                      status: "completed",
                      energy: 100,
                    },
                    {
                      id: 2,
                      title: "Neural Chat",
                      date: "Q2 2026",
                      content: "Encrypted communication channels featuring context-aware AI relays that summarize mission briefings and critical alerts.",
                      category: "Communication",
                      icon: MessageSquare,
                      relatedIds: [1, 6, 8],
                      status: "completed",
                      energy: 95,
                    },
                    {
                      id: 3,
                      title: "Secure Vault",
                      date: "Q2 2026",
                      content: "High-authority credential management with military-grade encryption and automated rotation for all project environmental secrets.",
                      category: "Security",
                      icon: Shield,
                      relatedIds: [1, 6],
                      status: "in-progress",
                      energy: 85,
                    },
                    {
                      id: 4,
                      title: "Squad Intel",
                      date: "Q3 2026",
                      content: "Deep-core performance analytics and squad velocity tracking with predictive bottleneck detection and morale scoring.",
                      category: "Analytics",
                      icon: Activity,
                      relatedIds: [1, 5, 10],
                      status: "in-progress",
                      energy: 70,
                    },
                    {
                      id: 5,
                      title: "Global Link",
                      date: "Q4 2026",
                      content: "Strategic recruitment and networking module to identify and deploy elite personnel across the global HackMate grid.",
                      category: "Network",
                      icon: Globe,
                      relatedIds: [4, 6],
                      status: "pending",
                      energy: 45,
                    },
                    {
                      id: 6,
                      title: "AI Architect",
                      date: "Q1 2027",
                      content: "Autonomous system optimization engine and code auditor that ensures high-integrity deployments and structural optimization.",
                      category: "Automation",
                      icon: Bot,
                      relatedIds: [2, 3, 5, 9],
                      status: "pending",
                      energy: 20,
                    },
                    {
                      id: 7,
                      title: "Real-time Forge",
                      date: "Q1 2026",
                      content: "Collaborative low-latency IDE extensions for shared terminal access and synchronous code reviews.",
                      category: "Development",
                      icon: Code2,
                      relatedIds: [1, 8],
                      status: "completed",
                      energy: 90,
                    },
                    {
                      id: 8,
                      title: "Tactical HUD",
                      date: "Q2 2026",
                      content: "Dynamic heads-up display for team members to monitor live mission status, deadline pressure, and active hotspots.",
                      category: "Interface",
                      icon: Cpu,
                      relatedIds: [2, 7, 10],
                      status: "in-progress",
                      energy: 75,
                    },
                    {
                      id: 9,
                      title: "Ghost Mode",
                      date: "Q3 2026",
                      content: "Privacy-first stealth workflows allowing squads to operate in air-gapped environments while maintaining local sync.",
                      category: "Privacy",
                      icon: Shield,
                      relatedIds: [3, 6],
                      status: "pending",
                      energy: 30,
                    },
                    {
                      id: 10,
                      title: "XP Governance",
                      date: "Q1 2026",
                      content: "Automated reputation system that rewards high-impact contributions and manages automated penalties for missed drops.",
                      category: "Governance",
                      icon: Zap,
                      relatedIds: [4, 8],
                      status: "completed",
                      energy: 100,
                    },
                  ]}
                />
              </div>
            </div>
          </section>

          <section id="global" className="relative z-10 py-32 px-6 bg-black rounded-[4rem] my-12 mx-4 border border-white/[0.03] shadow-[0_0_100px_rgba(37,99,235,0.05)] overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.01] via-transparent to-transparent pointer-events-none" />
            <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center relative z-10">
              <div className="order-2 lg:order-1 relative h-[600px] flex items-center justify-center">
                {/* Ambient globe glow */}
                <div className="absolute inset-0 blur-[120px] bg-blue-500/10 scale-110 pointer-events-none" />
                <div className="w-full h-full relative z-10">
                  <InteractiveGlobe
                    size={600}
                    className="opacity-80 hover:opacity-100 transition-opacity duration-700"
                    autoRotateSpeed={0.003}
                  />
                </div>

                {/* Tactical data frame */}
                <div className="absolute -bottom-6 -left-6 md:-left-12 p-6 rounded-2xl bg-black/80 backdrop-blur-xl border border-white/10 shadow-2xl z-20 max-w-[240px]">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse" />
                    <span className="text-[8px] font-black uppercase tracking-[0.3em] text-blue-500">Live Intel Feed</span>
                  </div>
                  <p className="text-[9px] font-bold text-slate-400 leading-relaxed uppercase tracking-widest">
                    Analyzing global squad velocity patterns. 150+ edge nodes operational. High-authority sync active.
                  </p>
                </div>
              </div>

              <div id="intelligence" className="order-1 lg:order-2 space-y-10">
                <h2 className="text-[10px] font-bold uppercase tracking-[0.5em] text-blue-500">Autonomous Intel</h2>
                <h3 className="text-5xl md:text-8xl font-black uppercase tracking-tighter text-white leading-[0.85]">
                  The <span className="text-blue-500">Architect</span> <br /> Always Watches.
                </h3>
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-[0.2em] leading-loose max-w-md">
                  Experience the first AI-driven project refinery. It doesn't just suggest—it predicts bottlenecks before they compromise your mission. Powered by neural-sync v2.
                </p>

                <div className="grid grid-cols-2 gap-8 py-4">
                  {[{ label: "Predictive", val: "94%" }, { label: "Efficiency", val: "2.4x" }].map(stat => (
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

          {/* ─── Social Proof ─────────────────────────────────────────────────── */}
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

          {/* ─── CTA Section ──────────────────────────────────────────────────── */}
          <section id="briefing" className="relative py-32 px-6 text-center overflow-hidden mx-4">
            <motion.div
              whileInView={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 30 }}
              viewport={{ once: true }}
              className="relative z-10 max-w-4xl mx-auto rounded-[3rem] bg-crystal-black border border-white/[0.08] p-16 md:p-20 shadow-[0_0_80px_rgba(0,0,0,0.8)] overflow-hidden"
            >
              {/* Internal Glows */}
              <div className="absolute -top-32 -left-32 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
              <div className="absolute -bottom-32 -right-32 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

              <div className="relative z-10 space-y-10">
                <div className="flex flex-col items-center gap-4">
                  <div className="px-4 py-1 rounded-full border border-blue-500/20 bg-blue-500/5 backdrop-blur-xl inline-flex items-center gap-2">
                    <span className="w-1 h-1 bg-blue-400 rounded-full animate-pulse" />
                    <span className="text-[7px] font-black uppercase tracking-[0.4em] text-blue-400">Portal Connection: Secure</span>
                  </div>
                  <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-white leading-[0.85]">
                    Claim Your <br /> <span className="text-blue-500">Station.</span>
                  </h2>
                </div>

                <p className="max-w-md mx-auto text-[9px] font-bold text-slate-400 uppercase tracking-[0.3em] leading-relaxed">
                  Initialize your command module and join the elite. <br />
                  <span className="text-blue-500/40 font-mono tracking-normal">0x742 ... Transmission Ready</span>
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4">
                  <Button
                    onClick={() => navigate("/signup")}
                    className="h-16 px-12 rounded-xl text-[10px] font-black uppercase tracking-[0.4em] bg-blue-600 hover:bg-blue-500 shadow-xl shadow-blue-600/30 transition-all hover:scale-[1.02] active:scale-98 group"
                  >
                    Initialize Command
                  </Button>
                  <button className="flex items-center gap-3 text-[9px] font-black uppercase tracking-[0.4em] text-slate-500 hover:text-white transition-colors h-16 px-8 group">
                    <div className="w-1.5 h-1.5 rounded-full border border-slate-700 group-hover:border-blue-500 transition-colors" />
                    Request Intel
                  </button>
                </div>
              </div>
            </motion.div>
          </section>

          {/* ─── Footer ───────────────────────────────────────────────────────── */}
          <footer className="relative z-10 py-32 px-6 border-t border-white/[0.03] bg-black">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-20 md:gap-12">
              {/* Brand & Personal Section */}
              <div className="md:col-span-5 space-y-10">
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-crystal-black border border-white/10 flex items-center justify-center shadow-2xl">
                      <img src="/assets/logo.png" className="w-8 h-8 object-contain" alt="HackMate" />
                    </div>
                    <div>
                      <span className="text-xl font-black tracking-tighter uppercase text-white block">HackMate</span>
                      <span className="text-[8px] font-black uppercase tracking-[0.4em] text-blue-500/60">Tactical Operating System</span>
                    </div>
                  </div>
                  <p className="max-w-sm text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed">
                    The high-authority OS for elite development squads. Optimized for 2026 tactical deployment. Transmission secured and encrypted.
                  </p>
                </div>

                <div className="pt-8 border-t border-white/5 space-y-6">
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">Lead Architect</span>
                    <span className="text-lg font-black text-white uppercase tracking-tight">Unmesh Joshi</span>
                  </div>

                  <div className="flex items-center gap-6">
                    <a
                      href="https://www.linkedin.com/in/unmesh-joshi-b0846431b/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 rounded-lg bg-white/5 border border-white/10 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all group"
                    >
                      <Linkedin className="w-5 h-5 text-slate-400 group-hover:text-blue-500" />
                    </a>
                    <a
                      href="https://github.com/Unmesh-12634"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 rounded-lg bg-white/5 border border-white/10 hover:border-white/30 hover:bg-white/10 transition-all group"
                    >
                      <Github className="w-5 h-5 text-slate-400 group-hover:text-white" />
                    </a>
                    <a
                      href="mailto:unmesh@hackmate.tech"
                      className="p-3 rounded-lg bg-white/5 border border-white/10 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all group"
                    >
                      <Mail className="w-5 h-5 text-slate-400 group-hover:text-emerald-500" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Navigation Links */}
              <div className="md:col-span-7 grid grid-cols-2 lg:grid-cols-3 gap-12">
                {[
                  {
                    title: "Arsenal",
                    links: ["Mission Board", "Neural Sync", "Vault", "Intel"],
                    color: "text-blue-500"
                  },
                  {
                    title: "Ecosystem",
                    links: ["API Docs", "Changelog", "Network", "Status"],
                    color: "text-indigo-500"
                  },
                  {
                    title: "Legal",
                    links: ["Terms", "Privacy", "Security", "Policy"],
                    color: "text-slate-500"
                  }
                ].map((group, i) => (
                  <div key={i} className="space-y-8">
                    <h5 className={`text-[9px] font-black uppercase tracking-[0.4em] text-white flex items-center gap-2`}>
                      <div className={`w-1 h-3 ${group.color.replace('text', 'bg')} rounded-full opacity-50`} />
                      {group.title}
                    </h5>
                    <ul className="space-y-4">
                      {group.links.map(link => (
                        <li key={link}>
                          <a href="#" className="text-[9px] font-bold text-slate-500 uppercase tracking-widest hover:text-white transition-colors flex items-center gap-2 group">
                            <span className="w-0 group-hover:w-2 h-px bg-white transition-all duration-300" />
                            {link}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            <div className="max-w-7xl mx-auto pt-32 flex flex-col md:flex-row justify-between items-center gap-10 text-[9px] font-bold text-slate-700 uppercase tracking-[0.4em] border-t border-white/[0.03] mt-24">
              <div className="flex items-center gap-4">
                <span>© 2026 HACKMATE SYSTEMS</span>
                <span className="w-1 h-1 bg-slate-800 rounded-full" />
                <span>TRANS-ENCRYPTION ENABLED</span>
              </div>

              <div className="flex items-center gap-10">
                {["SYSTEM_OK", "NODES_152_ACTIVE", "LATENCY_2MS"].map(tag => (
                  <span key={tag} className="flex items-center gap-2 group cursor-help">
                    <div className="w-1 h-1 bg-emerald-500/40 rounded-full group-hover:bg-emerald-400 transition-colors" />
                    <span className="group-hover:text-slate-500 transition-colors">{tag}</span>
                  </span>
                ))}
              </div>
            </div>
          </footer>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
