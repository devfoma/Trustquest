/**
 * Savings Tracker Logic
 * 
 * Tracks daily streaks and financial progress.
 */

import { UserQuestParticipation } from '@/types/quest';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function updateStreak(participation: UserQuestParticipation, depositAmount: number): number {
  const now = Date.now();
  const lastDeposit = participation.lastDepositAt || 0;
  
  if (depositAmount <= 0) return participation.streakDays;

  // If last deposit was yesterday
  const diff = now - lastDeposit;
  if (diff < MS_PER_DAY * 2 && diff >= MS_PER_DAY) {
    return participation.streakDays + 1;
  } 
  // If last deposit was today, keep streak
  else if (diff < MS_PER_DAY) {
    return participation.streakDays;
  }
  // Streak broken
  return 1;
}

export function calculateCurrentBalance(participation: UserQuestParticipation, newDeposit: number): number {
  return participation.currentBalance + newDeposit;
}
