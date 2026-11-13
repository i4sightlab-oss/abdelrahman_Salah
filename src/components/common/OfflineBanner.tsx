import { CheckCircle2, WifiOff } from 'lucide-react';
import React from 'react';
import { useOnlineStatus } from '../../hooks/usePWAInstall';

export const OfflineBanner: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg border border-emerald-400 animate-in slide-in-from-top duration-300">
      <WifiOff className="w-3.5 h-3.5" />
      <span>Offline Mode — All words, pronunciation & games are ready!</span>
      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-200" />
    </div>
  );
};
