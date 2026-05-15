"use client"

import { useState } from "react"
import AppNav from "@/components/app/AppNav"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, ShieldCheck, Trophy, Sparkles } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useWalletConnection } from "@/hooks/useWalletConnection"
import { useChallenges as useQuests } from "@/hooks/useQuests"

export default function CreateQuestPage() {
  const router = useRouter()
  const { state: walletState } = useWalletConnection()
  const { address } = walletState
  const { createNewQuest } = useQuests(address)
  
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    rewardAmount: "",
    rewardToken: "USDC",
    savingsGoal: "",
    duration: "30",
    participantLimit: "100"
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      // Logic for creating quest via questService (wrapped by useQuests)
      // For demo, we'll create simple milestones based on the duration
      const milestones = [
        parseFloat(formData.savingsGoal) * 0.25,
        parseFloat(formData.savingsGoal) * 0.5,
        parseFloat(formData.savingsGoal) * 0.75,
        parseFloat(formData.savingsGoal)
      ]

      await createNewQuest(
        formData.title,
        formData.description,
        parseFloat(formData.rewardAmount),
        formData.rewardToken,
        milestones
      )
      
      router.push("/app/quests")
    } catch (error) {
      console.error("Failed to create quest:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1A0505] to-[#2D0A0A] text-white">
      <AppNav />
      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-2xl mx-auto">
          <Link href="/app/quests" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6 text-sm">
            <ArrowLeft size={14} /> Back to Quests
          </Link>

          <div className="bg-[#1A0808]/70 backdrop-blur-xl border border-red-900/20 rounded-3xl p-8 md:p-10 shadow-2xl">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-red-600/20 rounded-2xl flex items-center justify-center border border-red-500/30">
                <Sparkles className="text-red-500" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Launch a New Quest</h1>
                <p className="text-gray-400 text-sm">Define your goals and lock rewards in escrow.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-gray-300">Quest Title</Label>
                <Input 
                  id="title"
                  placeholder="e.g. 30-Day Emergency Fund Sprint"
                  className="bg-[#1A0808]/80 border-red-900/20 h-12"
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-gray-300">Description</Label>
                <Textarea 
                  id="description"
                  placeholder="What should participants achieve?"
                  className="bg-[#1A0808]/80 border-red-900/20 min-h-[100px]"
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="savingsGoal" className="text-gray-300">Savings Goal (per user)</Label>
                  <div className="relative">
                    <Input 
                      id="savingsGoal"
                      type="number"
                      placeholder="0.00"
                      className="bg-[#1A0808]/80 border-red-900/20 h-12 pl-10"
                      value={formData.savingsGoal}
                      onChange={e => setFormData({...formData, savingsGoal: e.target.value})}
                      required
                    />
                    <Trophy className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rewardAmount" className="text-gray-300">Total Reward Pool</Label>
                  <div className="relative">
                    <Input 
                      id="rewardAmount"
                      type="number"
                      placeholder="0.00"
                      className="bg-[#1A0808]/80 border-red-900/20 h-12 pl-10"
                      value={formData.rewardAmount}
                      onChange={e => setFormData({...formData, rewardAmount: e.target.value})}
                      required
                    />
                    <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-red-500" size={16} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="duration" className="text-gray-300">Duration (Days)</Label>
                  <Input 
                    id="duration"
                    type="number"
                    className="bg-[#1A0808]/80 border-red-900/20 h-12"
                    value={formData.duration}
                    onChange={e => setFormData({...formData, duration: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="limit" className="text-gray-300">Participant Limit</Label>
                  <Input 
                    id="limit"
                    type="number"
                    className="bg-[#1A0808]/80 border-red-900/20 h-12"
                    value={formData.participantLimit}
                    onChange={e => setFormData({...formData, participantLimit: e.target.value})}
                  />
                </div>
              </div>

              <div className="pt-4">
                <div className="bg-red-950/20 border border-red-900/30 rounded-2xl p-4 mb-6 flex items-start gap-3">
                  <ShieldCheck className="text-red-500 shrink-0 mt-0.5" size={18} />
                  <p className="text-xs text-gray-400 leading-relaxed">
                    By launching this quest, you will be prompted to lock <span className="text-white font-bold">{formData.rewardAmount || "0"} {formData.rewardToken}</span> into a secure Trustless Work escrow. These funds are only released to users who meet your criteria.
                  </p>
                </div>

                <Button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold h-14 rounded-2xl shadow-lg shadow-red-900/20 transition-all text-lg"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                      Deploying Escrow...
                    </div>
                  ) : "Create & Fund Quest"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}
