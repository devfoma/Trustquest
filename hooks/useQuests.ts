/**
 * useQuests Hook
 * 
 * Provides a React-friendly interface to the Quest Service.
 */

import { useState, useEffect, useCallback } from 'react';
import * as QuestService from '@/services/questService';
import { Quest, UserQuestParticipation } from '@/types/quest';
import { invokeDripPoolContract, isDripPoolConfigured, signTransactionXdr } from '@/lib/soroban';
import { nativeToScVal } from 'stellar-sdk';
import { TrustlessWorkClient } from '@/lib/escrow/trustlessWork';
import { TW_CONFIG } from '@/lib/escrow/config';
import { EXPECTED_NETWORK, getNetworkConfig, isExpectedNetwork } from '@/lib/wallets';
import { useWalletConnection } from './useWalletConnection';

export function useChallenges(userAddress?: string | null) {
  const { state: walletState } = useWalletConnection();
  const [quests, setQuests] = useState<Quest[]>([]);
  const [userParticipations, setUserParticipations] = useState<UserQuestParticipation[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQuests = useCallback(async () => {
    try {
      setLoading(true);
      const data = QuestService.getAllChallenges(); // Keeping name for compatibility or updating if service updated
      setQuests(data);
    } catch (err) {
      setError('Failed to fetch quests');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuests();
  }, [fetchQuests]);

  const createNewQuest = async (
    title: string,
    description: string,
    rewardAmount: number,
    rewardToken: string,
    milestones: number[]
  ) => {
    if (actionLoading) return;
    if (!userAddress) {
      setError('Connect your Stellar wallet before creating a quest.');
      return;
    }
    if (!isExpectedNetwork(walletState.network)) {
      setError(`Switch your wallet to ${getNetworkConfig(EXPECTED_NETWORK).displayName} before creating a quest.`);
      return;
    }
    if (!Number.isFinite(rewardAmount) || rewardAmount <= 0) {
      setError('Enter a reward amount greater than zero.');
      return;
    }
    if (!milestones.length || milestones.some(target => !Number.isFinite(target) || target <= 0)) {
      setError('Enter a valid savings goal before creating a quest.');
      return;
    }

    setActionLoading(true);
    setError(null);
    try {
      const engagementId = `quest-${Date.now()}`;
      const rewardTokenSymbol = rewardToken.toUpperCase();
      const milestoneAmount = Number((rewardAmount / milestones.length).toFixed(7));
      const escrow = await TrustlessWorkClient.createEscrow({
        signer: userAddress,
        engagementId,
        title,
        description,
        roles: {
          approver: userAddress,
          serviceProvider: userAddress,
          platformAddress: userAddress,
          releaseSigner: userAddress,
          disputeResolver: userAddress,
        },
        amount: rewardAmount,
        platformFee: 0,
        milestones: milestones.map((target, index) => ({
          description: `Save ${target} ${rewardToken} by milestone ${index + 1}`,
          amount: milestoneAmount.toString(),
          receiver: userAddress,
        })),
        trustline: {
          symbol: rewardTokenSymbol,
          address: TW_CONFIG.USDC_TESTNET_ISSUER,
        },
      });
      const signedXdr = await signTransactionXdr(escrow.xdr, userAddress);
      const submitted = await TrustlessWorkClient.sendSignedTransaction(signedXdr);
      const escrowId = submitted.contractId || escrow.escrowId || engagementId;

      const newQuest = await QuestService.createChallenge(
        title,
        description,
        userAddress,
        rewardAmount,
        rewardToken,
        milestones,
        escrowId
      );
      setQuests(prev => [...prev, newQuest]);
      return newQuest;
    } catch (err) {
      console.error('Failed to create quest:', err);
      const message = err instanceof Error ? err.message : 'Failed to create quest';
      setError(message);
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  const join = async (questId: string) => {
    if (actionLoading) return;
    if (!userAddress) {
      setError('Connect your Stellar wallet before joining a quest.');
      return;
    }
    if (!isExpectedNetwork(walletState.network)) {
      setError(`Switch your wallet to ${getNetworkConfig(EXPECTED_NETWORK).displayName} before joining a quest.`);
      return;
    }

    setActionLoading(true);
    setError(null);
    try {
      if (isDripPoolConfigured()) {
        await invokeDripPoolContract(
          "join",
          [
            nativeToScVal(userAddress, { type: "address" })
          ],
          userAddress
        );
      }

      const participation = await QuestService.joinChallenge(questId, userAddress);
      setUserParticipations(prev => {
        if (prev.some(p => p.questId === questId && p.userAddress === userAddress)) return prev;
        return [...prev, participation];
      });
      return participation;
    } catch (err) {
      console.error("Failed to join quest:", err);
      const message = err instanceof Error ? err.message : 'Failed to join quest';
      setError(message);
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  const updateProgress = async (questId: string, newBalance: number) => {
    if (!userAddress) return;
    try {
      const updated = await QuestService.updateProgress(questId, userAddress, newBalance);
      setUserParticipations(prev => 
        prev.map(p => p.questId === questId ? updated : p)
      );
      return updated;
    } catch (err) {
      setError('Failed to update progress');
    }
  };

  return {
    challenges: quests,
    userParticipations,
    loading,
    actionLoading,
    error,
    createNewQuest,
    join,
    updateProgress,
    refresh: fetchQuests
  };
}
