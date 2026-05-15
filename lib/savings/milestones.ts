/**
 * Milestone Verification Logic
 */

import { Milestone, UserQuestParticipation } from '@/types/quest';

export function verifyMilestone(milestone: Milestone, currentBalance: number): boolean {
  // Logic to verify if a milestone's financial target has been met
  return currentBalance >= milestone.targetAmount;
}

export function getNextPendingMilestone(milestones: Milestone[], progress: { milestoneId: string, completedAt?: number }[]): Milestone | undefined {
  return milestones.find(m => !progress.find(p => p.milestoneId === m.id)?.completedAt);
}
