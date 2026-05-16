import { NextRequest, NextResponse } from 'next/server';
import { TW_CONFIG } from '@/lib/escrow/config';

const ALLOWED_ENDPOINTS = new Set([
  TW_CONFIG.ENDPOINTS.DEPLOY.SINGLE,
  TW_CONFIG.ENDPOINTS.DEPLOY.MULTI,
  TW_CONFIG.ENDPOINTS.FUND('single-release'),
  TW_CONFIG.ENDPOINTS.FUND('multi-release'),
  TW_CONFIG.ENDPOINTS.RELEASE('single-release'),
  '/escrow/multi-release/release-milestone-funds',
  TW_CONFIG.ENDPOINTS.DISPUTE('single-release'),
  '/escrow/multi-release/dispute-milestone',
  TW_CONFIG.ENDPOINTS.SEND_TRANSACTION,
  TW_CONFIG.ENDPOINTS.ESCROWS_BY_SIGNER,
  TW_CONFIG.ENDPOINTS.ESCROWS_BY_ROLE,
]);

const isAllowedEndpoint = (endpoint: string) => {
  if (ALLOWED_ENDPOINTS.has(endpoint)) return true;
  if (endpoint.startsWith('/escrow/single-release/') || endpoint.startsWith('/escrow/multi-release/')) return true;
  return endpoint.startsWith('/helper/get-escrow-by-contract-ids');
};

export async function POST(request: NextRequest) {
  const apiKey = process.env.TRUSTLESS_WORK_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { status: 'FAILED', message: 'TRUSTLESS_WORK_API_KEY is not configured' },
      { status: 500 }
    );
  }

  const { endpoint, method = 'POST', body } = await request.json().catch(() => ({}));

  if (typeof endpoint !== 'string' || !endpoint.startsWith('/') || endpoint.includes('://')) {
    return NextResponse.json(
      { status: 'FAILED', message: 'Invalid Trustless Work endpoint' },
      { status: 400 }
    );
  }

  if (!isAllowedEndpoint(endpoint)) {
    return NextResponse.json(
      { status: 'FAILED', message: 'Trustless Work endpoint is not allowed by this proxy' },
      { status: 403 }
    );
  }

  const upstream = await fetch(`${TW_CONFIG.API_BASE_URL}${endpoint}`, {
    method,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
    },
    body: method === 'GET' ? undefined : JSON.stringify(body ?? {}),
    cache: 'no-store',
  });

  const contentType = upstream.headers.get('content-type') || '';
  const payload = contentType.includes('application/json')
    ? await upstream.json().catch(() => ({}))
    : { status: upstream.ok ? 'SUCCESS' : 'FAILED', message: await upstream.text() };

  return NextResponse.json(payload, { status: upstream.status });
}
