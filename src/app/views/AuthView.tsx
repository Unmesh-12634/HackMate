import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button, cn } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent } from "../components/ui/card";
import { supabase } from "../../lib/supabase";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Zap,
  Github,
  Chrome,
  ArrowLeft,
  Mail,
  Lock,
  User,
  Fingerprint,
  KeyRound,
  Terminal,
  ShieldCheck,
  Loader2,
  AlertCircle
} from "lucide-react";


import { useAppContext } from "../context/AppContext";

export function AuthView() {
  const navigate = useNavigate();
  const { user } = useAppContext();
  const [isLogin, setIsLogin] = useState(true);

  // Redirect if already logged in
  React.useEffect(() => {
    if (user) {
      if (document.referrer.includes("/login")) {
        // Avoid double history if possible, but navigating to dashboard is priority
      }
      navigate("/workspace");
    }
  }, [user, navigate]);

  const [isLoading, setIsLoading] = useState(false);

  // Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) throw error;
        toast.success("Identity Confirmed. Establishing Neural Link...");
        // Navigation handled by useEffect when user state updates
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              avatar_url: `https://i.pravatar.cc/150?u=${email}` // Default avatar
            }
          }
        });
        if (error) throw error;
        toast.success("RECRUITMENT PROCESSED. CHECK NEURAL LINK (EMAIL) FOR CONFIRMATION.");
        setIsLogin(true);
      }
    } catch (error: any) {
      console.error(error);
      toast.error("ACCESS DENIED", {
        description: error.message || "Credential verification failed."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuth = async (provider: 'google' | 'github') => {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/workspace`
      }
    });
    if (error) {
      toast.error(`CONNECTION FAILED: ${provider.toUpperCase()}`, {
        description: error.message
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 lg:p-12 relative overflow-hidden font-sans selection:bg-blue-500/30 selection:text-white">
      {/* Immersive Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-600/10 blur-[180px] rounded-full opacity-40 animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-indigo-600/10 blur-[180px] rounded-full opacity-40 animate-pulse" style={{ animationDelay: '2s' }} />

      {/* Animated Grid Lines */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(to right, #475569 1px, transparent 1px), linear-gradient(to bottom, #475569 1px, transparent 1px)`,
          backgroundSize: '80px 80px'
        }}
      />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.1] brightness-125 contrast-125" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-xl z-10"
      >
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 hover:text-white mb-10 transition-all group px-4 py-2 hover:bg-white/5 rounded-xl w-fit"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Abort Mission
        </button>

        <Card className="bg-[#0f172a]/60 backdrop-blur-3xl border-white/[0.05] shadow-[0_0_100px_-20px_rgba(37,99,235,0.2)] rounded-[48px] relative overflow-hidden group/card hover:border-blue-500/20 transition-colors duration-500">
          {/* Top Branding Accent */}
          <div className="absolute top-0 left-0 right-0 h-1 flex opacity-50">
            <div className="flex-1 bg-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.5)]" />
            <div className="flex-1 bg-indigo-600 shadow-[0_0_20px_rgba(79,70,229,0.5)]" />
            <div className="flex-1 bg-violet-600 shadow-[0_0_20px_rgba(124,58,237,0.5)]" />
          </div>

          <CardContent className="p-8 md:p-12 lg:p-16 relative">
            <div className="absolute top-0 right-0 p-8 opacity-20 pointer-events-none">
              <Fingerprint className="w-32 h-32 text-blue-500 rotate-12" />
            </div>

            <div className="flex flex-col items-center mb-12 relative z-10">
              <div className="w-20 h-20 rounded-[24px] flex items-center justify-center mb-6">
                <img src="/assets/logo.png" className="w-12 h-12 object-contain" alt="HackMate" />
              </div>
              <h1 className="text-3xl font-black tracking-tighter uppercase text-white font-mono mb-2">HackMate<span className="text-blue-500">.sys</span></h1>
              <div className="flex items-center gap-3">
                <div className="h-px w-8 bg-gradient-to-r from-transparent to-slate-600" />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em]">
                  {isLogin ? "Restricted Access" : "New Operative"}
                </span>
                <div className="h-px w-8 bg-gradient-to-l from-transparent to-slate-600" />
              </div>
            </div>

            <form onSubmit={handleAuth} className="space-y-6 relative z-10">
              <AnimatePresence mode="wait">
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, y: -20 }}
                    animate={{ opacity: 1, height: "auto", y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -20 }}
                    className="space-y-4 overflow-hidden"
                  >
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4 flex items-center gap-2">
                        <Terminal className="w-3 h-3" /> Codename
                      </label>
                      <div className="relative group">
                        <User className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                        <Input
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="E.G. NEURAL_ARCHITECT"
                          className="pl-12 h-14 bg-white/[0.03] border-white/5 rounded-2xl font-bold text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 focus:bg-white/[0.05] text-white placeholder:text-slate-600 transition-all shadow-inner"
                          required={!isLogin}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4 flex items-center gap-2">
                  <Mail className="w-3 h-3" /> Neural Link
                </label>
                <div className="relative group">
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="OPERATIVE@HACKMATE.IO"
                    className="pl-5 h-14 bg-white/[0.03] border-white/5 rounded-2xl font-bold text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 focus:bg-white/[0.05] text-white placeholder:text-slate-600 transition-all shadow-inner uppercase"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center px-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                    <KeyRound className="w-3 h-3" /> Passcode
                  </label>
                  {isLogin && (
                    <button type="button" className="text-[9px] font-bold uppercase tracking-wider text-blue-500 hover:text-white transition-colors">Forgot?</button>
                  )}
                </div>
                <div className="relative group">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="pl-12 h-14 bg-white/[0.03] border-white/5 rounded-2xl font-bold text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 focus:bg-white/[0.05] text-white placeholder:text-slate-600 transition-all shadow-inner tracking-widest"
                    required
                  />
                </div>
              </div>

              <div className="pt-4">
                <Button
                  type="submit"
                  className={cn(
                    "w-full h-16 rounded-2xl text-xs font-black uppercase tracking-[0.3em] bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 transition-all hover:scale-[1.01] active:scale-[0.99] shadow-[0_0_40px_-10px_rgba(37,99,235,0.5)] border border-white/10 group relative overflow-hidden",
                    isLoading && "opacity-80 cursor-wait"
                  )}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin text-white" />
                  ) : (
                    <span className="relative z-10 flex items-center justify-center gap-3">
                      {isLogin ? "Authenticate" : "Initialize Protocol"}
                      <Zap className="w-4 h-4 fill-white animate-[pulse_2s_infinite]" />
                    </span>
                  )}
                  <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                </Button>
              </div>
            </form>

            <div className="relative my-10">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/[0.05]" />
              </div>
              <div className="relative flex justify-center text-[9px] font-black uppercase tracking-[0.3em]">
                <span className="bg-[#0e1525] px-4 text-slate-600 rounded-full border border-white/[0.05]">Or Access Via</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                onClick={() => handleOAuth('github')}
                disabled={isLoading}
                className="gap-3 h-14 rounded-2xl bg-white/[0.02] border-white/5 font-bold text-[10px] uppercase tracking-widest hover:bg-white/[0.08] text-white hover:border-white/10 hover:text-white transition-all group"
              >
                <Github className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
                <span className="group-hover:translate-x-1 transition-transform">GitHub</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => handleOAuth('google')}
                disabled={isLoading}
                className="gap-3 h-14 rounded-2xl bg-white/[0.02] border-white/5 font-bold text-[10px] uppercase tracking-widest hover:bg-white/[0.08] text-white hover:border-white/10 hover:text-white transition-all group"
              >
                <Chrome className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
                <span className="group-hover:translate-x-1 transition-transform">Google</span>
              </Button>
            </div>

            <div className="mt-12 text-center">
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setFullName("");
                  setEmail("");
                  setPassword("");
                }}
                className="group relative px-4 py-2"
              >
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-white transition-colors">
                  {isLogin ? "Need Clearance?" : "Already Operative?"}
                </span>
                <span className="ml-2 text-[10px] font-black uppercase tracking-widest text-blue-500 group-hover:text-blue-400 transition-colors">
                  {isLogin ? "Request Access" : "Sign In"}
                </span>
                <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Tactical Security Footer */}
        <div className="mt-10 flex flex-col items-center gap-3 opacity-40 hover:opacity-100 transition-opacity duration-500">
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/5 border border-emerald-500/10">
            <ShieldCheck className="w-3 h-3 text-emerald-500" />
            <span className="text-[8px] font-black uppercase tracking-[0.3em] text-emerald-500/80">Secured via Supabase</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
