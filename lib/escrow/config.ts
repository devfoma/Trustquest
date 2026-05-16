/**
 * Trustless Work Integration Configuration
 */

export const TW_CONFIG = {
  API_BASE_URL: process.env.TRUSTLESS_WORK_API_BASE_URL || 'https://dev.api.trustlesswork.com',
  PROXY_PATH: '/api/trustless-work',
  VERSION: 'v1',
  ENDPOINTS: {
    DEPLOY: {
      SINGLE: '/deployer/single-release',
      MULTI: '/deployer/multi-release',
    },
    FUND: (type: string) => `/escrow/${type}/fund-escrow`,
    ESCROWS_BY_SIGNER: '/helper/get-escrows-by-signer',
    ESCROWS_BY_ROLE: '/helper/get-escrows-by-role',
    SEND_TRANSACTION: '/helper/send-transaction',
    ESCROW: (type: string, id: string) => `/escrow/${type}/${id}`,
    RELEASE: (type: string) => `/escrow/${type}/release-funds`,
    DISPUTE: (type: string) => `/escrow/${type}/dispute-escrow`,
  },
  DEFAULT_ASSET: 'USDC',
  USDC_TESTNET_ISSUER: 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5',
  NETWORK: 'testnet',
};
