/**
 * Reward Eligibility Logic
 */

import { Quest, UserQuestParticipation } from '@/types/quest';

export function checkRewardEligibility(quest: Quest, participation: UserQuestParticipation): boolean {
  // Eligibility check: Are all milestones completed?
  const allMilestonesDone = quest.milestones.every(m => 
    participation.milestoneProgress.find(p => p.milestoneId === m.id)?.completedAt
  );
  
  // Optional: check streak requirements
  // const meetsStreak = participation.streakDays >= 30;
  
  return allMilestonesDone;
}
