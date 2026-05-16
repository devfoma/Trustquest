import { ApiResponse, DashboardData, Pool, UserPosition, TransactionState } from './types';

// API Configuration
const DEFAULT_API_URL = 'http://localhost:8000/api';

const normalizeApiUrl = (url: string): string => {
  const trimmedUrl = url.trim().replace(/\/+$/, '');
  return trimmedUrl || DEFAULT_API_URL;
};

const createApiBaseUrls = (url: string): string[] => {
  const normalizedUrl = normalizeApiUrl(url);
  const apiUrl = normalizedUrl.endsWith('/api') ? normalizedUrl : `${normalizedUrl}/api`;

  return Array.from(new Set([normalizedUrl, apiUrl]));
};

const API_BASE_URLS = createApiBaseUrls(
  process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    DEFAULT_API_URL
);

const warnedFallbackEndpoints = new Set<string>();

const fallbackDashboardData: DashboardData = {
  totalDeposits: '0',
  totalYield: '0',
  totalPrizesWon: '0',
  positions: [],
  subscriptions: [],
  recentTransactions: [],
  recentPayouts: [],
  vaults: [],
  loading: {
    positions: false,
    subscriptions: false,
    transactions: false,
    vaults: false,
  },
  errors: {},
};

const fallbackPools: Pool[] = [
  {
    id: 'p_1',
    name: 'USDC Savings Pool',
    status: 'active',
    startTime: Date.now() - 7 * 24 * 60 * 60 * 1000,
    endTime: Date.now() + 23 * 24 * 60 * 60 * 1000,
    interestRate: 5.5,
    totalDeposits: '12500.00',
    participantCount: 42,
    token: {
      address: 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335XOPHBOUZONZOSZORB73YSUCD', // Mock USDC
      symbol: 'USDC',
      decimals: 7,
    },
  },
  {
    id: 'p_2',
    name: 'XLM Prize Sprint',
    status: 'active',
    startTime: Date.now() - 2 * 24 * 60 * 60 * 1000,
    endTime: Date.now() + 5 * 24 * 60 * 60 * 1000,
    interestRate: 3.2,
    totalDeposits: '45000.00',
    participantCount: 128,
    token: {
      address: 'native',
      symbol: 'XLM',
      decimals: 7,
    },
  },
  {
    id: 'p_3',
    name: 'ARST Growth Pool',
    status: 'active',
    startTime: Date.now() - 15 * 24 * 60 * 60 * 1000,
    endTime: Date.now() + 15 * 24 * 60 * 60 * 1000,
    interestRate: 8.0,
    totalDeposits: '8900.50',
    participantCount: 15,
    token: {
      address: 'GB...ARST',
      symbol: 'ARST',
      decimals: 7,
    },
  }
];

const fallbackPositions: UserPosition[] = [
  {
    id: 'pos_1',
    vaultId: 'p_1',
    poolId: 'p_1',
    userAddress: 'GD...USER',
    principalAmount: '100.00',
    currentAmount: '102.50',
    yieldEarned: '2.50',
    totalAmount: '102.50',
    interestEarned: '2.50',
    tokenSymbol: 'USDC',
    isEligible: true,
    ticketsCount: 100,
    depositedAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
    lastYieldAt: Date.now(),
    status: 'active',
  }
];

const fallbackTransactions: TransactionState[] = [];

const createApiResponse = <T>(data: T): ApiResponse<T> => ({
  data,
  success: true,
  timestamp: Date.now(),
});

const getFallbackResponse = <T>(endpoint: string, method: string = 'GET'): ApiResponse<T> | null => {
  const pathname = endpoint.split('?')[0];

  if (method === 'GET') {
    if (pathname === '/dashboard/summary') {
      return createApiResponse(fallbackDashboardData as T);
    }
    if (pathname === '/pools') {
      return createApiResponse(fallbackPools as T);
    }
    if (pathname === '/positions') {
      return createApiResponse(fallbackPositions as T);
    }
    if (pathname === '/actions') {
      return createApiResponse(fallbackTransactions as T);
    }
  }

  if (method === 'POST' && pathname === '/actions') {
    return createApiResponse({ id: `tx_${Math.random().toString(36).substr(2, 9)}` } as T);
  }

  return null;
};

const warnFallbackOnce = (endpoint: string) => {
  if (warnedFallbackEndpoints.has(endpoint)) return;

  warnedFallbackEndpoints.add(endpoint);
  console.warn(
    `API unavailable at ${API_BASE_URLS.join(', ')}; using fallback data for ${endpoint}. ` +
      'Start the backend or set NEXT_PUBLIC_API_BASE_URL/NEXT_PUBLIC_API_URL.'
  );
};

// Generic API wrapper
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  let requestError: unknown;

  try {
    for (const apiBaseUrl of API_BASE_URLS) {
      const response = await fetch(`${apiBaseUrl}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        requestError = new Error(`HTTP error! status: ${response.status}`);
        continue;
      }

      const data = await response.json();
      return data;
    }

    throw requestError || new Error('API request failed');
  } catch (error) {
    requestError = error;
    const method = options.method?.toUpperCase() || 'GET';
    const fallbackResponse = getFallbackResponse<T>(endpoint, method);

    if (fallbackResponse) {
      warnFallbackOnce(endpoint);
      return fallbackResponse;
    }

    console.error(`API request failed for ${endpoint}:`, requestError);
    throw requestError;
  }
}

// Dashboard API
export async function getDashboardData(walletAddress: string): Promise<ApiResponse<DashboardData>> {
  return apiRequest<DashboardData>(`/dashboard/summary?wallet=${walletAddress}`);
}

// Pools API
export async function getPools(): Promise<ApiResponse<Pool[]>> {
  return apiRequest<Pool[]>('/pools');
}

export async function getPool(poolId: string): Promise<ApiResponse<Pool>> {
  return apiRequest<Pool>(`/pools/${poolId}`);
}

// User Positions API
export async function getUserPositions(walletAddress: string): Promise<ApiResponse<UserPosition[]>> {
  return apiRequest<UserPosition[]>(`/positions?wallet=${walletAddress}`);
}

// Transactions API
export async function getTransactions(
  walletAddress: string,
  status?: string,
  limit = 25
): Promise<ApiResponse<TransactionState[]>> {
  const params = new URLSearchParams({
    wallet: walletAddress,
    limit: limit.toString(),
  });
  
  if (status) {
    params.append('status', status);
  }

  return apiRequest<TransactionState[]>(`/actions?${params.toString()}`);
}

export async function createTransaction(
  walletAddress: string,
  type: string,
  payload: Record<string, any>
): Promise<ApiResponse<{ id: string }>> {
  return apiRequest<{ id: string }>('/actions', {
    method: 'POST',
    body: JSON.stringify({
      wallet_address: walletAddress,
      action_type: type,
      action_payload: payload,
    }),
  });
}

export async function updateTransaction(
  transactionId: string,
  txHash: string
): Promise<ApiResponse<void>> {
  return apiRequest<void>(`/actions/${transactionId}/submitted`, {
    method: 'PATCH',
    body: JSON.stringify({ tx_hash: txHash }),
  });
}

export async function cancelTransaction(
  transactionId: string,
  errorCode: string,
  errorDetail?: string
): Promise<ApiResponse<void>> {
  return apiRequest<void>(`/actions/${transactionId}/cancel`, {
    method: 'POST',
    body: JSON.stringify({
      error_code: errorCode,
      error_detail: errorDetail,
    }),
  });
}

// Utility function to format API errors
export function formatApiError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unexpected error occurred';
}
