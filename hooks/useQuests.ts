/**
 * useQuests Hook
 * 
 * Provides a React-friendly interface to the Quest Service.
 */

import { useState, useEffect, useCallback } from 'react';
import * as QuestService from '@/services/questService';
import { Quest, UserQuestParticipation } from '@/types/quest';

export function useChallenges(userAddress?: string | null) {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [userParticipations, setUserParticipations] = useState<UserQuestParticipation[]>([]);
  const [loading, setLoading] = useState(true);
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
    if (!userAddress) return;
    try {
      const newQuest = await QuestService.createChallenge(
        title,
        description,
        userAddress,
        rewardAmount,
        rewardToken,
        milestones
      );
      setQuests(prev => [...prev, newQuest]);
      return newQuest;
    } catch (err) {
      setError('Failed to create quest');
    }
  };

  const join = async (questId: string) => {
    if (!userAddress) return;
    try {
      const participation = await QuestService.joinChallenge(questId, userAddress);
      setUserParticipations(prev => [...prev, participation]);
      return participation;
    } catch (err) {
      setError('Failed to join quest');
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
    error,
    createNewQuest,
    join,
    updateProgress,
    refresh: fetchQuests
  };
}
