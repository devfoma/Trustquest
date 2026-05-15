/**
 * Escrow Integration Test Script
 * 
 * Run this to verify the Trustless Work integration.
 */

import { EscrowService } from '../services/escrowService';
import { Quest } from '../types/quest';

async function testEscrowFlow() {
  console.log('--- Starting Escrow Verification ---');

  const mockQuest: Quest = {
    id: 'test_quest_1',
    title: 'Verification Quest',
    description: 'Testing the Trustless Work integration',
    sponsorAddress: 'G_TEST_SPONSOR',
    rewardAmount: 100,
    rewardToken: 'USDC',
    status: 'DRAFT',
    escrowStatus: 'PENDING',
    milestones: [],
    createdAt: Date.now(),
    updatedAt: Date.now()
  };

  try {
    console.log('1. Testing createEscrowForChallenge...');
    const createRes = await EscrowService.createEscrowForChallenge(mockQuest, 'G_RECIPIENT');
    console.log('✅ Success! Escrow ID:', createRes.escrowId);
    console.log('✅ XDR (Unsigned Funding Transaction):', createRes.xdr.substring(0, 50) + '...');

    console.log('\n2. Testing getEscrowStatus...');
    const statusRes = await EscrowService.getEscrowStatus('multi-release', createRes.escrowId);
    console.log('✅ Success! Remote Status:', statusRes.status);
    console.log('✅ Remote Balance:', statusRes.balance);

    console.log('\n--- Escrow System is OPERATIONAL ---');
  } catch (error: any) {
    console.error('❌ Escrow Verification FAILED');
    console.error('Error Details:', error.message);
  }
}

// In a real environment, you'd run this with ts-node or similar
// For this environment, we'll export it for manual trigger if needed
export { testEscrowFlow };
