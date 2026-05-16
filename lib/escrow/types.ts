/**
 * Trustless Work API Types
 */

export type EscrowType = 'single-release' | 'multi-release' | 'milestone-based';

export interface TWEscrowParticipant {
  address: string;
  role: 'sponsor' | 'recipient' | 'arbitrator';
}

export interface TWMilestone {
  description: string;
  amount?: string; // BigInt string
  receiver?: string;
  status?: 'pending' | 'approved' | 'released';
}

export interface TWCreateEscrowRequest {
  type?: EscrowType;
  signer?: string;
  engagementId?: string;
  title: string;
  description: string;
  sponsor?: string;
  recipient?: string;
  arbitrator?: string;
  amount?: string | number;
  assetCode?: string;
  assetIssuer?: string;
  roles?: Record<string, string>;
  platformFee?: number;
  trustline?: { symbol?: string; name?: string; address: string };
  milestones?: TWMilestone[];
}

export interface TWCreateEscrowResponse {
  escrowId: string;
  type: EscrowType;
  xdr: string; // Unsigned transaction for funding
  status: 'initialized' | 'funded' | 'completed' | 'disputed';
}

export interface TWEscrowStatusResponse {
  escrowId: string;
  balance: string;
  status: string;
  participants: TWEscrowParticipant[];
  milestones: TWMilestone[];
}

export interface TWReleaseRequest {
  escrowId: string;
  recipient: string;
  milestoneIndex?: number;
}

export interface TWFundEscrowRequest {
  contractId: string;
  signer: string;
  amount: number;
}

export interface TWUnsignedTransactionResponse {
  status: 'SUCCESS' | 'FAILED';
  unsignedTransaction?: string;
  xdr?: string;
  message?: string;
  contractId?: string;
}

export interface TWSendTransactionResponse {
  status: 'SUCCESS' | 'FAILED';
  message?: string;
  contractId?: string;
  escrow?: unknown;
  txHash?: string;
}
