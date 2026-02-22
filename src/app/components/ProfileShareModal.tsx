import React from "react";
import { motion, AnimatePresence } from "motion/react";
import {
    X,
    Copy,
    Check,
    Share2,
    Download,
    QrCode,
    Globe,
    Shield
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "./ui/button";
import { toast } from "sonner";

interface ProfileShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
    userName: string;
}

export function ProfileShareModal({ isOpen, onClose, userId, userName }: ProfileShareModalProps) {
    const [copied, setCopied] = React.useState(false);
    const shareUrl = `${window.location.origin}/u/${userId}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        toast.success("Profile link copied to clipboard.");
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownloadQR = () => {
        const svg = document.querySelector("#profile-qr") as SVGElement;
        if (!svg) return;

        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const img = new Image();

        img.onload = () => {
            canvas.width = 512;
            canvas.height = 512;
            ctx?.drawImage(img, 0, 0, 512, 512);
            const pngFile = canvas.toDataURL("image/png");
            const downloadLink = document.createElement("a");
            downloadLink.download = `${userName.replace(/\s+/g, '_')}_HackMate_QR.png`;
            downloadLink.href = pngFile;
            downloadLink.click();
            toast.success("QR Code downloaded.");
        };

        img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-sm bg-[#0F172A] border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden"
                    >
                        {/* Decorative backgrounds */}
                        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-transparent pointer-events-none" />

                        <div className="relative p-8 flex flex-col items-center">
                            <button
                                onClick={onClose}
                                className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
                            >
                                <X className="w-4 h-4 text-slate-400" />
                            </button>

                            <div className="w-16 h-16 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center mb-6">
                                <Shield className="w-8 h-8 text-blue-500" />
                            </div>

                            <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-2 text-center">
                                Share Intelligence
                            </h3>
                            <p className="text-sm text-slate-400 text-center mb-8 px-4">
                                Invite others to view your professional record and hackathon exploits.
                            </p>

                            {/* QR Code Section */}
                            <div className="p-6 bg-white rounded-[2rem] shadow-2xl mb-8 relative group">
                                <QRCodeSVG
                                    id="profile-qr"
                                    value={shareUrl}
                                    size={200}
                                    level="H"
                                    includeMargin={false}
                                    imageSettings={{
                                        src: "/logo.png", // Fallback to a placeholder if logo doesn't exist
                                        x: undefined,
                                        y: undefined,
                                        height: 40,
                                        width: 40,
                                        excavate: true,
                                    }}
                                />
                                <button
                                    onClick={handleDownloadQR}
                                    className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center rounded-[2rem]"
                                >
                                    <Download className="w-10 h-10 text-white mb-2" />
                                    <span className="text-[10px] font-black text-white uppercase tracking-widest">Download HQ</span>
                                </button>
                            </div>

                            {/* URL Section */}
                            <div className="w-full space-y-4">
                                <div className="relative group">
                                    <div className="absolute inset-0 bg-blue-500/10 blur-xl opacity-0 group-hover:opacity-100 transition-all" />
                                    <div className="relative flex items-center gap-2 p-1 pl-4 bg-slate-900/50 border border-white/5 rounded-2xl">
                                        <Globe className="w-3 h-3 text-slate-500 shrink-0" />
                                        <span className="flex-1 text-[10px] font-bold text-slate-300 truncate font-['Fira_Code']">
                                            {shareUrl.replace(/^https?:\/\//, '')}
                                        </span>
                                        <Button
                                            size="sm"
                                            onClick={handleCopy}
                                            className="h-9 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white border-0 shadow-lg shadow-blue-600/20"
                                        >
                                            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                        </Button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <Button
                                        variant="outline"
                                        className="h-10 rounded-xl border-white/5 bg-white/5 text-[10px] font-black uppercase tracking-widest hover:bg-white/10"
                                        onClick={() => {
                                            if (navigator.share) {
                                                navigator.share({
                                                    title: `${userName}'s HackMate Profile`,
                                                    text: `Check out ${userName}'s professional developer profile on HackMate!`,
                                                    url: shareUrl,
                                                });
                                            } else {
                                                handleCopy();
                                            }
                                        }}
                                    >
                                        <Share2 className="w-3 h-3 mr-2" /> System Share
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="h-10 rounded-xl border-white/5 bg-white/5 text-[10px] font-black uppercase tracking-widest hover:bg-white/10"
                                        onClick={handleDownloadQR}
                                    >
                                        <QrCode className="w-3 h-3 mr-2" /> Get QR
                                    </Button>
                                </div>
                            </div>

                            <div className="mt-8 pt-8 border-t border-white/5 w-full flex items-center justify-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                                <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">
                                    Identity_Carrier_v2.1
                                </span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
