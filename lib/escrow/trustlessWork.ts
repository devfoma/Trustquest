/**
 * Trustless Work Client
 *
 * Browser-safe client for Trustless Work EaaS. API calls go through the Next.js
 * route handler so the x-api-key stays server-side.
 */

import { TW_CONFIG } from './config';
import {
  TWCreateEscrowRequest,
  TWCreateEscrowResponse,
  TWEscrowStatusResponse,
  TWReleaseRequest,
  TWFundEscrowRequest,
  TWUnsignedTransactionResponse,
  TWSendTransactionResponse,
} from './types';
import { EscrowDeploymentError, EscrowReleaseError, EscrowNotFoundError } from './errors';

type ProxyMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

async function callTrustlessWork<T>(
  endpoint: string,
  method: ProxyMethod = 'POST',
  body?: unknown
): Promise<T> {
  const response = await fetch(TW_CONFIG.PROXY_PATH, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ endpoint, method, body }),
  });

  const payload = await response.json().catch(() => ({}));

  if (response.status === 404) {
    throw new EscrowNotFoundError(endpoint);
  }

  if (!response.ok || payload?.status === 'FAILED') {
    const message =
      payload?.message ||
      payload?.error ||
      `Trustless Work request failed with status ${response.status}`;
    throw new Error(message);
  }

  return payload as T;
}

const getUnsignedXdr = (response: TWUnsignedTransactionResponse): string => {
  const unsignedXdr = response.unsignedTransaction || response.xdr;
  if (!unsignedXdr) {
    throw new Error('Trustless Work did not return an unsigned transaction');
  }
  return unsignedXdr;
};

export const TrustlessWorkClient = {
  /**
   * Deploys a new escrow via Trustless Work and returns the unsigned XDR.
   */
  async createEscrow(request: TWCreateEscrowRequest): Promise<TWCreateEscrowResponse> {
    try {
      const endpoint = request.milestones && request.milestones.length > 1
        ? TW_CONFIG.ENDPOINTS.DEPLOY.MULTI
        : TW_CONFIG.ENDPOINTS.DEPLOY.SINGLE;

      const response = await callTrustlessWork<TWUnsignedTransactionResponse>(
        endpoint,
        'POST',
        request
      );

      return {
        escrowId: response.contractId || request.engagementId || '',
        type: request.milestones && request.milestones.length > 1 ? 'multi-release' : 'single-release',
        xdr: getUnsignedXdr(response),
        status: 'initialized',
      };
    } catch (error) {
      if (error instanceof EscrowDeploymentError) throw error;
      throw new EscrowDeploymentError(
        error instanceof Error ? error.message : 'Network error during escrow creation',
        error
      );
    }
  },

  /**
   * Creates an unsigned fund-escrow transaction.
   */
  async fundEscrow(
    request: TWFundEscrowRequest,
    type: 'single-release' | 'multi-release' = 'single-release'
  ): Promise<TWUnsignedTransactionResponse> {
    return callTrustlessWork<TWUnsignedTransactionResponse>(
      TW_CONFIG.ENDPOINTS.FUND(type),
      'POST',
      request
    );
  },

  /**
   * Submits a wallet-signed XDR through Trustless Work's helper endpoint.
   */
  async sendSignedTransaction(signedXdr: string): Promise<TWSendTransactionResponse> {
    return callTrustlessWork<TWSendTransactionResponse>(
      TW_CONFIG.ENDPOINTS.SEND_TRANSACTION,
      'POST',
      { signedXdr }
    );
  },

  /**
   * Fetches status for a specific escrow.
   */
  async getStatus(type: string, escrowId: string): Promise<TWEscrowStatusResponse> {
    return callTrustlessWork<TWEscrowStatusResponse>(TW_CONFIG.ENDPOINTS.ESCROW(type, escrowId), 'GET');
  },

  /**
   * Requests fund release for a milestone or full escrow.
   */
  async releaseFunds(type: string, request: TWReleaseRequest): Promise<{ xdr: string }> {
    try {
      const response = await callTrustlessWork<TWUnsignedTransactionResponse>(
        TW_CONFIG.ENDPOINTS.RELEASE(type),
        'POST',
        request
      );

      return { xdr: getUnsignedXdr(response) };
    } catch (error) {
      if (error instanceof EscrowReleaseError) throw error;
      throw new EscrowReleaseError(
        error instanceof Error ? error.message : 'Network error during fund release',
        error
      );
    }
  },

  /**
   * Disputes an escrow payout.
   */
  async dispute(type: string, escrowId: string, reason: string): Promise<{ xdr: string }> {
    const response = await callTrustlessWork<TWUnsignedTransactionResponse>(
      TW_CONFIG.ENDPOINTS.DISPUTE(type),
      'POST',
      { escrowId, reason }
    );

    return { xdr: getUnsignedXdr(response) };
  },
};
