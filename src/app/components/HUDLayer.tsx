import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useAppContext } from "../context/AppContext";
import { Shield, Zap, AlertTriangle, Flame, TrendingUp } from "lucide-react";
import { cn } from "./ui/utils";

export const HUDLayer: React.FC = () => {
    const { hudEvent, setHudEvent } = useAppContext();
    const [activeHUD, setActiveHUD] = useState<{ type: string; payload: any } | null>(null);

    useEffect(() => {
        if (hudEvent) {
            setActiveHUD(hudEvent);
            // Auto-clear HUD after animation
            const timer = setTimeout(() => {
                setHudEvent(null);
                setActiveHUD(null);
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [hudEvent, setHudEvent]);

    return (
        <AnimatePresence>
            {activeHUD && (
                <div className="fixed inset-0 z-[200] pointer-events-none flex items-center justify-center p-8 overflow-hidden">
                    {activeHUD.type === 'ROLE_UPGRADE' && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.2 }}
                            className="relative flex flex-col items-center"
                        >
                            {/* Background Flash */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: [0, 0.5, 0], scale: [0.5, 2, 3] }}
                                transition={{ duration: 1.5 }}
                                className="absolute inset-0 bg-hack-blue rounded-full blur-[120px]"
                            />

                            <div className="relative z-10 bg-black/60 backdrop-blur-3xl border border-hack-blue/50 p-12 rounded-[48px] shadow-[0_0_100px_rgba(37,99,235,0.3)] text-center space-y-8 max-w-lg">
                                <div className="w-24 h-24 bg-hack-blue rounded-3xl mx-auto flex items-center justify-center shadow-[0_0_40px_rgba(37,99,235,0.6)]">
                                    <Shield className="w-12 h-12 text-white animate-pulse" />
                                </div>

                                <div className="space-y-4">
                                    <h2 className="text-[12px] font-black uppercase tracking-[0.6em] text-hack-blue">Neural Link Data Update</h2>
                                    <h1 className="text-4xl font-black uppercase tracking-tighter text-white font-mono leading-none">
                                        Protocol <span className="text-hack-blue">Upgraded</span>.
                                    </h1>
                                </div>

                                <div className="py-6 px-8 bg-hack-blue/10 rounded-2xl border border-hack-blue/20">
                                    <p className="text-sm font-bold text-white uppercase tracking-widest leading-relaxed">
                                        Operative <span className="text-hack-blue">{activeHUD.payload.memberName}</span> has been designated:
                                    </p>
                                    <div className="mt-4 text-2xl font-black text-hack-blue uppercase tracking-tighter font-mono italic">
                                        {activeHUD.payload.role}
                                    </div>
                                </div>

                                <div className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">
                                    <Zap className="w-3 h-3 text-hack-blue" /> System Sync Complete
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeHUD.type === 'PROTOCOL_UPDATE' && (
                        <motion.div
                            initial={{ x: 100, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -100, opacity: 0 }}
                            className="absolute bottom-12 right-12 bg-black/80 backdrop-blur-2xl border-l-4 border-hack-blue p-8 rounded-2xl shadow-2xl max-w-sm pointer-events-auto"
                        >
                            <div className="flex items-start gap-6">
                                <div className="w-12 h-12 rounded-xl bg-hack-blue/20 flex items-center justify-center text-hack-blue shrink-0">
                                    <AlertTriangle className="w-6 h-6" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-hack-blue">Tactical Alert</h3>
                                    <p className="text-sm font-black uppercase text-white leading-tight">Mission Protocols have been re-calibrated by the leader.</p>
                                    <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-muted-foreground pt-2">
                                        <TrendingUp className="w-3 h-3" /> Security Level: Modified
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeHUD.type === 'MEMBER_REMOVED' && (
                        <motion.div
                            initial={{ y: -50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 50, opacity: 0 }}
                            className="absolute top-12 bg-rose-500/20 backdrop-blur-2xl border border-rose-500/50 p-6 rounded-full shadow-[0_0_50px_rgba(244,63,94,0.2)] flex items-center gap-4"
                        >
                            <div className="w-8 h-8 rounded-full bg-rose-500 flex items-center justify-center text-white">
                                <Flame className="w-4 h-4" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white">
                                Operative <span className="text-rose-400">{activeHUD.payload.memberName}</span> Link Terminated
                            </span>
                        </motion.div>
                    )}
                </div>
            )}
        </AnimatePresence>
    );
};
