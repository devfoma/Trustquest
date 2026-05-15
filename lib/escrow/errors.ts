/**
 * Trustless Work Integration Errors
 */

export class EscrowError extends Error {
  constructor(message: string, public code: string, public details?: any) {
    super(message);
    this.name = 'EscrowError';
  }
}

export class EscrowDeploymentError extends EscrowError {
  constructor(message: string, details?: any) {
    super(message, 'DEPLOYMENT_FAILED', details);
  }
}

export class EscrowReleaseError extends EscrowError {
  constructor(message: string, details?: any) {
    super(message, 'RELEASE_FAILED', details);
  }
}

export class EscrowNotFoundError extends EscrowError {
  constructor(escrowId: string) {
    super(`Escrow ${escrowId} not found`, 'NOT_FOUND');
  }
}
