/**
 * Trustless Work Data Mapper
 * 
 * Maps domain objects to API-specific request/response objects.
 */

import { TWCreateEscrowRequest, TWMilestone } from './types';
import { Challenge, Milestone } from '@/types/challenge';

export const EscrowMapper = {
  /**
   * Maps a Challenge domain object to a Trustless Work creation request
   */
  toCreateRequest: (challenge: Challenge, recipientAddress: string): TWCreateEscrowRequest => {
    return {
      type: 'multi-release',
      title: challenge.title,
      description: challenge.description,
      sponsor: challenge.sponsorAddress,
      recipient: recipientAddress,
      amount: challenge.rewardAmount.toString(),
      assetCode: challenge.rewardToken,
      milestones: challenge.milestones.map(m => ({
        description: m.description,
        amount: (challenge.rewardAmount / challenge.milestones.length).toString()
      }))
    };
  },

  /**
   * Maps TW Milestone to domain Milestone
   */
  toDomainMilestone: (twMilestone: TWMilestone, index: number): Partial<Milestone> => {
    return {
      description: twMilestone.description,
      targetAmount: parseFloat(twMilestone.amount),
      isCompleted: twMilestone.status === 'released'
    };
  }
};
