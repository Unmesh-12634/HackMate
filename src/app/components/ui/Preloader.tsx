import React, { useEffect, useState, forwardRef } from "react";
import { motion, AnimatePresence } from "motion/react";

interface PreloaderProps {
    onComplete: () => void;
}

const Preloader = forwardRef<HTMLDivElement, PreloaderProps>(({ onComplete }, ref) => {
    const [step, setStep] = useState(0);

    useEffect(() => {
        const timers = [
            setTimeout(() => setStep(1), 500),   // Logo reveal
            setTimeout(() => setStep(2), 1500),  // Wordmark reveal
            setTimeout(() => setStep(3), 2200),  // Credentials reveal
            setTimeout(() => setStep(4), 3500),  // The Boom
            setTimeout(() => onComplete(), 4200), // Finish
        ];

        return () => timers.forEach(clearTimeout);
    }, [onComplete]);

    return (
        <div ref={ref} className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center overflow-hidden">
            {/* ─── The Boom Flash ─── */}
            <AnimatePresence>
                {step === 4 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 20 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.8, ease: "easeIn" }}
                        className="absolute z-50 w-64 h-64 bg-white rounded-full blur-3xl"
                    />
                )}
            </AnimatePresence>

            <div className="relative z-10 flex flex-col items-center gap-8">
                {/* ─── Logo Animation ─── */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
                    animate={step >= 1 ? { opacity: 1, scale: 1, rotate: 0 } : {}}
                    transition={{
                        type: "spring",
                        stiffness: 100,
                        damping: 15,
                        duration: 0.8
                    }}
                    className="relative"
                >
                    <div className="absolute inset-0 blur-2xl bg-blue-500/20 rounded-full scale-150" />
                    <img src="/assets/logo.png" className="w-32 h-32 md:w-40 md:h-40 object-contain relative z-10" alt="Logo" />
                </motion.div>

                {/* ─── Wordmark & Credentials ─── */}
                <div className="text-center space-y-4">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={step >= 2 ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="text-4xl md:text-6xl font-black tracking-[0.2em] text-white uppercase italic"
                    >
                        HACKMATE
                    </motion.h1>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={step >= 3 ? { opacity: 0.6 } : {}}
                        transition={{ duration: 1 }}
                        className="flex flex-col items-center gap-1"
                    >
                        <span className="text-[10px] md:text-[12px] font-black tracking-[0.6em] text-blue-400 uppercase">
                            BY UNMESH JOSHI
                        </span>
                        <span className="text-[8px] md:text-[10px] font-bold tracking-[0.4em] text-slate-500 uppercase">
              // EST. 2026 TRANSMISSION
                        </span>
                    </motion.div>
                </div>
            </div>

            {/* ─── Ambient scanning line ─── */}
            <motion.div
                initial={{ top: "-10%" }}
                animate={{ top: "110%" }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="absolute left-0 w-full h-px bg-blue-500/20 blur-[2px] z-0"
            />
        </div>
    );
});

export default Preloader;
