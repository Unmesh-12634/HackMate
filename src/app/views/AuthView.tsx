import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button, cn } from "../components/ui/button";
import { Input } from "../components/ui/input";
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
  Loader2,
  Sparkles,
  Fingerprint,
  Waves,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  History
} from "lucide-react";

import { useAppContext } from "../context/AppContext";

// Custom Google Icon Component for proper coloring
const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

// Custom GitHub Icon Component
const GithubIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z" />
  </svg>
);

export function AuthView() {
  const navigate = useNavigate();
  const { user } = useAppContext();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/workspace");
    }
  }, [user, navigate]);

  const [isLoading, setIsLoading] = useState(false);

  // Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  // Validation State
  const [emailValid, setEmailValid] = useState<boolean | null>(null);
  const [passStrength, setPassStrength] = useState(0);

  useEffect(() => {
    if (email.length > 0) {
      const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      setEmailValid(isValid);
    } else {
      setEmailValid(null);
    }
  }, [email]);

  useEffect(() => {
    let strength = 0;
    if (password.length > 5) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;
    setPassStrength(strength);
  }, [password]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailValid) {
      toast.error("Invalid Email", { description: "Please enter a proper email address." });
      return;
    }
    setIsLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome Back", { description: "Establishing secure session..." });
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              avatar_url: `https://i.pravatar.cc/150?u=${email}`
            }
          }
        });
        if (error) throw error;
        toast.success("Account Created", { description: "Verification email dispatched." });
        setIsLogin(true);
      }
    } catch (error: any) {
      console.error(error);
      toast.error("Authentication Error", {
        description: error.message || "Unable to proceed with entry."
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
      toast.error(`Connection Failed`, { description: error.message });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 lg:p-8 relative overflow-hidden selection:bg-white/10 selection:text-white">
      {/* Back to Home Button */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        whileHover={{ x: -4, scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate("/")}
        className="absolute top-8 left-8 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xl text-white/40 hover:text-white hover:bg-white/[0.08] hover:border-white/20 transition-all group shadow-2xl"
      >
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
        <span className="text-[10px] font-black uppercase tracking-[0.3em]">Back to Home</span>
      </motion.button>

      {/* Enhanced Silky Cloth Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Layered Silk Waves */}
        <motion.div
          animate={{ y: [-20, 20, -20], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 z-0 bg-gradient-to-b from-[#0a0a0a] to-[#050505]"
        />

        {/* Animated Grid/Cloth Texture */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px)`,
            backgroundSize: '400px 400px'
          }}
        />

        {/* Dynamic Sheen Sweeps */}
        <motion.div
          animate={{ x: ['-200%', '200%'], opacity: [0, 0.2, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute top-0 bottom-0 w-[600px] bg-gradient-to-r from-transparent via-white/[0.03] to-transparent skew-x-[35deg]"
        />
      </div>

      <motion.div
        layout
        className="w-full max-w-[1000px] flex flex-col lg:flex-row bg-[#FAFAFA] rounded-[48px] shadow-[0_60px_120px_-30px_rgba(0,0,0,1)] overflow-hidden relative z-10 border border-white/20"
      >
        {/* Decorative Silky Panel (Desktop) */}
        <div className="hidden lg:flex w-[42%] bg-[#080808] relative flex-col justify-between p-16 text-white overflow-hidden">
          <div className="absolute inset-0 overflow-hidden opacity-40">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
              className="absolute -top-1/4 -left-1/4 w-[150%] h-[150%] border-[2px] border-white/[0.03] rounded-[48%] skew-y-12"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-black/80 via-transparent to-transparent z-10" />
          </div>

          <div className="relative z-20">
            <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-12 border border-white/10 backdrop-blur-md">
              <History className="w-7 h-7 text-white/80" />
            </div>
            <h1 className="text-5xl font-black leading-[0.9] tracking-tighter uppercase mb-6 italic">
              HackMate<br /><span className="text-white/20">Nexus</span>
            </h1>
            <div className="h-1 w-12 bg-white/10 rounded-full mb-6" />
            <p className="text-[11px] font-bold opacity-30 leading-relaxed max-w-[240px] uppercase tracking-widest">
              Securing the future of decentralized collaboration.
            </p>
          </div>

          <div className="relative z-20 space-y-8">
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 rounded-2xl border border-white/5 bg-white/[0.02] flex items-center justify-center">
                <Fingerprint className="w-6 h-6 text-white/40" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Security Clearance</p>
                <p className="text-sm font-black text-white/90">LEVEL_FOUR_ACCESS</p>
              </div>
            </div>
            <div className="h-px w-full bg-white/5 shadow-sm" />
            <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-[0.5em] text-white/10">
              <span>EST_2025</span>
              <span>SYSTEM_READY</span>
            </div>
          </div>
        </div>

        {/* Main Form Section */}
        <div className="flex-1 p-10 md:p-16 lg:p-20 flex flex-col justify-center bg-white relative">
          <div className="max-w-[380px] mx-auto w-full">
            <div className="mb-12">
              <h2 className="text-4xl font-black text-[#050505] tracking-tight mb-2 uppercase">
                {isLogin ? "Sign In" : "Sign Up"}
              </h2>
              <div className="h-1 w-8 bg-[#050505] rounded-full mb-4" />
              <p className="text-[11px] font-bold text-[#050505]/40 uppercase tracking-[0.2em]">
                {isLogin ? "Neural uplink requested" : "Establish new operative signature"}
              </p>
            </div>

            <form onSubmit={handleAuth} className="space-y-6">
              <AnimatePresence mode="popLayout" initial={false}>
                {!isLogin && (
                  <motion.div
                    key="name"
                    initial={{ opacity: 0, height: 0, scale: 0.95 }}
                    animate={{ opacity: 1, height: 'auto', scale: 1 }}
                    exit={{ opacity: 0, height: 0, scale: 0.95 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="space-y-2"
                  >
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#050505]/40 ml-1">
                      Full Name
                    </label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#050505]/20 group-focus-within:text-[#050505] transition-colors" />
                      <Input
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Operative Name"
                        className="pl-12 h-15 bg-[#050505]/[0.02] border-[#050505]/5 rounded-2xl font-bold text-sm text-[#050505] focus:bg-white focus:border-[#050505]/20 transition-all shadow-sm"
                        required={!isLogin}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-2">
                <div className="flex justify-between items-end px-1">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#050505]/40">
                    Email Identity
                  </label>
                  {emailValid !== null && (
                    <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-1">
                      {emailValid ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <XCircle className="w-3.5 h-3.5 text-red-500" />}
                    </motion.span>
                  )}
                </div>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#050505]/20 group-focus-within:text-[#050505] transition-colors" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@hackmate.sys"
                    className={cn(
                      "pl-12 h-15 bg-[#050505]/[0.02] border-[#050505]/5 rounded-2xl font-bold text-sm text-[#050505] focus:bg-white focus:border-[#050505]/20 transition-all shadow-sm uppercase",
                      emailValid === false && "border-red-500/30 bg-red-50/5"
                    )}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-end px-1">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#050505]/40">
                    Neural Passkey
                  </label>
                  {isLogin && (
                    <button type="button" className="text-[9px] font-black uppercase tracking-widest text-[#050505]/30 hover:text-[#050505] transition-colors hover:underline underline-offset-4">Lost Passkey?</button>
                  )}
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#050505]/20 group-focus-within:text-[#050505] transition-colors" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="pl-12 pr-12 h-15 bg-[#050505]/[0.02] border-[#050505]/5 rounded-2xl font-bold text-sm text-[#050505] focus:bg-white focus:border-[#050505]/20 transition-all shadow-sm tracking-[0.3em]"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#050505]/10 hover:text-[#050505] transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {!isLogin && password.length > 0 && (
                  <div className="px-1 pt-1">
                    <div className="h-1 w-full bg-[#050505]/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${passStrength}%` }}
                        className={cn(
                          "h-full transition-colors duration-500",
                          passStrength <= 25 ? "bg-red-500" :
                            passStrength <= 50 ? "bg-orange-500" :
                              passStrength <= 75 ? "bg-[#050505]" : "bg-emerald-500"
                        )}
                      />
                    </div>
                  </div>
                )}
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-16 rounded-[24px] text-[12px] font-black uppercase tracking-[0.5em] bg-[#050505] text-white hover:bg-black transition-all shadow-[0_20px_40px_rgba(0,0,0,0.2)] active:scale-98 group relative overflow-hidden mt-8"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <span className="relative z-10 flex items-center justify-center gap-3">
                    {isLogin ? "Authenticate" : "Initialize"}
                    <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                  </span>
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent skew-x-[45deg] -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              </Button>
            </form>

            <div className="relative my-12">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full h-px bg-[#050505]/5" />
              </div>
              <div className="relative flex justify-center text-[8px] font-black uppercase tracking-[0.4em] text-[#050505]/15">
                <span className="bg-white px-8 italic">Authorized Providers</span>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => handleOAuth('github')}
                disabled={isLoading}
                className="flex-1 h-15 rounded-2xl border border-[#050505]/5 flex items-center justify-center gap-3 hover:bg-[#050505]/[0.02] transition-all group overflow-hidden relative shadow-sm"
              >
                <div className="text-[#333] transition-transform group-hover:scale-110"><GithubIcon /></div>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#050505]/50 group-hover:text-[#050505]">GitHub</span>
              </button>
              <button
                onClick={() => handleOAuth('google')}
                disabled={isLoading}
                className="flex-1 h-15 rounded-2xl border border-[#050505]/5 flex items-center justify-center gap-3 hover:bg-[#050505]/[0.02] transition-all group overflow-hidden relative shadow-sm"
              >
                <div className="transition-transform group-hover:scale-110"><GoogleIcon /></div>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#050505]/50 group-hover:text-[#050505]">Google</span>
              </button>
            </div>

            <div className="mt-14 text-center">
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setFullName("");
                  setEmail("");
                  setPassword("");
                }}
                className="group inline-flex flex-col items-center gap-2"
              >
                <span className="text-[10px] font-bold text-[#050505]/20 uppercase tracking-widest">
                  {isLogin ? "No active unit?" : "Existing operative?"}
                </span>
                <span className="text-[11px] font-black text-[#050505] uppercase tracking-[0.2em] relative">
                  {isLogin ? "Request Access" : "Secure Log In"}
                  <div className="absolute -bottom-1.5 left-0 w-full h-[3px] bg-[#050505] scale-x-0 group-hover:scale-x-100 transition-transform origin-left rounded-full" />
                </span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Security Footer */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-12 opacity-30 pointer-events-none transition-opacity hover:opacity-100">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-4 h-4 text-white" />
          <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white">Quantum Secured</span>
        </div>
        <div className="flex items-center gap-3">
          <Waves className="w-4 h-4 text-white" />
          <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white">Neural Uplink</span>
        </div>
      </div>
    </div>
  );
}
