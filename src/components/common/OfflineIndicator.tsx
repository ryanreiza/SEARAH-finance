import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../../hooks/usePWAInstall';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 z-50 flex items-center gap-2.5 rounded-2xl bg-slate-900/95 text-white px-4 py-2.5 text-xs font-semibold shadow-2xl border border-amber-500/40 backdrop-blur-md animate-bounce">
      <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
      <WifiOff className="w-4 h-4 text-amber-400" />
      <span>Mode Offline — Data tersimpan aman di perangkat Anda</span>
    </div>
  );
};
