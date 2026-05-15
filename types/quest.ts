export type QuestStatus = 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export type EscrowStatus = 'PENDING' | 'FUNDED' | 'RELEASED' | 'DISPUTED';

export interface Milestone {
  id: string;
  description: string;
  targetAmount: number;
  deadline: number; // Timestamp
  isCompleted: boolean;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  sponsorAddress: string;
  rewardAmount: number;
  rewardToken: string; // e.g., 'USDC'
  status: QuestStatus;
  escrowId?: string;
  escrowStatus: EscrowStatus;
  milestones: Milestone[];
  createdAt: number;
  updatedAt: number;
}

export interface UserQuestParticipation {
  questId: string;
  userAddress: string;
  currentBalance: number;
  streakDays: number;
  lastDepositAt?: number;
  milestoneProgress: {
    milestoneId: string;
    completedAt?: number;
  }[];
  isEligibleForReward: boolean;
  joinedAt: number;
}
