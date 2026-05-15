/**
 * Quest Lifecycle Logic
 * 
 * Handles user enrollment and exit from savings quests.
 */

import { Quest, UserQuestParticipation } from '@/types/quest';

export function initializeParticipation(quest: Quest, userAddress: string): UserQuestParticipation {
  return {
    questId: quest.id,
    userAddress,
    currentBalance: 0,
    streakDays: 0,
    milestoneProgress: quest.milestones.map(m => ({ milestoneId: m.id })),
    isEligibleForReward: false,
    joinedAt: Date.now()
  };
}

export function canJoinQuest(quest: Quest, currentParticipants: number): boolean {
  // Check if quest is active and not full
  return quest.status === 'ACTIVE' && quest.escrowStatus === 'FUNDED';
}
