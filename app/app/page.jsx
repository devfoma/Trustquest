"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import AppNav from "@/components/app/AppNav"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useWalletConnection } from "@/hooks/useWalletConnection";
import { useTrustQuest } from "@/hooks/useTrustQuest"
import { useChallenges as useQuests } from "@/hooks/useQuests"
import { Wallet, TrendingUp, Users, Droplets, Loader2, Trophy, ShieldCheck, ArrowRight } from "lucide-react"
import PrizeGrid from "@/components/app/PrizeGrid"
import QuestCard from "@/components/app/QuestCard"

export default function AppPage() {
  const { state: walletConnectionState } = useWalletConnection();
  const { address, isConnected } = walletConnectionState;
  const { 
    walletState, 
    totalDeposits, 
    totalInterestEarned, 
    activePools, 
    userPositions, 
    pendingTransactions,
    loading: oldLoading,
    errors 
  } = useTrustQuest()

  const {
    challenges: quests,
    userParticipations,
    loading: questsLoading,
    join,
    refresh
  } = useQuests(address)

  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Don't render until mounted to avoid hydration issues
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1A0505] to-[#2D0A0A] text-white flex items-center justify-center">
        <Loader2 className="animate-spin w-8 h-8" />
      </div>
    )
  }

  const isLoading = oldLoading.dashboard || oldLoading.positions || oldLoading.pools || questsLoading

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1A0505] to-[#2D0A0A] text-white">
      <AppNav />
      <main className="container mx-auto px-4 py-8 md:py-16 relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-20 md:mb-32">
          <h1 className="text-4xl md:text-8xl font-black text-white leading-tight tracking-tight mb-4">
            Save your deposit.
          </h1>
          <h2 className="text-3xl md:text-6xl font-bold mb-10 leading-tight">
            Win up to <span className="text-red-500">$362,497</span>
          </h2>
          
          <div className="flex justify-center pt-4">
            <Link href="/app/quests">
              <Button className="bg-red-600 hover:bg-red-700 text-white px-12 py-8 text-2xl font-bold rounded-full shadow-[0_0_30px_rgba(239,68,68,0.4)] transition-all transform hover:scale-110 active:scale-95">
                Start Saving
              </Button>
            </Link>
          </div>
        </div>

        {/* Dashboard Stats - Only show when connected */}
        {walletState.isConnected && (
          <div className="mb-12">
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="animate-spin w-8 h-8 mr-2 text-red-500" />
                <span>Loading your dashboard...</span>
              </div>
            ) : errors.dashboard ? (
              <Card className="bg-red-900/20 border-red-500/30">
                <CardContent className="p-6 text-center">
                  <p className="text-red-400">Failed to load dashboard data</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="bg-[#1A0808]/70 backdrop-blur-sm border border-red-900/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-400 flex items-center">
                      <Wallet className="w-4 h-4 mr-2 text-red-500" />
                      Total Deposits
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">
                      ${(totalDeposits || 0).toFixed(2)}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-[#1A0808]/70 backdrop-blur-sm border border-red-900/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-400 flex items-center">
                      <TrendingUp className="w-4 h-4 mr-2 text-red-500" />
                      Interest Earned
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-400">
                      ${(totalInterestEarned || 0).toFixed(2)}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-[#1A0808]/70 backdrop-blur-sm border border-red-900/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-400 flex items-center">
                      <Users className="w-4 h-4 mr-2 text-red-500" />
                      Active Positions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">
                      {userPositions.length}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-[#1A0808]/70 backdrop-blur-sm border border-red-900/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-400 flex items-center">
                      <ShieldCheck className="w-4 h-4 mr-2 text-red-500" />
                      Locked in Escrow
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-yellow-400">
                      $4,250.00
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}

        {/* Active Quests Section */}
        {isConnected && (
          <div className="mb-20">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold flex items-center gap-3">
                <Trophy className="text-red-500" /> Active Quests
              </h2>
              <Link href="/app/quests" className="text-red-500 hover:text-red-400 font-bold flex items-center gap-2">
                View All <ArrowRight size={16} />
              </Link>
            </div>
            
            {quests.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {quests.slice(0, 3).map(quest => (
                  <QuestCard 
                    key={quest.id} 
                    challenge={quest} 
                    participation={userParticipations.find(p => p.questId === quest.id)}
                    onJoin={join}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-[#1A0808]/30 rounded-2xl border border-red-900/10 p-12 text-center">
                <p className="text-gray-400 mb-6">No quests available right now. Check back soon or create your own!</p>
                <Button className="bg-red-600 hover:bg-red-700" onClick={() => refresh()}>
                  Refresh List
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Prize Grid Section - Keeping for secondary rewards */}
        <div className="mb-8">
           <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
            <Droplets className="text-red-500" /> Global Prize Pools
          </h2>
          <PrizeGrid />
        </div>
      </main>
    </div>
  )
}


