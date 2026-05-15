import { connectedPublicKey } from "./store";

const connectionState: {
  publicKey: string | undefined;
  provider: string | undefined;
} = {
  publicKey: undefined,
  provider: undefined,
};

function loadedPublicKey(): string | undefined {
  return connectionState.publicKey;
}

function loadedProvider(): string | undefined {
  return connectionState.provider;
}

function setConnection(publicKey: string, provider: string): void {
  connectionState.publicKey = publicKey;
  connectionState.provider = provider;

  if (typeof localStorage !== "undefined") {
    localStorage.setItem("publicKey", publicKey);
    localStorage.setItem("walletProvider", provider);
  }

  connectedPublicKey.set(publicKey);
}

function disconnect(): void {
  connectionState.publicKey = undefined;
  connectionState.provider = undefined;

  if (typeof localStorage !== "undefined") {
    localStorage.removeItem("publicKey");
    localStorage.removeItem("walletProvider");
  }

  connectedPublicKey.set("");
}

export async function checkAndNotifyFunding(): Promise<void> {
  // Check if we are in a test environment
  if (typeof process !== "undefined" && process.env.NODE_ENV === "test") return;

  const publicKey = loadedPublicKey();
  if (!publicKey) return;

  try {
    const { exists, balances } = await getWalletHealth();

    const minRequired = 1;
    const networkPass = (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_SOROBAN_NETWORK_PASSPHRASE : "") || "";
    const network = /Test/i.test(networkPass) ? "testnet" : "mainnet";

    if (!exists || balances.XLM < minRequired) {
      window.dispatchEvent(
        new CustomEvent("openFundingModal", {
          detail: { exists, balance: balances.XLM, network },
        }),
      );
    }
  } catch (_) {
    // Funding check is best-effort; swallow errors silently
  }
}

function initializeConnection(): void {
  if (typeof localStorage === "undefined") return;

  const storedPublicKey = localStorage.getItem("publicKey");
  const storedProvider = localStorage.getItem("walletProvider");

  if (storedPublicKey && storedProvider) {
    connectionState.publicKey = storedPublicKey;
    connectionState.provider = storedProvider;
    connectedPublicKey.set(storedPublicKey);

    // Check funding for returning users
    setTimeout(() => {
      checkAndNotifyFunding();
    }, 500);
  }
}

/**
 * Check if the connected wallet exists and has funds.
 * Returns { exists: boolean, balance: number }.
 */
async function getWalletHealth(): Promise<{
  exists: boolean;
  balances: { XLM: number; USDC: number };
}> {
  const publicKey = loadedPublicKey();
  const horizonUrl = (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_HORIZON_URL : "") || "";

  if (!publicKey || !horizonUrl) return { exists: false, balances: { XLM: 0, USDC: 0 } };

  try {
    const resp = await fetch(`${horizonUrl}/accounts/${publicKey}`, {
      headers: { Accept: "application/json" },
    });

    if (resp.status === 404) {
      return { exists: false, balances: { XLM: 0, USDC: 0 } };
    }

    if (!resp.ok) {
      return { exists: false, balances: { XLM: 0, USDC: 0 } };
    }

    const json = await resp.json();
    
    // Fetch XLM (native)
    const native = (json.balances || []).find(
      (b: any) => b.asset_type === "native",
    );
    const xlmBalance = native ? Number(native.balance) : 0;

    // Fetch USDC (Testnet/Mainnet check)
    const networkPass = (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_SOROBAN_NETWORK_PASSPHRASE : "") || "";
    const isTestnet = /Test/i.test(networkPass);
    const usdcIssuer = isTestnet 
      ? "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5" // Testnet
      : "GA5Z3V7PLRQR3S7SLSXYM6A5F6U3W3F43V7I5G47ZSX3S3G3C3G3C3G3"; // Mainnet placeholder (update if real)

    const usdc = (json.balances || []).find(
      (b: any) => b.asset_code === "USDC" && (b.issuer === usdcIssuer || !isTestnet),
    );
    const usdcBalance = usdc ? Number(usdc.balance) : 0;

    return { exists: true, balances: { XLM: xlmBalance, USDC: usdcBalance } };
  } catch (error) {
    console.error("Error checking wallet health:", error);
    return { exists: false, balances: { XLM: 0, USDC: 0 } };
  }
}

export {
  loadedPublicKey,
  loadedProvider,
  setConnection,
  disconnect,
  initializeConnection,
  getWalletHealth,
};
