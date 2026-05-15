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
  amount: string; // BigInt string
  status?: 'pending' | 'approved' | 'released';
}

export interface TWCreateEscrowRequest {
  type: EscrowType;
  title: string;
  description: string;
  sponsor: string;
  recipient: string;
  arbitrator?: string;
  amount: string;
  assetCode: string;
  assetIssuer?: string;
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
