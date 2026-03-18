import React, { useContext, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { CommunicationMatrix } from "../components/chat/CommunicationMatrix";
import { motion } from "motion/react";
import { MessageSquare, Shield, Zap, Activity } from "lucide-react";

export default function ChatView() {
  const context = useContext(AppContext);

  if (!context) return null;

  const {
    globalMessages,
    directMessages,
    sendGlobalMessage,
    sendDirectMessage,
    editDirectMessage,
    deleteDirectMessage,
    reactToDirectMessage,
    user,
    allProfiles,
    searchUsers,
    markAllDMsAsRead,
    bounties,
    claimBounty
  } = context;

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const targetUserId = searchParams.get("user");

  // Mark all DMs as read when entering ChatView
  useEffect(() => {
    markAllDMsAsRead();
  }, [markAllDMsAsRead]);

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] p-4 lg:p-8 space-y-6 overflow-hidden">
      {/* Main Chat Interface */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1 min-h-0 bg-card/30 backdrop-blur-md border border-border/15 rounded-[2.5rem] overflow-hidden shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] relative group"
      >
        {/* Decorative Grid Overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)]" style={{ backgroundSize: '30px 30px' }} />
        
        {/* Ambient Glow */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none group-hover:bg-indigo-500/15 transition-all duration-700" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-500/5 blur-[100px] rounded-full pointer-events-none group-hover:bg-blue-500/10 transition-all duration-700" />

        <div className="relative z-10 h-full">
          <CommunicationMatrix
            globalMessages={globalMessages}
            directMessages={directMessages}
            onSendGlobal={sendGlobalMessage}
            onSendDirect={sendDirectMessage}
            editDirectMessage={editDirectMessage}
            deleteDirectMessage={deleteDirectMessage}
            reactToDirectMessage={reactToDirectMessage}
            currentUser={user!}
            allProfiles={allProfiles}
            searchUsers={searchUsers}
            initialMode="intel" // Forced to personal chats (Intel)
            initialTargetUserId={targetUserId} // Pre-select from URL
            hideHeader={true} // Hide the switcher
            onMarkAllRead={markAllDMsAsRead}
            bounties={bounties}
            claimBounty={claimBounty}
          />
        </div>
      </motion.div>

      {/* Footnote */}
      <div className="flex items-center justify-between px-6 pt-2">
        <div className="flex items-center gap-2">
            <Shield className="w-3 h-3 text-indigo-400" />
            <span className="text-[8px] font-bold text-muted-foreground/50 uppercase tracking-[0.3em]">End-to-End Encryption Enabled // HM_SECURE_RELAY_{user?.id?.slice(0, 8)}</span>
        </div>
        <div className="text-[8px] font-bold text-muted-foreground/30 uppercase tracking-widest">v4.5.1-FINAL</div>
      </div>
    </div>
  );
}
