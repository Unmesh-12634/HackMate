"use client";
import React, { useState, useEffect, useRef } from "react";
import { ArrowRight, Link, Zap } from "lucide-react";
import { Badge } from "./badge";
import { Button } from "./button";
import { Card, CardContent, CardHeader, CardTitle } from "./card";

interface TimelineItem {
    id: number;
    title: string;
    date: string;
    content: string;
    category: string;
    icon: React.ElementType;
    relatedIds: number[];
    status: "completed" | "in-progress" | "pending";
    energy: number;
}

interface RadialOrbitalTimelineProps {
    timelineData: TimelineItem[];
}

export default function RadialOrbitalTimeline({
    timelineData,
}: RadialOrbitalTimelineProps) {
    const [expandedItems, setExpandedItems] = useState<Record<number, boolean>>(
        {}
    );
    const [viewMode] = useState<"orbital">("orbital");
    const [rotationAngle, setRotationAngle] = useState<number>(0);
    const [autoRotate, setAutoRotate] = useState<boolean>(true);
    const [pulseEffect, setPulseEffect] = useState<Record<number, boolean>>({});
    const [centerOffset] = useState<{ x: number; y: number }>({
        x: 0,
        y: 0,
    });
    const [activeNodeId, setActiveNodeId] = useState<number | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const orbitRef = useRef<HTMLDivElement>(null);
    const nodeRefs = useRef<Record<number, HTMLDivElement | null>>({});

    const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === containerRef.current || e.target === orbitRef.current) {
            setExpandedItems({});
            setActiveNodeId(null);
            setPulseEffect({});
            setAutoRotate(true);
        }
    };

    const toggleItem = (id: number) => {
        setExpandedItems((prev) => {
            const newState = { ...prev };
            Object.keys(newState).forEach((key) => {
                if (parseInt(key) !== id) {
                    newState[parseInt(key)] = false;
                }
            });

            newState[id] = !prev[id];

            if (!prev[id]) {
                setActiveNodeId(id);
                setAutoRotate(false);

                const relatedItems = getRelatedItems(id);
                const newPulseEffect: Record<number, boolean> = {};
                relatedItems.forEach((relId) => {
                    newPulseEffect[relId] = true;
                });
                setPulseEffect(newPulseEffect);

                centerViewOnNode(id);
            } else {
                setActiveNodeId(null);
                setAutoRotate(true);
                setPulseEffect({});
            }

            return newState;
        });
    };

    useEffect(() => {
        let rotationTimer: any;

        if (autoRotate && viewMode === "orbital") {
            rotationTimer = setInterval(() => {
                setRotationAngle((prev) => {
                    const newAngle = (prev + 0.3) % 360;
                    return Number(newAngle.toFixed(3));
                });
            }, 50);
        }

        return () => {
            if (rotationTimer) {
                clearInterval(rotationTimer);
            }
        };
    }, [autoRotate, viewMode]);

    const centerViewOnNode = (nodeId: number) => {
        if (viewMode !== "orbital") return;

        const nodeIndex = timelineData.findIndex((item) => item.id === nodeId);
        const totalNodes = timelineData.length;
        const targetAngle = (nodeIndex / totalNodes) * 360;

        // Center the active node at the top (270 degrees in this coordinate system)
        setRotationAngle(270 - targetAngle);
    };

    const calculateNodePosition = (index: number, total: number) => {
        const angle = ((index / total) * 360 + rotationAngle) % 360;
        const radius = 200;
        const radian = (angle * Math.PI) / 180;

        const x = radius * Math.cos(radian) + centerOffset.x;
        const y = radius * Math.sin(radian) + centerOffset.y;

        const zIndex = Math.round(100 + 50 * Math.cos(radian));
        const opacity = Math.max(
            0.4,
            Math.min(1, 0.4 + 0.6 * ((1 + Math.sin(radian)) / 2))
        );

        return { x, y, angle, zIndex, opacity };
    };

    const getRelatedItems = (itemId: number): number[] => {
        const currentItem = timelineData.find((item) => item.id === itemId);
        return currentItem ? currentItem.relatedIds : [];
    };

    const isRelatedToActive = (itemId: number): boolean => {
        if (!activeNodeId) return false;
        const relatedItems = getRelatedItems(activeNodeId);
        return relatedItems.includes(itemId);
    };

    const getStatusStyles = (status: TimelineItem["status"]): string => {
        switch (status) {
            case "completed":
                return "text-white bg-blue-600 border-blue-400";
            case "in-progress":
                return "text-black bg-white border-black";
            case "pending":
                return "text-white bg-white/10 border-white/20";
            default:
                return "text-white bg-black/40 border-white/50";
        }
    };

    return (
        <div
            className="w-full h-[650px] flex flex-col items-center justify-center bg-transparent overflow-hidden relative group/container"
            ref={containerRef}
            onClick={handleContainerClick}
        >
            {/* HUD Instruction Overlay */}
            <div className="absolute top-10 left-1/2 -translate-x-1/2 z-20 pointer-events-none flex flex-col items-center gap-2">
                <div className="flex items-center gap-4 px-6 py-2 rounded-full border border-blue-500/20 bg-blue-500/5 backdrop-blur-md">
                    <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400">
                            System Status: Decrypting
                        </span>
                    </div>
                    <div className="h-3 w-px bg-blue-500/20" />
                    <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500 animate-pulse">
                        Click nodes to analyze capabilities
                    </span>
                </div>
            </div>

            <div className="relative w-full max-w-4xl h-full flex items-center justify-center pt-20">
                <div
                    className="absolute w-full h-full flex items-center justify-center"
                    ref={orbitRef}
                    style={{
                        perspective: "1000px",
                        transform: `translate(${centerOffset.x}px, ${centerOffset.y}px)`,
                    }}
                >
                    {/* Central Core */}
                    <div className="absolute w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 via-blue-400 to-indigo-600 animate-pulse flex items-center justify-center z-10 shadow-[0_0_30px_rgba(37,99,235,0.4)]">
                        <div className="absolute w-20 h-20 rounded-full border border-blue-500/20 animate-ping-slow opacity-70"></div>
                        <div
                            className="absolute w-24 h-24 rounded-full border border-blue-500/10 animate-ping-slow opacity-50"
                            style={{ animationDelay: "1s" }}
                        ></div>
                        <div className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-md"></div>
                    </div>

                    {/* Orbit Ring */}
                    <div className="absolute w-96 h-96 rounded-full border border-white/5 shadow-[inset_0_0_50px_rgba(255,255,255,0.02)]"></div>

                    {timelineData.map((item, index) => {
                        const position = calculateNodePosition(index, timelineData.length);
                        const isExpanded = expandedItems[item.id];
                        const isRelated = isRelatedToActive(item.id);
                        const isPulsing = pulseEffect[item.id];
                        const Icon = item.icon;

                        const nodeStyle = {
                            transform: `translate(${position.x}px, ${position.y}px)`,
                            zIndex: isExpanded ? 200 : position.zIndex,
                            opacity: isExpanded ? 1 : position.opacity,
                        };

                        return (
                            <div
                                key={item.id}
                                ref={(el) => { nodeRefs.current[item.id] = el; }}
                                className="absolute transition-all duration-700 cursor-pointer"
                                style={nodeStyle}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleItem(item.id);
                                }}
                            >
                                {/* Glow Effect */}
                                <div
                                    className={`absolute rounded-full -inset-1 ${isPulsing ? "animate-pulse-subtle" : ""
                                        }`}
                                    style={{
                                        background: `radial-gradient(circle, rgba(59,130,246,0.3) 0%, rgba(59,130,246,0) 70%)`,
                                        width: `${item.energy * 0.5 + 60}px`,
                                        height: `${item.energy * 0.5 + 60}px`,
                                        left: `-${(item.energy * 0.5 + 60 - 40) / 2}px`,
                                        top: `-${(item.energy * 0.5 + 60 - 40) / 2}px`,
                                    }}
                                ></div>

                                {/* Node Icon */}
                                <div
                                    className={`
                  w-12 h-12 rounded-xl flex items-center justify-center
                  ${isExpanded
                                            ? "bg-blue-600 text-white"
                                            : isRelated
                                                ? "bg-blue-500/40 text-white"
                                                : "bg-[#0f172a] text-blue-400"
                                        }
                  border 
                  ${isExpanded
                                            ? "border-blue-400 shadow-[0_0_20px_rgba(37,99,235,0.5)]"
                                            : isRelated
                                                ? "border-blue-400/50 animate-pulse"
                                                : "border-white/10"
                                        }
                  transition-all duration-300 transform
                  ${isExpanded ? "scale-125" : "hover:scale-110"}
                `}
                                >
                                    <Icon size={20} />
                                </div>

                                {/* Node Label */}
                                <div
                                    className={`
                  absolute top-16 left-1/2 -translate-x-1/2 whitespace-nowrap
                  text-[10px] font-black uppercase tracking-[0.2em]
                  transition-all duration-300
                  ${isExpanded ? "text-white scale-110" : "text-slate-500"}
                `}
                                >
                                    {item.title}
                                </div>

                                {isExpanded && (
                                    <Card className="absolute top-24 left-1/2 -translate-x-1/2 w-72 bg-[#0f172a]/95 backdrop-blur-xl border-white/10 shadow-2xl shadow-black/50 overflow-visible z-[300]">
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-px h-3 bg-blue-500/50"></div>
                                        <CardHeader className="p-4 pb-2">
                                            <div className="flex justify-between items-center">
                                                <Badge
                                                    variant="outline"
                                                    className={`px-2 py-0 text-[8px] font-black tracking-widest uppercase ${getStatusStyles(
                                                        item.status
                                                    )}`}
                                                >
                                                    {item.status.replace('-', ' ')}
                                                </Badge>
                                                <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">
                                                    {item.date}
                                                </span>
                                            </div>
                                            <CardTitle className="text-sm font-black uppercase tracking-tight text-white mt-2">
                                                {item.title}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-4 pt-0 text-[10px] font-bold text-slate-400 leading-relaxed uppercase tracking-wider">
                                            <p>{item.content}</p>

                                            <div className="mt-4 pt-4 border-t border-white/5">
                                                <div className="flex justify-between items-center text-[9px] mb-2 font-black uppercase tracking-widest text-slate-500">
                                                    <span className="flex items-center">
                                                        <Zap size={10} className="mr-1 text-blue-500" />
                                                        Efficiency Output
                                                    </span>
                                                    <span className="text-blue-400">{item.energy}%</span>
                                                </div>
                                                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-1000"
                                                        style={{ width: `${item.energy}%` }}
                                                    ></div>
                                                </div>
                                            </div>

                                            {item.relatedIds.length > 0 && (
                                                <div className="mt-4 pt-4 border-t border-white/5">
                                                    <div className="flex items-center mb-3">
                                                        <Link size={10} className="text-blue-500 mr-2" />
                                                        <h4 className="text-[9px] uppercase tracking-[0.3em] font-black text-slate-500">
                                                            Linked Modules
                                                        </h4>
                                                    </div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {item.relatedIds.map((relatedId) => {
                                                            const relatedItem = timelineData.find(
                                                                (i) => i.id === relatedId
                                                            );
                                                            return (
                                                                <button
                                                                    key={relatedId}
                                                                    className="flex items-center h-7 px-3 text-[8px] font-black uppercase tracking-widest rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        toggleItem(relatedId);
                                                                    }}
                                                                >
                                                                    {relatedItem?.title}
                                                                    <ArrowRight
                                                                        size={8}
                                                                        className="ml-2 text-blue-500"
                                                                    />
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
