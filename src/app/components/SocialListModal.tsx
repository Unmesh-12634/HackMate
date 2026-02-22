import React from "react";
import { motion } from "motion/react";
import { X, Users, ArrowUpRight } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { User } from "../context/AppContext";

interface SocialListModalProps {
    type: "followers" | "following";
    users: User[];
    loading: boolean;
    onClose: () => void;
    onViewProfile: (id: string) => void;
}

export function SocialListModal({ type, users, loading, onClose, onViewProfile }: SocialListModalProps) {
    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="w-full max-w-md bg-[#0F172A] border border-white/[0.08] rounded-2xl shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[70vh]"
            >
                <div className="p-5 border-b border-white/[0.05] flex items-center justify-between bg-white/[0.02]">
                    <h3 className="text-lg font-bold text-slate-100 uppercase tracking-tight">
                        {type === "followers" ? "Your Followers" : "Users You Follow"}
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-slate-400 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12 space-y-4">
                            <div className="w-8 h-8 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Synchronizing_Grid...</p>
                        </div>
                    ) : users.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center px-6">
                            <Users className="w-12 h-12 text-slate-800 mb-4" />
                            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest">No Connections Found</h4>
                            <p className="text-xs text-slate-600 mt-2">Expand your network to synchronize more operatives.</p>
                        </div>
                    ) : (
                        users.map(u => (
                            <div
                                key={u.id}
                                onClick={() => onViewProfile(u.id)}
                                className="flex items-center justify-between p-3 hover:bg-white/[0.03] rounded-xl transition-all group cursor-pointer border border-transparent hover:border-white/[0.05]"
                            >
                                <div className="flex items-center gap-3">
                                    <Avatar className="w-10 h-10 border border-white/[0.05]">
                                        <AvatarImage src={u.avatar} />
                                        <AvatarFallback>{u.name[0]}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-slate-200 group-hover:text-blue-400 transition-colors">{u.name}</span>
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{u.role}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="flex flex-col items-end mr-2">
                                        <span className="text-[9px] font-black text-blue-500/80 uppercase tracking-widest">{u.rank}</span>
                                        <span className="text-[11px] font-black text-slate-400">XP: {u.reputation}</span>
                                    </div>
                                    <ArrowUpRight className="w-4 h-4 text-slate-600 group-hover:text-blue-500 transition-all" />
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </motion.div>
        </div>
    );
}
