import React from "react";
import { cn } from "./ui/utils";
import { motion } from "motion/react";
import { BadgeDefinition } from "../data/badges";

interface PremiumBadgeProps {
    badge: BadgeDefinition;
    locked?: boolean;
    size?: "sm" | "md" | "lg" | "xl";
    showLabel?: boolean;
    className?: string;
}

export function PremiumBadge({
    badge,
    locked = false,
    size = "md",
    showLabel = true,
    className
}: PremiumBadgeProps) {
    const Icon = badge.icon;

    const sizeClasses = {
        sm: "w-10 h-10",
        md: "w-20 h-20",
        lg: "w-28 h-28",
        xl: "w-36 h-36"
    };

    const iconSizes = {
        sm: "w-4 h-4",
        md: "w-8 h-8",
        lg: "w-12 h-12",
        xl: "w-16 h-16"
    };

    // Advanced SVG Paths for the "Perfect" look
    const getPath = () => {
        switch (badge.shape) {
            case "Hexagon":
                return "M50 2L95 25V75L50 98L5 75V25L50 2Z";
            case "Shield":
                return "M50 2L92 15V55C92 80 50 98 50 98C50 98 8 80 8 55V15L50 2Z";
            case "Diamond":
                return "M50 5L95 50L50 95L5 50L50 5Z";
            default:
                return "M50 2C76.5 2 98 23.5 98 50C98 76.5 76.5 98 50 98C23.5 98 2 76.5 2 50C2 23.5 23.5 2 50 2Z";
        }
    };

    const tierColors = {
        Bronze: "from-[#CD7F32] via-[#E6A05A] to-[#804A00]",
        Silver: "from-[#C0C0C0] via-[#E8E8E8] to-[#707070]",
        Gold: "from-[#FFD700] via-[#FFF38C] to-[#B8860B]",
        Platinum: "from-[#E5E4E2] via-[#FFFFFF] to-[#A0B2C6]",
        Diamond: "from-[#B9F2FF] via-[#FFFFFF] to-[#4582EC]",
    };

    const auraColors = {
        Bronze: "shadow-[#CD7F32]/20",
        Silver: "shadow-[#C0C0C0]/20",
        Gold: "shadow-[#FFD700]/40",
        Platinum: "shadow-[#E5E4E2]/50",
        Diamond: "shadow-[#B9F2FF]/60",
    };

    return (
        <div className={cn("flex flex-col items-center gap-3 group select-none", className)}>
            <motion.div
                whileHover={!locked ? {
                    scale: 1.15,
                    rotateY: 15,
                    rotateX: -10,
                    transition: { type: "spring", stiffness: 300, damping: 15 }
                } : {}}
                style={{ perspective: "1000px" }}
                className={cn(
                    "relative flex items-center justify-center transition-all duration-700",
                    sizeClasses[size],
                    locked ? "grayscale opacity-30 brightness-50" : auraColors[badge.tier]
                )}
            >
                {/* SVG DEF FOR CLIPPING */}
                <svg className="absolute w-0 h-0">
                    <defs>
                        <clipPath id={`badge-clip-${badge.id}-${size}`} clipPathUnits="objectBoundingBox">
                            <path d="M0.5,0.02 L0.95,0.25 V0.75 L0.5,0.98 L0.05,0.75 V0.25 L0.5,0.02 Z" transform="scale(0.01)" />
                        </clipPath>
                        {/* More precise clip paths based on shape */}
                        <clipPath id={`shape-${badge.shape}`} clipPathUnits="objectBoundingBox">
                            {badge.shape === "Hexagon" && <path d="M0.5,0 L0.95,0.25 V0.75 L0.5,1 L0.05,0.75 V0.25 L0.5,0" />}
                            {badge.shape === "Shield" && <path d="M0.5,0 L0.94,0.15 V0.6 C0.94,0.85 0.5,1 0.5,1 C0.5,1 0.06,0.85 0.06,0.6 V0.15 L0.5,0" />}
                            {badge.shape === "Diamond" && <path d="M0.5,0 L1,0.5 L0.5,1 L0,0.5 L0.5,0" />}
                            {badge.shape === "Circle" && <circle cx="0.5" cy="0.5" r="0.5" />}
                        </clipPath>
                    </defs>
                </svg>

                {/* LAYER 0: AURA (External Glow) */}
                {!locked && (
                    <motion.div
                        animate={{
                            scale: [1, 1.1, 1],
                            opacity: [0.3, 0.5, 0.3]
                        }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className={cn(
                            "absolute -inset-4 bg-gradient-to-br transition-all duration-1000 blur-2xl z-0 rounded-full",
                            tierColors[badge.tier as keyof typeof tierColors] || "from-hack-blue/30 to-transparent"
                        )}
                    />
                )}

                {/* LAYER 1: BEZEL (The Metallic Border) */}
                <div
                    className={cn(
                        "absolute inset-0 bg-gradient-to-br shadow-inner z-10",
                        locked ? "bg-slate-800" : tierColors[badge.tier as keyof typeof tierColors]
                    )}
                    style={{ clipPath: `url(#shape-${badge.shape})` }}
                />

                {/* LAYER 2: GLASS CORE */}
                <div
                    className="absolute inset-[3px] bg-slate-950/80 backdrop-blur-sm z-20 flex items-center justify-center overflow-hidden"
                    style={{ clipPath: `url(#shape-${badge.shape})` }}
                >
                    {/* Internal Radial Glow */}
                    <div className={cn(
                        "absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,var(--tw-gradient-from)_0%,transparent_70%)]",
                        badge.color
                    )} />

                    {/* Scanlines / Grid Detail */}
                    <div className="absolute inset-0 opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />

                    {/* Sweeping Shine Flare */}
                    {!locked && (
                        <motion.div
                            initial={{ x: "-150%", rotate: 25 }}
                            animate={{ x: "250%" }}
                            transition={{
                                duration: badge.tier === "Diamond" ? 2 : 4,
                                repeat: Infinity,
                                ease: "easeInOut",
                                repeatDelay: 1
                            }}
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent w-full h-full skew-x-12 z-40 pointer-events-none"
                        />
                    )}
                </div>

                {/* LAYER 3: THE ICON */}
                <div className="relative z-30 flex items-center justify-center drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                    <Icon className={cn(
                        iconSizes[size],
                        locked ? "text-slate-600" : "text-white"
                    )} />
                </div>
            </motion.div>

            {showLabel && (
                <div className="text-center space-y-1">
                    <p className={cn(
                        "text-[10px] font-black uppercase tracking-[0.2em]",
                        locked ? "text-slate-600" : "text-white"
                    )}>
                        {badge.name}
                    </p>
                    <div className="flex items-center justify-center gap-1.5">
                        <span className={cn(
                            "w-1.5 h-1.5 rounded-full",
                            locked ? "bg-slate-700" : "bg-hack-blue shadow-[0_0_5px_rgba(0,119,255,0.8)]"
                        )} />
                        <p className="text-[8px] text-muted-foreground font-black uppercase tracking-[0.3em]">
                            {badge.tier}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
