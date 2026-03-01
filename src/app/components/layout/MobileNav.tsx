import React from "react";
import { motion } from "motion/react";
import { useNavigate, useLocation } from "react-router-dom";
import {
    LayoutDashboard,
    Target,
    Globe,
    Trophy,
    User,
    Settings
} from "lucide-react";
import { cn } from "../ui/button";
import { useAppContext } from "../../context/AppContext";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

export function MobileNav() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAppContext();

    const navItems = [
        { id: "workspace", label: "Work", icon: LayoutDashboard, path: "/workspace" },
        { id: "productivity", label: "Ops", icon: Target, path: "/productivity" },
        { id: "community", label: "Net", icon: Globe, path: "/community" },
        { id: "achievements", label: "XP", icon: Trophy, path: "/achievements" },
        { id: "profile", label: "Me", icon: User, path: "/profile" },
    ];

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[100] bg-card/80 backdrop-blur-xl border-t border-border/50 pb-safe shadow-[0_-8px_32px_rgba(0,0,0,0.3)]">
            <div className="flex items-center justify-around h-16 px-2 max-w-lg mx-auto">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path || (item.path !== "/workspace" && location.pathname.startsWith(item.path));

                    return (
                        <button
                            key={item.id}
                            onClick={() => navigate(item.path)}
                            className="flex flex-col items-center justify-center gap-1 min-w-[64px] relative group"
                        >
                            <div className={cn(
                                "w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300",
                                isActive
                                    ? "bg-hack-blue/20 text-hack-blue shadow-[0_0_15px_rgba(59,130,246,0.2)]"
                                    : "text-muted-foreground hover:bg-secondary/50",
                                item.id === "profile" && "p-0 bg-transparent shadow-none"
                            )}>
                                {item.id === "profile" && user?.avatar ? (
                                    <Avatar className={cn("w-7 h-7 border-2", isActive ? "border-hack-blue shadow-[0_0_10px_rgba(59,130,246,0.3)]" : "border-border/50")}>
                                        <AvatarImage src={user.avatar} />
                                        <AvatarFallback className="bg-hack-blue/20 text-hack-blue text-[8px] font-black">
                                            {user.name?.[0]?.toUpperCase() || 'ME'}
                                        </AvatarFallback>
                                    </Avatar>
                                ) : (
                                    <item.icon className={cn("w-5 h-5", isActive && "stroke-[2.5px]")} />
                                )}
                            </div>
                            <span className={cn(
                                "text-[10px] font-black uppercase tracking-widest transition-all duration-300",
                                isActive ? "text-hack-blue opacity-100" : "text-muted-foreground/60 opacity-80"
                            )}>
                                {item.label}
                            </span>

                            {isActive && (
                                <motion.div
                                    layoutId="mobile-nav-indicator"
                                    className="absolute -top-1 w-1 h-1 bg-hack-blue rounded-full shadow-[0_0_8px_rgba(59,130,246,0.8)]"
                                />
                            )}
                        </button>
                    );
                })}
            </div>
        </nav>
    );
}
