import { nativeToScVal } from 'stellar-sdk';
import { EXPECTED_NETWORK, NetworkType, getNetworkConfig, isExpectedNetwork } from '@/lib/wallets';
import {
  invokeDripPoolContract,
  isDripPoolConfigured,
  signTransactionXdr,
  SorobanInvocationResult,
} from '@/lib/soroban';
import { TrustlessWorkClient } from '@/lib/escrow/trustlessWork';
import { TWSendTransactionResponse } from '@/lib/escrow/types';

export type DepositExecutionResult =
  | { kind: 'trustless-work'; result: TWSendTransactionResponse }
  | { kind: 'drip-pool'; result: SorobanInvocationResult };

export interface ExecuteDepositParams {
  walletAddress?: string | null;
  walletNetwork?: NetworkType | null;
  amount: string | number;
  escrowContractId?: string | null;
}

const STROOPS_PER_XLM = 10_000_000;

export function validateDepositPrerequisites({
  walletAddress,
  walletNetwork,
  amount,
  escrowContractId,
}: ExecuteDepositParams): number {
  if (!walletAddress) {
    throw new Error('Connect your Stellar wallet before depositing.');
  }

  if (!isExpectedNetwork(walletNetwork)) {
    throw new Error(
      `TrustQuest deposits run on ${getNetworkConfig(EXPECTED_NETWORK).displayName}. Switch your wallet to testnet and try again.`
    );
  }

  const parsedAmount = typeof amount === 'number' ? amount : Number(amount);
  if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
    throw new Error('Enter a deposit amount greater than zero.');
  }

  if (!escrowContractId && !isDripPoolConfigured()) {
    throw new Error(
      'Set NEXT_PUBLIC_TRUSTLESS_WORK_ESCROW_CONTRACT_ID or NEXT_PUBLIC_DRIP_POOL_CONTRACT_ID to a deployed Stellar testnet contract.'
    );
  }

  return parsedAmount;
}

export async function executeDeposit(params: ExecuteDepositParams): Promise<DepositExecutionResult> {
  const amount = validateDepositPrerequisites(params);
  const walletAddress = params.walletAddress!;

  if (params.escrowContractId) {
    const unsigned = await TrustlessWorkClient.fundEscrow({
      contractId: params.escrowContractId,
      signer: walletAddress,
      amount,
    });
    const unsignedXdr = unsigned.unsignedTransaction || unsigned.xdr;
    if (!unsignedXdr) {
      throw new Error('Trustless Work did not return an unsigned deposit transaction.');
    }

    const signedXdr = await signTransactionXdr(unsignedXdr, walletAddress);
    const result = await TrustlessWorkClient.sendSignedTransaction(signedXdr);
    return { kind: 'trustless-work', result };
  }

  const amountInStroops = Math.floor(amount * STROOPS_PER_XLM);
  const result = await invokeDripPoolContract(
    'deposit',
    [
      nativeToScVal(walletAddress, { type: 'address' }),
      nativeToScVal(amountInStroops, { type: 'i128' }),
    ],
    walletAddress
  );

  return { kind: 'drip-pool', result };
}

export async function executeWithdrawal(params: ExecuteDepositParams): Promise<DepositExecutionResult> {
  if (!params.walletAddress) throw new Error('Wallet not connected');
  
  if (params.escrowContractId) {
    // For Trustless Work, "withdrawal" is often a release request or a direct contract call 
    // depending on the escrow type. For now, we'll try the Drip Pool fallback if TW release isn't implemented.
    // However, if we have a contract ID, we should attempt to interact with it.
    throw new Error('Withdrawal for Trustless Work escrows must be handled via milestone release.');
  }

  if (!isDripPoolConfigured()) {
    throw new Error('Drip Pool contract not configured for withdrawal.');
  }

  const result = await invokeDripPoolContract(
    'withdraw',
    [
      nativeToScVal(params.walletAddress, { type: 'address' })
    ],
    params.walletAddress
  );

  return { kind: 'drip-pool', result };
}
