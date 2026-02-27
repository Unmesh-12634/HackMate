import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { AlertTriangle, Trash2, X } from "lucide-react";
import { Button } from "./button";

interface ConfirmDialogProps {
    open: boolean;
    title?: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: "danger" | "warning" | "info";
    onConfirm: () => void;
    onCancel: () => void;
}

export function ConfirmDialog({
    open,
    title = "Are you sure?",
    message,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    variant = "danger",
    onConfirm,
    onCancel,
}: ConfirmDialogProps) {
    const colors = {
        danger: {
            icon: "bg-rose-500/10 text-rose-500 border-rose-500/20",
            btn: "bg-rose-600 hover:bg-rose-500 shadow-rose-600/25",
            ring: "border-rose-500/20",
        },
        warning: {
            icon: "bg-amber-500/10 text-amber-500 border-amber-500/20",
            btn: "bg-amber-600 hover:bg-amber-500 shadow-amber-600/25",
            ring: "border-amber-500/20",
        },
        info: {
            icon: "bg-blue-500/10 text-blue-500 border-blue-500/20",
            btn: "bg-blue-600 hover:bg-blue-500 shadow-blue-600/25",
            ring: "border-blue-500/20",
        },
    }[variant];

    return (
        <AnimatePresence>
            {open && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onCancel}
                        className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm"
                    />

                    {/* Dialog */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.92, y: 16 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.92, y: 16 }}
                        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className="fixed inset-0 z-[201] flex items-center justify-center p-4 pointer-events-none"
                    >
                        <div className="pointer-events-auto w-full max-w-sm bg-card border border-border/60 rounded-3xl shadow-2xl overflow-hidden">
                            {/* Top accent line */}
                            <div className={`h-1 w-full ${variant === 'danger' ? 'bg-rose-500' : variant === 'warning' ? 'bg-amber-500' : 'bg-blue-500'}`} />

                            <div className="p-8">
                                {/* Icon + Title */}
                                <div className="flex items-start gap-5 mb-6">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shrink-0 ${colors.icon}`}>
                                        {variant === "danger"
                                            ? <Trash2 className="w-5 h-5" />
                                            : <AlertTriangle className="w-5 h-5" />
                                        }
                                    </div>
                                    <div className="pt-0.5">
                                        <h3 className="text-base font-black text-foreground uppercase tracking-tight mb-1">{title}</h3>
                                        <p className="text-sm text-muted-foreground leading-relaxed">{message}</p>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3">
                                    <Button
                                        variant="outline"
                                        onClick={onCancel}
                                        className="flex-1 h-11 rounded-2xl border-border/60 text-foreground text-[11px] font-black uppercase tracking-widest hover:bg-muted/50"
                                    >
                                        {cancelLabel}
                                    </Button>
                                    <button
                                        onClick={onConfirm}
                                        className={`flex-1 h-11 rounded-2xl text-white text-[11px] font-black uppercase tracking-widest transition-all shadow-lg ${colors.btn}`}
                                    >
                                        {confirmLabel}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
