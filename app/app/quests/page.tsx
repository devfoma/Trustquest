"use client"

import { useState } from "react"
import AppNav from "@/components/app/AppNav"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Trophy, Plus, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useWalletConnection } from "@/hooks/useWalletConnection"
import { useChallenges as useQuests } from "@/hooks/useQuests"
import QuestCard from "@/components/app/QuestCard"

export default function QuestsPage() {
  const { state: walletState } = useWalletConnection()
  const { address, isConnected } = walletState
  const { challenges: quests, userParticipations, loading, join, refresh } = useQuests(address)
  const [searchQuery, setSearchQuery] = useState("")

  const filteredQuests = quests.filter(q => 
    q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    q.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1A0505] to-[#2D0A0A] text-white">
      <AppNav />
      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-6xl mx-auto">
          {/* Breadcrumb */}
          <Link href="/app" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6 text-sm">
            <ArrowLeft size={14} /> Back to Dashboard
          </Link>

          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
            <div>
              <h1 className="text-4xl font-bold flex items-center gap-3">
                <Trophy className="text-red-500" /> Savings Quests
              </h1>
              <p className="text-gray-400 mt-2">Join escrow-backed quests and earn guaranteed rewards.</p>
            </div>
            
            {isConnected && (
              <Link href="/app/quests/create">
                <Button className="bg-red-600 hover:bg-red-700 text-white font-bold h-12 px-6 rounded-xl flex items-center gap-2">
                  <Plus size={18} /> Create Quest
                </Button>
              </Link>
            )}
          </div>

          {/* Search & Filter */}
          <div className="bg-[#1A0808]/50 backdrop-blur-md rounded-2xl border border-red-900/10 p-4 mb-8 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <Input 
                placeholder="Search quests..." 
                className="pl-12 bg-[#1A0808]/80 border-red-900/20 focus:border-red-500 transition-all h-12"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="border-red-900/20 hover:bg-red-600/10 h-12 px-6">Active</Button>
              <Button variant="outline" className="border-red-900/20 hover:bg-red-600/10 h-12 px-6">Completed</Button>
            </div>
          </div>

          {/* Quests Grid */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin h-8 w-8 border-4 border-red-500 border-t-transparent rounded-full"></div>
            </div>
          ) : filteredQuests.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredQuests.map(quest => (
                <QuestCard 
                  key={quest.id} 
                  challenge={quest} 
                  participation={userParticipations.find(p => p.questId === quest.id)}
                  onJoin={join}
                  isConnected={isConnected}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-[#1A0808]/20 rounded-3xl border border-red-900/10 border-dashed">
              <Trophy size={48} className="text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-400">No quests found</h3>
              <p className="text-gray-500 mt-2">Try adjusting your search or check back later!</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
