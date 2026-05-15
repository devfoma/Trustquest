"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import ConnectWallet from "../stellar/ConnectWallet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Droplets,
  Home,
  TrendingUp,
  User,
  Wallet,
  LogOut,
  ChevronDown,
  Settings,
  HelpCircle,
  X,
  Menu,
} from "lucide-react";
import { useWalletConnection } from "@/hooks/useWalletConnection";
import { WALLET_COPY, STELLAR_COPY } from "@/lib/wallets";

export default function AppNav() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMenuOpen && !event.target.closest('nav')) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  return (
    <nav className="bg-[#1A0505]/80 backdrop-blur-sm sticky top-0 z-50 border-b border-red-900/20 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14 md:h-16">
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <Image
              src="/images/logo.png"
              alt="TrustQuest Logo"
              width={32}
              height={32}
              className="rounded-full"
            />
            <span className="text-lg md:text-xl font-bold">
              Trust<span className="text-red-500">Quest</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/app/pools"
              className={`transition-colors ${
                pathname === "/app/pools"
                  ? "text-red-500"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              Pools
            </Link>
            <Link
              href="/app/prizes"
              className={`transition-colors ${
                pathname === "/app/prizes"
                  ? "text-red-500"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              Prizes
            </Link>
            <Link
              href="/app/account"
              className={`transition-colors ${
                pathname === "/app/account"
                  ? "text-red-500"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              Account
            </Link>
          </div>

          {/* Desktop Connect Button */}
          <div className="hidden md:block">
            <ConnectWallet />
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white p-2 hover:bg-red-600/20 rounded-lg transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-4 right-4 mt-2 backdrop-blur-sm bg-[#1A0505]/95 rounded-xl border border-red-900/20 shadow-xl z-50">
            <div className="flex flex-col p-4 space-y-3">
              <Link
                href="/app/pools"
                className={`py-3 px-4 rounded-lg transition-colors text-base ${
                  pathname === "/app/pools"
                    ? "text-red-500 bg-red-600/10"
                    : "text-gray-300 hover:text-white hover:bg-red-600/10"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Pools
              </Link>
              <Link
                href="/app/prizes"
                className={`py-3 px-4 rounded-lg transition-colors text-base ${
                  pathname === "/app/prizes"
                    ? "text-red-500 bg-red-600/10"
                    : "text-gray-300 hover:text-white hover:bg-red-600/10"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Prizes
              </Link>
              <Link
                href="/app/account"
                className={`py-3 px-4 rounded-lg transition-colors text-base ${
                  pathname === "/app/account"
                    ? "text-red-500 bg-red-600/10"
                    : "text-gray-300 hover:text-white hover:bg-red-600/10"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Account
              </Link>
              <div className="pt-3 border-t border-red-900/20">
                <ConnectWallet />
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
