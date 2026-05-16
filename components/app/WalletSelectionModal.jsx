"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { 
  X, 
  ExternalLink, 
  Shield, 
  Smartphone, 
  Monitor, 
  Lock, 
  Check, 
  AlertCircle,
  ChevronRight,
  ArrowRight,
  Info,
  Wallet,
  Zap,
  Globe,
  Compass,
  Cpu
} from "lucide-react";
import { useWalletConnection } from "@/hooks/useWalletConnection";
import { 
  getRecommendedWallets, 
  getMobileWallets, 
  getHardwareWallets,
  WALLET_COPY 
} from "@/lib/wallets";
import { cn } from "@/lib/utils";

const WALLET_ICONS = {
  xbull: <Zap className="w-6 h-6" />,
  albedo: <Globe className="w-6 h-6" />,
  freighter: <Compass className="w-6 h-6" />,
  rabet: <Smartphone className="w-6 h-6" />,
  ledger: <Cpu className="w-6 h-6" />,
};

export default function WalletSelectionModal({ 
  isOpen, 
  onClose, 
  onSuccess 
}) {
  const { 
    connect, 
    state, 
    status, 
    clearError 
  } = useWalletConnection();

  const [connectingWallet, setConnectingWallet] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const recommendedWallets = getRecommendedWallets();
  const mobileWallets = getMobileWallets();
  const hardwareWallets = getHardwareWallets();

  const handleWalletSelect = async (walletType) => {
    setConnectingWallet(walletType);
    clearError();

    const success = await connect(walletType);
    
    if (success) {
      setTimeout(() => {
        onClose();
        onSuccess?.();
        setConnectingWallet(null);
      }, 800);
    } else {
      setConnectingWallet(null);
    }
  };

  const handleInstallWallet = (wallet) => {
    window.open(wallet.downloadUrl, '_blank');
  };

  if (!mounted) return null;

  const WalletItem = ({ wallet }) => {
    const isConnecting = connectingWallet === wallet.id;
    const isConnected = state.walletType === wallet.id && state.isConnected;
    const icon = WALLET_ICONS[wallet.id] || <Wallet className="w-6 h-6" />;

    return (
      <div className="relative group">
        <button
          className={cn(
            "w-full flex items-center gap-4 p-5 rounded-2xl border transition-all duration-300 text-left relative overflow-hidden",
            isConnected 
              ? "bg-green-500/10 border-green-500/30 ring-1 ring-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.1)]" 
              : "bg-[#0D0404] border-red-900/30 hover:border-red-500/60 hover:bg-[#1A0505] hover:shadow-[0_0_25px_rgba(239,68,68,0.15)]",
            isConnecting && "opacity-70 pointer-events-none"
          )}
          onClick={() => !isConnected && handleWalletSelect(wallet.id)}
          disabled={isConnecting || isConnected}
        >
          {/* Animated glow on hover */}
          <div className="absolute -inset-x-20 inset-y-0 bg-gradient-to-r from-transparent via-red-600/5 to-transparent opacity-0 group-hover:opacity-100 group-hover:translate-x-full transition-all duration-1000 ease-in-out" />

          {/* Wallet Icon */}
          <div className={cn(
            "w-14 h-14 rounded-2xl flex items-center justify-center text-white transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-xl relative z-10",
            isConnected ? "bg-green-600 shadow-green-900/40" : "vault-gradient shadow-red-900/40"
          )}>
            {icon}
          </div>

          <div className="flex-1 min-w-0 relative z-10">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-black text-lg text-white group-hover:text-red-400 transition-colors tracking-tight">
                {wallet.displayName}
              </span>
              {wallet.recommended && !isConnected && (
                <div className="relative">
                  <div className="absolute inset-0 bg-red-600 blur-sm opacity-50 animate-pulse" />
                  <span className="relative px-2 py-0.5 bg-gradient-to-r from-red-500 to-red-700 text-white text-[9px] font-black uppercase tracking-widest rounded-md border border-white/20 shadow-lg">
                    Best Choice
                  </span>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors leading-relaxed">
              {wallet.description}
            </p>
          </div>

          <div className="relative z-10 shrink-0">
            {isConnecting ? (
              <div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin shadow-lg" />
            ) : isConnected ? (
              <div className="w-7 h-7 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30">
                <Check className="w-4 h-4 text-white" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-red-950/20 flex items-center justify-center text-red-500/40 group-hover:text-red-500 group-hover:bg-red-500/10 group-hover:translate-x-0 -translate-x-2 transition-all duration-300">
                <ArrowRight className="w-5 h-5" />
              </div>
            )}
          </div>
        </button>
        
        {!isConnected && !isConnecting && (
          <button
            className="absolute top-2 right-4 text-[9px] font-black text-gray-700 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-[0.2em] px-2 py-1"
            onClick={(e) => {
              e.stopPropagation();
              handleInstallWallet(wallet);
            }}
          >
            Setup
          </button>
        )}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange => !onOpenChange && status !== 'connecting' && onClose()}>
      <DialogContent className="bg-[#080202] border-none text-white p-0 sm:max-w-[500px] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-[32px]">
        {/* Subtle Side Gradients */}
        <div className="absolute inset-0 bg-gradient-to-tr from-red-950/10 via-transparent to-red-950/10 pointer-events-none" />
        
        {/* Header with Background Glow */}
        <div className="relative p-10 pb-6">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-red-600/5 blur-[100px] rounded-full pointer-events-none" />
          
          <DialogHeader className="relative z-10">
            <div className="flex justify-between items-center mb-6">
              <div className="w-12 h-12 rounded-[18px] bg-red-600/10 flex items-center justify-center border border-red-500/20 shadow-inner">
                <Shield className="w-6 h-6 text-red-500" />
              </div>
              <button 
                onClick={onClose} 
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/10 transition-all active:scale-95"
                disabled={status === 'connecting'}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <DialogTitle className="text-4xl font-black tracking-tight text-white leading-tight">
              Link Your <span className="text-red-600">Wallet</span>
            </DialogTitle>
            <DialogDescription className="text-gray-500 text-base mt-2 font-medium">
              Choose a secure provider to manage your assets.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="px-10 pb-10 space-y-8 max-h-[65vh] overflow-y-auto custom-scrollbar relative">
          {/* Error Message */}
          {state.error && (
            <div className="flex items-center gap-4 p-5 bg-red-950/40 border border-red-500/30 rounded-2xl animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
                <AlertCircle className="w-6 h-6 text-red-500" />
              </div>
              <p className="text-xs font-bold text-red-100 uppercase tracking-wide leading-relaxed">{state.error}</p>
            </div>
          )}

          {/* Wallet List Sections */}
          <div className="space-y-10">
            {/* Recommended Section */}
            <div>
              <div className="flex items-center gap-4 mb-6">
                <span className="text-[11px] font-black uppercase tracking-[0.3em] text-red-500/60">Preferred</span>
                <div className="h-px flex-1 bg-gradient-to-r from-red-500/20 to-transparent" />
              </div>
              <div className="grid grid-cols-1 gap-4">
                {recommendedWallets.map(wallet => (
                  <WalletItem key={wallet.id} wallet={wallet} />
                ))}
              </div>
            </div>

            {/* Other Options */}
            {(mobileWallets.length > 0 || hardwareWallets.length > 0) && (
              <div>
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-600">Additional Providers</span>
                  <div className="h-px flex-1 bg-gradient-to-r from-gray-800 to-transparent" />
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {mobileWallets.map(wallet => (
                    <WalletItem key={wallet.id} wallet={wallet} />
                  ))}
                  {hardwareWallets.map(wallet => (
                    <WalletItem key={wallet.id} wallet={wallet} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Bottom Security Info */}
          <div className="grid grid-cols-2 gap-3 pt-4">
            <div className="p-5 rounded-[24px] bg-[#0D0404] border border-red-900/10 flex flex-col gap-3">
              <Lock className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-xs font-black text-white uppercase tracking-wider">End-to-End</p>
                <p className="text-[10px] text-gray-500 mt-1 font-medium">Your keys never leave your custody.</p>
              </div>
            </div>
            <div className="p-5 rounded-[24px] bg-[#0D0404] border border-red-900/10 flex flex-col gap-3">
              <Shield className="w-5 h-5 text-red-500" />
              <div>
                <p className="text-xs font-black text-white uppercase tracking-wider">Verified</p>
                <p className="text-[10px] text-gray-500 mt-1 font-medium">Audited Stellar smart contracts.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-10 py-8 bg-[#0D0404] border-t border-red-950 flex items-center justify-between">
          <button 
            className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600 hover:text-red-500 transition-all flex items-center gap-2 group"
            onClick={() => window.open('https://stellar.org/wallets', '_blank')}
          >
            How it works <ExternalLink className="w-3 h-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </button>
          
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-950/20 border border-red-900/20 shadow-lg">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-widest text-red-400">Mainnet-Ready</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
