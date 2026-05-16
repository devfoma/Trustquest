"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import AppNav from "@/components/app/AppNav"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { 
  Trophy, 
  Users, 
  ShieldCheck, 
  Clock, 
  ArrowLeft, 
  CheckCircle2, 
  Circle, 
  TrendingUp, 
  Sparkles,
  Loader2
} from "lucide-react"
import Link from "next/link"
import { useWalletConnection } from "@/hooks/useWalletConnection"
import { useChallenges as useQuests } from "@/hooks/useQuests"
import { calculateParticipationProgress } from "@/lib/savings/savingsLogic"

export default function QuestDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { state: walletState } = useWalletConnection()
  const { address, isConnected } = walletState
  const { challenges: quests, userParticipations, loading, error, join, refresh } = useQuests(address)
  
  const [quest, setQuest] = useState<any>(null)
  const [participation, setParticipation] = useState<any>(null)
  const [isJoining, setIsJoining] = useState(false)

  useEffect(() => {
    if (quests.length > 0) {
      const foundQuest = quests.find(q => q.id === params.id)
      setQuest(foundQuest || null)
    }
  }, [quests, params.id])

  useEffect(() => {
    if (userParticipations.length > 0 && quest) {
      const foundParticipation = userParticipations.find(p => p.questId === quest.id)
      setParticipation(foundParticipation || null)
    }
  }, [userParticipations, quest])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1A0505] to-[#2D0A0A] text-white flex items-center justify-center">
        <Loader2 className="animate-spin w-8 h-8 text-red-500" />
      </div>
    )
  }

  if (!quest) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1A0505] to-[#2D0A0A] text-white">
        <AppNav />
        <main className="container mx-auto px-4 py-16 text-center">
          <Trophy size={64} className="text-gray-600 mx-auto mb-6" />
          <h1 className="text-3xl font-bold mb-4">Quest Not Found</h1>
          <p className="text-gray-400 mb-8">The quest you're looking for doesn't exist or has expired.</p>
          <Link href="/app/quests">
            <Button className="bg-red-600 hover:bg-red-700">Back to Quests</Button>
          </Link>
        </main>
      </div>
    )
  }

  const progress = participation ? calculateParticipationProgress(quest, participation) : 0
  const daysLeft = Math.ceil((quest.milestones[quest.milestones.length - 1].deadline - Date.now()) / (1000 * 60 * 60 * 24))

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1A0505] to-[#2D0A0A] text-white">
      <AppNav />
      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-5xl mx-auto">
          <Link href="/app/quests" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 text-sm">
            <ArrowLeft size={14} /> Back to Quests
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Quest Info */}
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-[#1A0808]/70 backdrop-blur-xl border border-red-900/20 rounded-3xl p-8 shadow-2xl">
                <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-red-600/20 rounded-2xl flex items-center justify-center border border-red-500/30">
                      <Trophy className="text-red-500" size={32} />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold">{quest.title}</h1>
                      <div className="flex items-center gap-2 text-gray-400 mt-1">
                        <span className="text-sm">Sponsored by</span>
                        <span className="text-sm font-mono text-red-400">{quest.sponsorAddress.slice(0, 6)}...{quest.sponsorAddress.slice(-4)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-red-950/50 px-3 py-1.5 rounded-full border border-red-900/30">
                    <ShieldCheck size={16} className="text-red-500" />
                    <span className="text-xs font-bold text-red-400 uppercase tracking-wider">Escrow Protected</span>
                  </div>
                </div>

                <div className="prose prose-invert max-w-none mb-10">
                  <p className="text-gray-300 text-lg leading-relaxed">
                    {quest.description}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-red-900/10">
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-widest">Reward Pool</p>
                    <div className="flex items-center gap-2">
                      <Sparkles size={20} className="text-yellow-500" />
                      <span className="text-2xl font-black text-white">{quest.rewardAmount} {quest.rewardToken}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-widest">Time Remaining</p>
                    <div className="flex items-center gap-2">
                      <Clock size={20} className="text-red-400" />
                      <span className="text-2xl font-black text-white">{daysLeft > 0 ? `${daysLeft} Days` : 'Ended'}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-widest">Status</p>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${quest.status === 'ACTIVE' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-gray-500'}`} />
                      <span className="text-xl font-bold text-white uppercase tracking-tighter">{quest.status}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Milestones Section */}
              <div className="bg-[#1A0808]/40 backdrop-blur-md border border-red-900/10 rounded-3xl p-8">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  <CheckCircle2 className="text-red-500" /> Quest Milestones
                </h2>
                <div className="space-y-4">
                  {quest.milestones.map((ms: any, index: number) => {
                    const isCompleted = participation && participation.milestoneProgress[index]?.completedAt;
                    return (
                      <div 
                        key={ms.id} 
                        className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                          isCompleted ? 'bg-red-600/10 border-red-500/30' : 'bg-black/20 border-white/5'
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="text-red-500 shrink-0" size={24} />
                        ) : (
                          <Circle className="text-gray-600 shrink-0" size={24} />
                        )}
                        <div className="flex-1">
                          <p className={`font-bold ${isCompleted ? 'text-white' : 'text-gray-400'}`}>{ms.description}</p>
                          <p className="text-xs text-gray-500">Target: {ms.targetAmount} {quest.rewardToken}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">Deadline</p>
                          <p className="text-sm font-medium">{new Date(ms.deadline).toLocaleDateString()}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Right Column: User Participation */}
            <div className="space-y-8">
              <div className="bg-gradient-to-br from-[#2D0A0A] to-[#1A0505] border border-red-500/20 rounded-3xl p-8 shadow-xl">
                <h3 className="text-xl font-bold mb-6">Your Progress</h3>
                
                {participation ? (
                  <div className="space-y-6">
                    <div className="text-center py-4">
                      <div className="text-5xl font-black text-red-500 mb-2">{progress}%</div>
                      <p className="text-gray-400 text-sm">Overall Completion</p>
                    </div>
                    
                    <Progress value={progress} className="h-3 bg-red-900/20" indicatorClassName="bg-red-600 shadow-[0_0_15px_rgba(239,68,68,0.5)]" />
                    
                    <div className="space-y-4 pt-4">
                      <div className="flex justify-between items-center p-3 rounded-xl bg-black/20 border border-white/5">
                        <span className="text-xs text-gray-400">Current Balance</span>
                        <span className="font-bold">{participation.currentBalance} {quest.rewardToken}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 rounded-xl bg-black/20 border border-white/5">
                        <span className="text-xs text-gray-400">Streak</span>
                        <span className="font-bold">{participation.streakDays} Days</span>
                      </div>
                    </div>
                    
                    <Button 
                      className="w-full bg-red-600 hover:bg-red-700 text-white font-bold h-12 rounded-xl"
                      onClick={() => refresh()}
                    >
                      Update Progress
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <p className="text-gray-400 text-sm leading-relaxed">
                      Join this quest to start tracking your savings and unlock rewards. You must meet all milestones to be eligible for the pool payout.
                    </p>
                    
                    {!isConnected ? (
                      <div className="p-4 rounded-2xl bg-amber-900/20 border border-amber-500/20 text-amber-200 text-xs text-center">
                        Please connect your Stellar wallet to join this quest.
                      </div>
                    ) : (
                      <Button 
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold h-14 rounded-xl shadow-lg shadow-red-900/40 text-lg"
                        disabled={isJoining}
                        onClick={async () => {
                          setIsJoining(true)
                          try {
                            await join(quest.id)
                          } finally {
                            setIsJoining(false)
                          }
                        }}
                      >
                        {isJoining ? "Joining..." : "Join Quest Now"}
                      </Button>
                    )}
                  </div>
                )}
              </div>

              <div className="bg-[#1A0808]/40 border border-red-900/10 rounded-3xl p-6">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="text-red-500 shrink-0" size={20} />
                  <div>
                    <h4 className="text-sm font-bold mb-1">Trustless Payouts</h4>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      Rewards are held in an automated escrow. Once you complete the quest, the funds are released directly to your wallet via the Trustless Work protocol.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
