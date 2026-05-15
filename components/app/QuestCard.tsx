import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Trophy, Clock, Users, ArrowRight, ShieldCheck, CheckCircle2, Circle } from "lucide-react"
import { Quest, UserQuestParticipation } from "@/types/quest"
import { calculateParticipationProgress } from "@/lib/savings/savingsLogic"
import { cn } from "@/lib/utils"

interface QuestCardProps {
  challenge: Quest; // Keeping prop name for now to avoid breaking parent components during migration
  participation?: UserQuestParticipation;
  onJoin?: (id: string) => void;
}

export default function QuestCard({ challenge, participation, onJoin }: QuestCardProps) {
  const quest = challenge;
  const progress = participation ? calculateParticipationProgress(quest as any, participation as any) : 0;
  const isJoined = !!participation;

  // Calculate time remaining (mocked)
  const daysLeft = Math.ceil((quest.milestones[quest.milestones.length - 1].deadline - Date.now()) / (1000 * 60 * 60 * 24));

  return (
    <Card className="group relative overflow-hidden bg-gradient-to-br from-[#1A0808] to-[#2D0A0A] border border-red-900/20 hover:border-red-500/50 transition-all duration-300 shadow-xl">
      {/* Glow Effect on Hover */}
      <div className="absolute inset-0 bg-red-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <CardHeader className="pb-4 relative z-10">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2 bg-red-950/50 px-2 py-1 rounded-md border border-red-900/30">
            <ShieldCheck size={12} className="text-red-500" />
            <span className="text-[10px] font-bold text-red-400 uppercase tracking-tighter">Escrow Backed</span>
          </div>
          <div className={cn(
            "px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider",
            quest.status === 'ACTIVE' ? "bg-green-950/30 text-green-500 border border-green-900/20" : "bg-gray-900 text-gray-500"
          )}>
            {quest.status}
          </div>
        </div>
        
        <div>
          <CardTitle className="text-xl font-bold text-white group-hover:text-red-400 transition-colors">
            {quest.title}
          </CardTitle>
          <p className="text-sm text-gray-400 mt-1.5 line-clamp-2 min-h-[40px]">
            {quest.description}
          </p>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6 relative z-10">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-black/20 border border-white/5">
          <div className="space-y-1">
            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Total Reward</p>
            <div className="flex items-center gap-1.5">
              <Trophy size={14} className="text-yellow-500" />
              <span className="text-sm font-bold text-white">{quest.rewardAmount} {quest.rewardToken}</span>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Time Left</p>
            <div className="flex items-center gap-1.5">
              <Clock size={14} className="text-red-400" />
              <span className="text-sm font-bold text-white">{daysLeft > 0 ? `${daysLeft}d` : 'Ended'}</span>
            </div>
          </div>
        </div>

        {/* Milestone Indicators */}
        <div className="space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-400 font-medium">Milestones Progress</span>
            <span className="text-red-500 font-bold">{isJoined ? `${participation.milestoneProgress.filter(m => m.completedAt).length}/${quest.milestones.length}` : `${quest.milestones.length} total`}</span>
          </div>
          <div className="flex gap-1.5">
            {quest.milestones.map((ms, i) => {
              const isCompleted = isJoined && !!participation.milestoneProgress[i].completedAt;
              return (
                <div 
                  key={ms.id} 
                  className={cn(
                    "h-1.5 flex-1 rounded-full transition-all duration-500",
                    isCompleted ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]" : "bg-red-900/20"
                  )} 
                />
              );
            })}
          </div>
        </div>

        {/* Action Button / Progress */}
        {isJoined ? (
          <div className="pt-2">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-red-600/20 flex items-center justify-center border border-red-500/20">
                  <TrendingUp size={14} className="text-red-500" />
                </div>
                <span className="text-sm font-bold text-white">{progress}% Complete</span>
              </div>
              <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-400 hover:bg-red-500/10 p-0 h-auto font-bold text-xs">
                View Details <ArrowRight size={12} className="ml-1" />
              </Button>
            </div>
            <Progress value={progress} className="h-2 bg-red-900/20" indicatorClassName="bg-red-600 shadow-[0_0_10px_rgba(239,68,68,0.4)]" />
          </div>
        ) : (
          <Button 
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold h-12 rounded-xl shadow-lg shadow-red-900/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            onClick={() => onJoin && onJoin(quest.id)}
          >
            Join Quest
          </Button>
        )}

        {/* Footer Info */}
        <div className="pt-2 flex justify-between items-center border-t border-white/5">
          <div className="flex -space-x-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-6 h-6 rounded-full border-2 border-[#1A0808] bg-zinc-800 flex items-center justify-center text-[8px] font-bold text-gray-400">
                U{i}
              </div>
            ))}
            <div className="w-6 h-6 rounded-full border-2 border-[#1A0808] bg-red-900/40 flex items-center justify-center text-[8px] font-bold text-red-300">
              +12
            </div>
          </div>
          <p className="text-[10px] text-gray-500 font-medium">Verified by Trustless Work</p>
        </div>
      </CardContent>
    </Card>
  );
}

// Helper icons for the stats
function TrendingUp({ size, className }: { size?: number, className?: string }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  );
}
