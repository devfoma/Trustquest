/**
 * Savings Challenge Logic Lib
 * 
 * This module handles the logic for tracking savings streaks and milestone completion.
 * Following architecture rules: Business logic for savings.
 */

import { Challenge, Milestone, UserParticipation } from '@/types/challenge';

/**
 * Checks if a user has completed a specific milestone
 * @param milestone The milestone to check
 * @param currentBalance The user's current savings balance
 * @returns boolean indicating if milestone is met
 */
export function isMilestoneMet(milestone: Milestone, currentBalance: number): boolean {
  // Simple check: if balance is greater or equal to target
  // In a real app, this might check for a specific history of deposits
  return currentBalance >= milestone.targetAmount;
}

/**
 * Calculates the overall progress percentage for a challenge participation
 */
export function calculateParticipationProgress(challenge: Challenge, participation: UserParticipation): number {
  if (challenge.milestones.length === 0) return 0;
  
  const completedCount = participation.milestoneProgress.filter(mp => mp.completedAt).length;
  return Math.round((completedCount / challenge.milestones.length) * 100);
}

/**
 * Verifies if a user is eligible for the final reward
 */
export function verifyRewardEligibility(challenge: Challenge, participation: UserParticipation): boolean {
  // Eligibility rule: All milestones must be completed
  const allMilestonesCompleted = challenge.milestones.every(milestone => 
    participation.milestoneProgress.some(mp => mp.milestoneId === milestone.id && mp.completedAt)
  );
  
  return allMilestonesCompleted;
}
