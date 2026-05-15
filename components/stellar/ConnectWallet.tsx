"use client";

import { useEffect, useState, useRef } from "react";
import { useStore } from "@nanostores/react";
import { connectedPublicKey } from "../../stellar-wallet-connect/src/core/store";
import {
  initializeConnection,
  loadedPublicKey,
  setConnection,
  disconnect as disconnectWallet,
  loadedProvider,
  checkAndNotifyFunding,
} from "../../stellar-wallet-connect/src/core/walletService";
import { kit } from "../../stellar-wallet-connect/src/core/kit";
import WalletFundingWrapper from "../../stellar-wallet-connect/src/components/WalletFundingWrapper";
import { LogOut, Wallet, ChevronDown, User } from "lucide-react";

export default function ConnectWallet() {
  const publicKey = useStore(connectedPublicKey);
  const [isMounted, setIsMounted] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
    initializeConnection();
    
    const provider = loadedProvider();
    if (provider) {
      kit.setWallet(provider);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleConnect = async () => {
    if (publicKey) {
      setShowDropdown(!showDropdown);
      return;
    }

    try {
      await kit.openModal({
        onWalletSelected: async (option: { id: string }) => {
          try {
            kit.setWallet(option.id);
            const { address } = await kit.getAddress();
            setConnection(address, option.id);
            await checkAndNotifyFunding();
          } catch (err) {
            console.error("Connection failed", err);
          }
        },
      });
    } catch (err) {
      console.error("Kit modal failed", err);
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
    setShowDropdown(false);
  };

  if (!isMounted) return null;

  return (
    <div id="connect-wrap" aria-live="polite" className="relative" ref={dropdownRef}>
      <button
        onClick={handleConnect}
        aria-controls="connect-wrap"
        aria-label={publicKey ? "Wallet options" : "Connect wallet"}
        className={`h-10 px-6 flex justify-center items-center gap-2 rounded-full shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 bg-red-600 text-white border border-red-500 hover:bg-red-700 hover:scale-105 active:scale-95`}
        title={publicKey || ""}
      >
        <span className="text-sm font-bold tracking-tight">
          {publicKey 
            ? `${publicKey.slice(0, 4)}...${publicKey.slice(-4)}` 
            : "Connect Wallet"
          }
        </span>
        {publicKey ? (
          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showDropdown ? "rotate-180" : ""}`} />
        ) : (
          <Wallet className="w-4 h-4" />
        )}
      </button>

      {/* Dropdown Menu */}
      {showDropdown && publicKey && (
        <div className="absolute top-full mt-2 right-0 w-48 bg-[#1A0505] border border-red-900/40 rounded-xl shadow-2xl z-[60] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-2 border-b border-red-900/20">
            <div className="flex items-center gap-2 px-3 py-2 text-xs text-gray-400">
              <User size={12} />
              <span className="truncate">{publicKey}</span>
            </div>
          </div>
          <button
            onClick={handleDisconnect}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-600/10 hover:text-red-300 transition-colors"
          >
            <LogOut size={16} />
            <span>Disconnect</span>
          </button>
        </div>
      )}

      {/* This component handles the funding modal internally */}
      <WalletFundingWrapper />
    </div>
  );
}
