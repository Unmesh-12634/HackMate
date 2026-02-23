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
        sm: "w-8 h-8",
        md: "w-16 h-16",
        lg: "w-24 h-24",
        xl: "w-32 h-32"
    };

    const iconSizes = {
        sm: "w-4 h-4",
        md: "w-7 h-7",
        lg: "w-10 h-10",
        xl: "w-14 h-14"
    };

    // SVG Shapes for masks
    const renderShape = () => {
        switch (badge.shape) {
            case "Hexagon":
                return "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)";
            case "Shield":
                return "polygon(0% 0%, 100% 0%, 100% 75%, 50% 100%, 0% 75%)";
            case "Diamond":
                return "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)";
            case "Circle":
                return "circle(50% at 50% 50%)";
            default:
                return "circle(50% at 50% 50%)";
        }
    };

    return (
        <div className={cn("flex flex-col items-center gap-2 group", className)}>
            <motion.div
                whileHover={!locked ? { scale: 1.1, rotate: 5 } : {}}
                className={cn(
                    "relative flex items-center justify-center transition-all duration-500",
                    sizeClasses[size],
                    locked ? "grayscale opacity-40 brightness-50" : badge.glow
                )}
            >
                {/* Outer Glow / Halo */}
                {!locked && (
                    <div
                        className={cn(
                            "absolute -inset-2 bg-gradient-to-br opacity-20 blur-xl z-0",
                            badge.color
                        )}
                        style={{ clipPath: renderShape() }}
                    />
                )}

                {/* Background Shape with Gradient */}
                <div
                    className={cn(
                        "absolute inset-0 bg-gradient-to-br shadow-2xl",
                        badge.color
                    )}
                    style={{ clipPath: renderShape() }}
                />

                {/* Secondary Inner Shadow for Depth */}
                <div
                    className="absolute inset-[1px] bg-black/20 z-10"
                    style={{ clipPath: renderShape() }}
                />

                {/* Border Overlay / Glass Texture */}
                <div
                    className="absolute inset-[2px] bg-card/90 backdrop-blur-sm z-20 border border-white/10"
                    style={{ clipPath: renderShape() }}
                />

                {/* Tier-based Accent Ring */}
                {!locked && (
                    <div
                        className={cn(
                            "absolute inset-[4px] opacity-40 z-[25]",
                            badge.color
                        )}
                        style={{
                            clipPath: renderShape(),
                            padding: '2px'
                        }}
                    >
                        <div className="w-full h-full bg-card" style={{ clipPath: renderShape() }} />
                    </div>
                )}

                {/* Icon */}
                <div className="relative z-30 flex items-center justify-center">
                    <Icon className={cn(iconSizes[size], locked ? "text-muted-foreground" : "text-foreground")} />
                </div>

                {/* Shine Effect */}
                {!locked && (
                    <motion.div
                        initial={{ left: "-100%" }}
                        animate={{ left: "200%" }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear", repeatDelay: 2 }}
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 z-40 w-1/2 h-full pointer-events-none"
                    />
                )}
            </motion.div>

            {showLabel && (
                <div className="text-center">
                    <p className={cn(
                        "text-[10px] font-black uppercase tracking-widest",
                        locked ? "text-muted-foreground" : "text-foreground"
                    )}>
                        {badge.name}
                    </p>
                    <p className="text-[8px] text-muted-foreground font-black uppercase tracking-[0.2em] mt-0.5">
                        {badge.tier}
                    </p>
                </div>
            )}
        </div>
    );
}
