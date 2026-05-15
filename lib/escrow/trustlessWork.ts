/**
 * Trustless Work Client
 * 
 * Low-level API client for Trustless Work EaaS.
 * Wraps external API calls inside an abstraction layer.
 */

import { TW_CONFIG } from './config';
import { 
  TWCreateEscrowRequest, 
  TWCreateEscrowResponse, 
  TWEscrowStatusResponse,
  TWReleaseRequest 
} from './types';
import { EscrowDeploymentError, EscrowReleaseError, EscrowNotFoundError } from './errors';

export const TrustlessWorkClient = {
  /**
   * Deploys a new escrow via TW API
   */
  async createEscrow(request: TWCreateEscrowRequest): Promise<TWCreateEscrowResponse> {
    try {
      const endpoint = request.milestones 
        ? TW_CONFIG.ENDPOINTS.DEPLOY.MULTI 
        : TW_CONFIG.ENDPOINTS.DEPLOY.SINGLE;

      const response = await fetch(`${TW_CONFIG.API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new EscrowDeploymentError('Failed to initialize escrow', errorData);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof EscrowDeploymentError) throw error;
      throw new EscrowDeploymentError('Network error during escrow creation', error);
    }
  },

  /**
   * Fetches status for a specific escrow
   */
  async getStatus(type: string, escrowId: string): Promise<TWEscrowStatusResponse> {
    const response = await fetch(`${TW_CONFIG.API_BASE_URL}${TW_CONFIG.ENDPOINTS.ESCROW(type, escrowId)}`);
    
    if (response.status === 404) throw new EscrowNotFoundError(escrowId);
    if (!response.ok) throw new Error(`Failed to fetch escrow status: ${response.statusText}`);

    return await response.json();
  },

  /**
   * Requests fund release for a milestone or full escrow
   */
  async releaseFunds(type: string, request: TWReleaseRequest): Promise<{ xdr: string }> {
    try {
      const response = await fetch(`${TW_CONFIG.API_BASE_URL}${TW_CONFIG.ENDPOINTS.RELEASE(type)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new EscrowReleaseError('Fund release request failed', errorData);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof EscrowReleaseError) throw error;
      throw new EscrowReleaseError('Network error during fund release', error);
    }
  },

  /**
   * Disputes an escrow payout
   */
  async dispute(type: string, escrowId: string, reason: string): Promise<{ xdr: string }> {
    const response = await fetch(`${TW_CONFIG.API_BASE_URL}${TW_CONFIG.ENDPOINTS.DISPUTE(type)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ escrowId, reason })
    });

    if (!response.ok) throw new Error('Dispute request failed');
    return await response.json();
  }
};
