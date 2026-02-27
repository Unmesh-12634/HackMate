import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
    Trophy,
    Target,
    CheckCircle2,
    Clock,
    Zap,
    ChevronRight,
    Loader2,
    ShieldCheck,
    Star
} from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card } from "./ui/card";
import { cn } from "./ui/utils";

interface DebriefStat {
    id: string;
    name: string;
    tasksDone: number;
    performance: number;
    xpEarned: number;
}

interface MissionDebriefModalProps {
    isOpen: boolean;
    onClose: () => void;
    missionName: string;
    missionGoal: string;
    stats: DebriefStat[];
    totalXP: number;
    isLeader: boolean;
    onRedeploy: () => void;
}

export function MissionDebriefModal({
    isOpen,
    onClose,
    missionName,
    missionGoal,
    stats,
    totalXP,
    isLeader,
    onRedeploy
}: MissionDebriefModalProps) {
    const [step, setStep] = useState(1); // 1: Stats, 2: XP Distribution

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-[#020617]/95 backdrop-blur-xl"
                    onClick={onClose}
                />

                <motion.div
                    initial={{ scale: 0.9, y: 20, opacity: 0 }}
                    animate={{ scale: 1, y: 0, opacity: 1 }}
                    exit={{ scale: 0.9, y: 20, opacity: 0 }}
                    className="relative w-full max-w-4xl bg-card border border-white/10 rounded-[2.5rem] shadow-2xl shadow-black/50 overflow-hidden"
                >
                    {/* Header: Tactical Glow */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-hack-blue to-transparent opacity-50" />

                    <div className="p-8 md:p-12">
                        {/* Top Navigation */}
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-hack-blue/10 border border-hack-blue/20">
                                    <ShieldCheck className="w-5 h-5 text-hack-blue" />
                                </div>
                                <div>
                                    <h3 className="text-[10px] font-black text-hack-blue uppercase tracking-[0.3em]">Operation Debrief</h3>
                                    <h2 className="text-2xl font-black text-white uppercase tracking-tighter">{missionName}</h2>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Badge variant="outline" className="border-hack-blue/20 text-hack-blue bg-hack-blue/5">
                                    SUCCESSFUL
                                </Badge>
                                <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
                                    <Loader2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {step === 1 ? (
                                <>
                                    {/* Left: Mission Overview */}
                                    <div className="md:col-span-1 space-y-6">
                                        <Card className="p-6 bg-white/5 border-white/10 rounded-3xl">
                                            <h4 className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-4">Mission Objective</h4>
                                            <p className="text-sm text-white/80 leading-relaxed italic">"{missionGoal}"</p>
                                        </Card>

                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                                                <div className="flex items-center gap-3">
                                                    <Target className="w-4 h-4 text-emerald-400" />
                                                    <span className="text-xs text-white/60">Squad Velocity</span>
                                                </div>
                                                <span className="text-sm font-black text-emerald-400">92%</span>
                                            </div>
                                            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                                                <div className="flex items-center gap-3">
                                                    <Clock className="w-4 h-4 text-amber-400" />
                                                    <span className="text-xs text-white/60">Time Adherence</span>
                                                </div>
                                                <span className="text-sm font-black text-amber-400">EXCELLENT</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right: Member Performance Feed */}
                                    <div className="md:col-span-2 space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                        <h4 className="text-[10px] font-black text-white/40 uppercase tracking-widest px-2">Squad Breakdown</h4>
                                        {stats.map((s, i) => (
                                            <motion.div
                                                initial={{ x: 20, opacity: 0 }}
                                                animate={{ x: 0, opacity: 1 }}
                                                transition={{ delay: i * 0.1 }}
                                                key={s.id}
                                                className="group p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl transition-all"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center font-black text-xs">
                                                            {s.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-white">{s.name}</p>
                                                            <p className="text-[10px] text-white/40 uppercase tracking-tighter">{s.tasksDone} Tasks Synchronized</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="flex items-center gap-2 justify-end mb-1">
                                                            <Zap className="w-3 h-3 text-hack-blue animate-pulse" />
                                                            <span className="text-sm font-black text-hack-blue">+{s.xpEarned} XP</span>
                                                        </div>
                                                        <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                            <motion.div
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${s.performance}%` }}
                                                                transition={{ duration: 1, delay: 0.5 }}
                                                                className="h-full bg-hack-blue shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div className="md:col-span-3 flex flex-col items-center justify-center py-20">
                                    <motion.div
                                        initial={{ scale: 0.5, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        className="relative mb-12"
                                    >
                                        <div className="absolute inset-0 bg-hack-blue/20 blur-[100px] rounded-full animate-pulse" />
                                        <div className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-br from-hack-blue to-blue-700 border-4 border-white/20 flex items-center justify-center shadow-2xl relative">
                                            <Trophy className="w-16 h-16 text-white" />
                                            <div className="absolute -top-4 -right-4 p-3 bg-hack-blue-dark border border-white/20 rounded-2xl shadow-xl">
                                                <Star className="w-6 h-6 text-white fill-white" />
                                            </div>
                                        </div>
                                    </motion.div>

                                    <h2 className="text-4xl font-black text-white uppercase tracking-tighter mb-2">XP Distributed</h2>
                                    <p className="text-white/40 text-sm mb-12 uppercase tracking-[0.4em]">Unit Level Synchronized</p>

                                    {isLeader && (
                                        <Button
                                            onClick={onRedeploy}
                                            className="bg-hack-blue hover:bg-blue-600 text-white font-black uppercase tracking-widest h-14 px-12 rounded-2xl shadow-xl shadow-hack-blue/20"
                                        >
                                            Redeploy Squad <ChevronRight className="ml-2 w-5 h-5" />
                                        </Button>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Footer Action */}
                        {step === 1 && (
                            <div className="mt-12 flex justify-end">
                                <Button
                                    onClick={() => setStep(2)}
                                    className="bg-white/10 hover:bg-white/20 text-white font-black uppercase tracking-widest px-8 rounded-xl h-12"
                                >
                                    Proceed to Rewards <ChevronRight className="ml-2 w-4 h-4" />
                                </Button>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
