/**
 * Trustless Work Integration Configuration
 */

export const TW_CONFIG = {
  API_BASE_URL: process.env.NEXT_PUBLIC_TRUSTLESS_WORK_API || 'https://api.trustlesswork.com',
  VERSION: 'v1',
  ENDPOINTS: {
    DEPLOY: {
      SINGLE: '/deployer/single-release',
      MULTI: '/deployer/multi-release',
    },
    ESCROW: (type: string, id: string) => `/escrow/${type}/${id}`,
    RELEASE: (type: string) => `/escrow/${type}/release-funds`,
    DISPUTE: (type: string) => `/escrow/${type}/dispute`,
  },
  DEFAULT_ASSET: 'USDC',
  NETWORK: process.env.NEXT_PUBLIC_STELLAR_NETWORK || 'testnet',
};
